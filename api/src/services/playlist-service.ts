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



export async function populateListByRules(rules: PlaylistRuleGroup[], accessToken: string|undefined): Promise<SpotifyApi.TrackObjectSimplified[]> {
    logger.debug('>>>> Entering populateListByRules()');

    const results: (SpotifyApi.TrackObjectSimplified[])[] = await Promise.all(
        rules.map((rule) => {
            return getListForRuleGroup(rule, accessToken);
        })
    );

    // logger.debug('Results, #1, ', results);

    const unionResult = union(...results);

    return unionResult;
}

async function getListForRuleGroup(ruleGroup: PlaylistRuleGroup, accessToken: string|undefined): Promise<SpotifyApi.TrackObjectSimplified[]> {
    if (ruleGroup.type === RuleGroupType.Or) {
        // Send each individual rule to getListForRules
        const listOfTrackResults = await Promise.all(
            ruleGroup.rules.map((rule) => {
                if (isPlaylistRuleGroup(rule)) {
                    return getListForRuleGroup(rule, accessToken);
                } else {
                    return getListForRules([ rule ], accessToken);
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

        const listsOfTrackResults: (SpotifyApi.TrackObjectSimplified[])[] = await Promise.all(
            nestedRuleGroups.map((rule) => {
                return getListForRuleGroup(rule, accessToken);
            })
        );

        if (straightRules.length > 0) {
            const straightRuleResults = await getListForRules(straightRules, accessToken);
            listsOfTrackResults.push(straightRuleResults);
        }

        logger.debug('Query Results, AND path...');
        // logger.debug(listsOfTrackResults[0][0]);
        // logger.debug(listsOfTrackResults[1][0]);

        if (listsOfTrackResults.length <= 1) {
            return listsOfTrackResults[0];
        }

        // Get "AND" intersection
        const listOne = listsOfTrackResults[0];
        const results = intersectionWith<SpotifyApi.TrackObjectSimplified, SpotifyApi.TrackObjectSimplified, SpotifyApi.TrackObjectSimplified, SpotifyApi.TrackObjectSimplified>(
            listOne,
            listOne,
            listOne,
            ...listsOfTrackResults,
            (a: SpotifyApi.TrackObjectSimplified, b: SpotifyApi.TrackObjectSimplified) => {
                return a.id === b.id;
            }
        );

        return results;
    }
}

async function getListForRules(rules: PlaylistRule[], accessToken: string|undefined): Promise<SpotifyApi.TrackObjectSimplified[]> {
    logger.debug('>>>> Entering getListForRules()');
    
    // Bundle Saved rule with regular search rules (all but playlist)
    // if no Saved rule, do regular search
    // TODO: what about playlist rule

    const hasSavedRule: boolean = !!(rules.find(rule => rule.param === RuleParam.Saved));
    
    let results: SpotifyApi.TrackObjectSimplified[] = [];
    if (hasSavedRule) {
        results = await getFilteredListOfSavedSongs(rules, accessToken);
    } else {
        // Send special "is" rules through specific APIs, others through getFullSearchResults
        for (let i = rules.length - 1; i >= 0; i--) {
            const rule = rules[i];
            if (rule.comparator === RuleComparator.Is) {
                if (rule.param === RuleParam.Artist && typeof rule.value === 'object') {
                    const ruleResults = await spotifyService.getTracksForArtists([ rule.value.id ], accessToken);
                    results = results.concat(ruleResults);
                    rules.splice(i, 1);
                }
                if (rule.param === RuleParam.Album && typeof rule.value === 'object') {
                    const ruleResults = await spotifyService.getTracksForAlbums([ rule.value.id ], accessToken);
                    results = results.concat(ruleResults);
                    rules.splice(i, 1);
                }
            }
        }

        const searchResults = await spotifyService.getFullSearchResults(rules, accessToken);
        if (searchResults) {
            results = results.concat(searchResults.items);
        }
    }

    // logger.debug(results);
    return results;
}

async function getFilteredListOfSavedSongs(rules: PlaylistRule[], accessToken: string|undefined) {
    const savedTrackObjects = await spotifyService.getFullMySavedTracks(accessToken);

    if (!savedTrackObjects) { return []; }

    const savedTracks: SpotifyApi.TrackObjectFull[] = savedTrackObjects.items.map(item => item.track);

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
        savedTracks.map((track) => {
            allAlbumIds.push(track.album.id);
            track.artists.map((artist) => {
                allArtistIds.push(artist.id);
            });
        });

        albumMap = await spCache.getAlbums(allAlbumIds, accessToken);
        artistMap = await spCache.getArtists(allArtistIds, accessToken);
    }

    const filteredList = savedTracks.filter((track) => {
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
            logger.info('error publishing playlist', playlist._id);
            logger.error(e);
        }
    }
}

