import { NotFound } from 'http-errors';
import { intersectionWith, union } from 'lodash';
import { ObjectId } from 'mongodb';

import { isPlaylistRuleGroup, Playlist, PlaylistRule, PlaylistRuleGroup, RuleGroupType, RuleParam, RuleComparator } from '../../../shared';

import { User } from '../core/session/models';
import { doAndRetry } from '../core/session/session-util';

import * as spotifyService from './spotify-service';
import { getCurrentUser, getUserById } from './user-service';
import { spCache } from './spotify-service-cache';
import { db } from '../core/db/db';
import logger from '../core/logger/logger';


export async function getPlaylists() {
    const currentUser: User = await getCurrentUser();

    const playlists = await db.playlists.find({ userId: currentUser._id });
    return playlists;
}

export async function getPlaylistById(id: string) {
    const currentUser: User = await getCurrentUser();

    const objId = new ObjectId(id);
    const playlist: Playlist|null = await db.playlists.findOne({ userId: currentUser._id, _id: objId });

    if (!playlist) {
        throw new NotFound();
    }

    return playlist;
}

export async function updatePlaylist(id: string, playlist: Partial<Playlist>) {
    delete playlist._id;
    delete playlist.userId;

    playlist.updatedAt = new Date();

    const result = await db.playlists.update(
        { _id: new ObjectId(id) },
        { $set: playlist }
    );

    return result;
}

export async function createPlaylist(playlist: Playlist) {
    const currentUser: User = await getCurrentUser();

    const now = new Date();
    const newPlaylist: Playlist = {
        ...playlist,
        userId: currentUser._id,
        createdAt: now,
        updatedAt: now
    };
    const result = await db.playlists.insertOne(newPlaylist);

    return result;
}

export async function deletePlaylist(id: string) {
    const currentUser: User = await getCurrentUser();

    db.playlists.remove(
        { _id: new ObjectId(id), userId: currentUser._id },
        true
    );
}



export async function populateListByRules(rules: PlaylistRuleGroup[], accessToken: string|undefined): Promise<SpotifyApi.TrackObjectFull[]> {
    logger.debug('>>>> Entering populateListByRules()');

    const results: (SpotifyApi.TrackObjectFull[])[] = await Promise.all(
        rules.map((rule) => {
            return getListForRuleGroup(rule, accessToken, undefined);
        })
    );

    // logger.debug('Results, #1, ', results);

    const unionResult = union(...results);

    return unionResult;
}

async function getListForRuleGroup(
    ruleGroup: PlaylistRuleGroup,
    accessToken: string|undefined,
    currentBatchOfSongs: SpotifyApi.TrackObjectFull[]|undefined,
): Promise<SpotifyApi.TrackObjectFull[]> {
    logger.debug('>>>> Entering getListForRuleGroup()');

    if (ruleGroup.type === RuleGroupType.Or) {
        // Send each individual rule to getListForRules
        const listOfTrackResults = await Promise.all(
            ruleGroup.rules.map((rule) => {
                if (isPlaylistRuleGroup(rule)) {
                    return getListForRuleGroup(rule, accessToken, currentBatchOfSongs);
                } else {
                    return getListForRules([ rule ], accessToken, currentBatchOfSongs);
                }
            })
        );

        logger.debug('Query Results, OR path, ');
        // logger.debug(listOfTrackResults);

        // Get "OR" union
        const results = union(...listOfTrackResults);

        return results;
    } else {
        // Send batches of PlaylistRules to getListForRules, send individual PlaylistRuleGroups
        const straightRules: PlaylistRule[] = [];
        const nestedRuleGroups: PlaylistRuleGroup[] = [];

        ruleGroup.rules.map((rule) => {
            if (isPlaylistRuleGroup(rule)) {
                nestedRuleGroups.push(rule);
            } else {
                straightRules.push(rule);
            }
        });

        const listsOfTrackResults: (SpotifyApi.TrackObjectFull[])[] = [];

        // Do straight rules before nestedRuleGroups, then send results into call for nestedRuleGroups
        if (straightRules.length > 0) {
            const straightRuleResults = await getListForRules(straightRules, accessToken, currentBatchOfSongs);
            listsOfTrackResults.push(straightRuleResults);
        }

        const nestedRuleGroupResults: (SpotifyApi.TrackObjectFull[])[] = await Promise.all(
            nestedRuleGroups.map((rule) => {
                return getListForRuleGroup(rule, accessToken, listsOfTrackResults[0]);
            })
        );
        listsOfTrackResults.push(...nestedRuleGroupResults);

        logger.debug('Query Results, AND path...');
        // logger.debug(listsOfTrackResults[0][0]);
        // logger.debug(listsOfTrackResults[1][0]);

        if (listsOfTrackResults.length <= 1) {
            return listsOfTrackResults[0];
        }

        // Get "AND" intersection
        const results = getIntersectionOfTrackLists(listsOfTrackResults);
        return results;
    }
}

function getIntersectionOfTrackLists<T extends SpotifyApi.TrackObjectFull | SpotifyApi.TrackObjectSimplified>(listsOfTrackResults: (T[])[]): T[] {
    const listOne = listsOfTrackResults[0];
    const results = intersectionWith<T, T, T, T>(
        listOne,
        listOne,
        listOne,
        ...listsOfTrackResults,
        (a: T, b: T) => {
            return a.id === b.id;
        }
    );

    return results;
}

async function getListForRules(
    rules: PlaylistRule[],
    accessToken: string|undefined,
    currentBatchOfSongs: SpotifyApi.TrackObjectFull[]|undefined
): Promise<SpotifyApi.TrackObjectFull[]> {
    logger.debug('>>>> Entering getListForRules()');

    // Separate rules by those that can optionally be filtered from a list (Artist, Album, Genre, etc)
    // vs those that require their own fetch (My Saved, a Playlist)
    const canBeFilteredFromABatch: PlaylistRule[] = [];
    const requiresOwnFetch: PlaylistRule[] = [];
    rules.map((rule) => {
        if ([RuleParam.Artist, RuleParam.Album, RuleParam.Track, RuleParam.Genre, RuleParam.Year].includes(rule.param)) {
            canBeFilteredFromABatch.push(rule);
        } else {
            requiresOwnFetch.push(rule);
        }
    });

    // If there are none that require a fetch 
    if (requiresOwnFetch.length === 0) {
        // If working from a batch of songs
        if (currentBatchOfSongs) {
            // Filter list of songs by filterable rules
            const filteredBatch = await filterListOfSongs(currentBatchOfSongs, canBeFilteredFromABatch, accessToken);
            return filteredBatch;
        }

        // Else, we are NOT working from a batch, then fetch tracks
        const listsOfTrackResults: (SpotifyApi.TrackObjectFull[])[] = [];

        // Send special "is" rules through specific APIs, others through getFullSearchResults
        for (let i = rules.length - 1; i >= 0; i--) {
            const rule = rules[i];
            if (rule.comparator === RuleComparator.Is) {
                if (
                    (rule.param === RuleParam.Artist && typeof rule.value === 'object') ||
                    (rule.param === RuleParam.Album && typeof rule.value === 'object')
                ) {
                    const ruleResults = await getTracksForRule(rule, accessToken);
                    listsOfTrackResults.push(ruleResults);
                    rules.splice(i, 1);
                }
            }
        }

        const searchResults = await spotifyService.getFullSearchResults(rules, accessToken);
        if (searchResults) {
            listsOfTrackResults.push(searchResults.items);
        }

        // Union the results
        return getIntersectionOfTrackLists(listsOfTrackResults);

    } else {
        // Else, do fetch for each fetch-required rule
        const listsOfTrackResults: (SpotifyApi.TrackObjectFull[])[] = await Promise.all(
            requiresOwnFetch.map((rule) => getTracksForRule(rule, accessToken))
        );
        // Union the results
        const unionOfTrackResults = getIntersectionOfTrackLists(listsOfTrackResults);
        // And filter by the filter-able rules
        const filteredUnion = await filterListOfSongs(unionOfTrackResults, canBeFilteredFromABatch, accessToken);
        return filteredUnion;
    }
}

async function getTracksForRule(rule: PlaylistRule, accessToken: string|undefined): Promise<(SpotifyApi.TrackObjectFull)[]> {
    switch (rule.param) {
        case RuleParam.Saved:
            return await spotifyService.getFullMySavedTracks(accessToken);
        case RuleParam.Playlist:
            if (typeof rule.value === 'object') {
                return await spotifyService.getTracksForPlaylist(rule.value.id, accessToken);
            }
            break;
        case RuleParam.Artist:
            if (typeof rule.value === 'object') {
                return await spotifyService.getTracksForArtists([ rule.value.id ], accessToken);
            }
            break;
        case RuleParam.Album:
            if (typeof rule.value === 'object') {
                return await spotifyService.getTracksForAlbums([ rule.value.id ], accessToken);
            }
            break;
    }
    return [];
}

async function filterListOfSongs(trackList: SpotifyApi.TrackObjectFull[], rules: PlaylistRule[], accessToken: string|undefined) {
    const filtersByParam: { [s: string]: PlaylistRule } = rules.reduce((obj, item) => {
        obj[item.param] = item;
        return obj;
    }, {});

    let albumMap = {};
    let artistMap = {};
    // Resources only needed if Genre filter is set
    if (filtersByParam[RuleParam.Genre]) {
        const allAlbumIds: string[] = [];
        const allArtistIds: string[] = [];
        trackList.map((track) => {
            allAlbumIds.push(track.album.id);
            track.artists.map((artist) => {
                allArtistIds.push(artist.id);
            });
        });

        albumMap = await spCache.getAlbums(allAlbumIds, accessToken);
        artistMap = await spCache.getArtists(allArtistIds, accessToken);
    }

    const filteredList = trackList.filter((track) => {
        if (filtersByParam[RuleParam.Artist]) {
            const thisFilter = filtersByParam[RuleParam.Artist];
            const shouldPass = track.artists.some((artist) => {
                // Is logic:
                if (thisFilter.comparator === RuleComparator.Is && typeof thisFilter.value === 'object') {
                    return artist.id === thisFilter.value.id;
                }
                // Contains logic:
                if (thisFilter.comparator === RuleComparator.Contains && typeof thisFilter.value === 'string') {
                    return artist.name.toLowerCase().indexOf(thisFilter.value.toLowerCase()) > -1;
                }
                logger.warn('Did not find matching filter logic for stored filter value');
                logger.debug(thisFilter);
            });
            if (shouldPass === false) { return false; }
        }

        if (filtersByParam[RuleParam.Album]) {
            const thisFilter = filtersByParam[RuleParam.Album];
            let shouldPass;
            if (thisFilter.comparator === RuleComparator.Is && typeof thisFilter.value === 'object') {
                shouldPass = track.album.id === thisFilter.value.id;
            }
            if (thisFilter.comparator === RuleComparator.Contains && typeof thisFilter.value === 'string') {
                shouldPass = track.album.name.toLowerCase().indexOf(thisFilter.value.toLowerCase()) > -1;
            }
            if (shouldPass === false) { return false; }
        }

        if (filtersByParam[RuleParam.Track]) {
            const thisFilter = filtersByParam[RuleParam.Track];
            let shouldPass;
            if (thisFilter.comparator === RuleComparator.Is && typeof thisFilter.value === 'object') {
                shouldPass = track.id === thisFilter.value.id;
            }
            if (thisFilter.comparator === RuleComparator.Contains && typeof thisFilter.value === 'string') {
                shouldPass = track.name.toLowerCase().indexOf(thisFilter.value.toLowerCase()) > -1;
            }
            if (shouldPass === false) { return false; }
        }

        if (filtersByParam[RuleParam.Genre]) {
            const fullAlbum = albumMap[track.album.id];
            const fullArtists = track.artists.map((artist) => artistMap[artist.id]);

            let allGenres: string[] = [];
            if (fullAlbum) {
                allGenres = allGenres.concat(fullAlbum.genres);
            }
            fullArtists.map((artist) => {
                allGenres = allGenres.concat(artist.genres);
            });
            // logger.debug('all genres ::', allGenres);

            const thisFilter = filtersByParam[RuleParam.Genre];
            const shouldPass = allGenres.some((genre) => {
                if (thisFilter.comparator === RuleComparator.Is && typeof thisFilter.value === 'string') {
                    return genre.toLowerCase() === thisFilter.value.toLowerCase();
                }
                if (thisFilter.comparator === RuleComparator.Contains && typeof thisFilter.value === 'string') {
                    return genre.toLowerCase().indexOf(thisFilter.value.toLowerCase()) > -1;
                }
                logger.warn('Did not find matching filter logic for stored filter value');
                logger.debug(thisFilter);
            });
            if (shouldPass === false) { return false; }
        }

        // TODO
        if (filtersByParam[RuleParam.Year]) {

        }

        return true;
    });

    return filteredList;
}



export async function publishPlaylistById(id: string) {
    const playlist = await getPlaylistById(id);

    await publishPlaylist(playlist);
}

export async function preValidatePublishPlaylist(playlist: Playlist, accessToken: string|undefined) {
    logger.debug('>>>> Entering preValidatePublishPlaylist()');

    // User has deleted playlist. Do not publish on intervals, require user to re-publish manually
    if (playlist.deleted) {
        return;
    }

    // Has been published before
    if (playlist.spotifyPlaylistId) {
        const userHasPlaylist = await spotifyService.userHasPlaylist(playlist.userId.toString(), playlist.spotifyPlaylistId, accessToken);

        // User has deleted playlist since last publish
        if (!userHasPlaylist) {
            await updatePlaylist(playlist._id, { deleted: true });
            return;
        }
    }

    return publishPlaylist(playlist, accessToken);
}

export async function publishPlaylist(playlist: Playlist, accessToken?: string) {
    logger.info(`>>>> Entering publishPlaylist(playlist._id = ${playlist._id}`);
    
    const list = await populateListByRules(playlist.rules, accessToken);
    logger.debug('publishing playlist will have ', list.length, ' songs');

    let spotifyPlaylistId = playlist.spotifyPlaylistId;
    if (spotifyPlaylistId && !playlist.deleted) {
        // Remove all tracks from playlist
        await spotifyService.removeTracksFromPlaylist(spotifyPlaylistId, accessToken);
    } else {
        const newPlaylist = await spotifyService.createNewPlaylist(playlist.name, playlist.userId);
        spotifyPlaylistId = newPlaylist.id;
    }

    // Add tracks to playlist
    await spotifyService.addTracksToPlaylist(spotifyPlaylistId, list, accessToken);

    // Save last published date, spotifyPlaylistId (in case it changed)
    const playlistUpdate: Partial<Playlist> = {
        spotifyPlaylistId: spotifyPlaylistId,
        lastPublished: new Date(),
        deleted: false
    };
    await updatePlaylist(playlist._id, playlistUpdate);
}

export async function publishAllPlaylists() {
    logger.info('>>>> Entering publishAllPlaylists()');

    const playlists: Playlist[] = await db.playlists.find();
    for (const playlist of playlists) {
        try {
            const user = await getUserById(playlist.userId);
            if (user) {
                await doAndRetry(async (accessToken: string) => {
                    await preValidatePublishPlaylist(playlist, accessToken);
                }, user);
            }
        } catch (e) {
            logger.info('error publishing playlist', playlist._id.toString());
            logger.error(e);
        }
    }
}

