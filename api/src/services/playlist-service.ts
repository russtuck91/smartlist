import { NotFound } from 'http-errors';
import { intersectionWith, union } from 'lodash';
import { ObjectId } from 'mongodb';

import { isPlaylistRuleGroup, Playlist, PlaylistRule, PlaylistRuleGroup, RuleGroupType, RuleParam } from '../../../shared';

import { User } from '../core/session/models';
import { doAndRetry } from '../core/session/session-util';

import * as spotifyService from './spotify-service';
import { getCurrentUser, getUserById } from './user-service';
import { spCache } from './spotify-service-cache';
import { db } from '../core/db/db';


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

    await db.playlists.update(
        { _id: new ObjectId(id) },
        { $set: playlist }
    );
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
    db.playlists.insertOne(newPlaylist);
}

export async function deletePlaylist(id: string) {
    const currentUser: User = await getCurrentUser();

    db.playlists.remove(
        { _id: new ObjectId(id), userId: currentUser._id },
        true
    );
}



export async function populateListByRules(rules: PlaylistRuleGroup[], accessToken: string|undefined): Promise<SpotifyApi.TrackObjectFull[]> {
    console.log('in populateListByRules');

    const results: (SpotifyApi.TrackObjectFull[])[] = await Promise.all(
        rules.map((rule) => {
            return getListForRuleGroup(rule, accessToken);
        })
    );

    // console.log('Results, #1, ', results);

    const unionResult = union(...results);

    return unionResult;
}

async function getListForRuleGroup(ruleGroup: PlaylistRuleGroup, accessToken: string|undefined): Promise<SpotifyApi.TrackObjectFull[]> {
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

        console.log('Query Results, OR path, ');
        // console.log(listOfTrackResults);

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

        const listsOfTrackResults: (SpotifyApi.TrackObjectFull[])[] = await Promise.all(
            nestedRuleGroups.map((rule) => {
                return getListForRuleGroup(rule, accessToken);
            })
        );

        if (straightRules.length > 0) {
            const straightRuleResults = await getListForRules(straightRules, accessToken);
            listsOfTrackResults.push(straightRuleResults);
        }

        console.log('Query Results, AND path...');
        // console.log(listsOfTrackResults[0][0]);
        // console.log(listsOfTrackResults[1][0]);

        if (listsOfTrackResults.length <= 1) {
            return listsOfTrackResults[0];
        }

        // Get "AND" intersection
        const listOne = listsOfTrackResults[0];
        const results = intersectionWith<SpotifyApi.TrackObjectFull, SpotifyApi.TrackObjectFull, SpotifyApi.TrackObjectFull, SpotifyApi.TrackObjectFull>(
            listOne,
            listOne,
            listOne,
            ...listsOfTrackResults,
            (a: SpotifyApi.TrackObjectFull, b: SpotifyApi.TrackObjectFull) => {
                return a.id === b.id;
            }
        );

        return results;
    }
}

async function getListForRules(rules: PlaylistRule[], accessToken: string|undefined): Promise<SpotifyApi.TrackObjectFull[]> {
    console.log('IN getListForRules');
    
    // Bundle Saved rule with regular search rules (all but playlist)
    // if no Saved rule, do regular search
    // TODO: what about playlist rule

    const hasSavedRule: boolean = !!(rules.find(rule => rule.param === RuleParam.Saved));
    
    let results: SpotifyApi.TrackObjectFull[]|undefined;
    if (hasSavedRule) {
        results = await getFilteredListOfSavedSongs(rules, accessToken);
    } else {
        const searchResults = await spotifyService.getFullSearchResults(rules, accessToken);
        results = searchResults && searchResults.items;
    }

    if (!results) { return []; }

    // console.log(results);
    return results;
}

async function getFilteredListOfSavedSongs(rules: PlaylistRule[], accessToken: string|undefined) {
    const savedTrackObjects = await spotifyService.getFullMySavedTracks(accessToken);

    if (!savedTrackObjects) { return []; }

    const savedTracks: SpotifyApi.TrackObjectFull[] = savedTrackObjects.items.map(item => item.track);

    const filterObj = rules.reduce((obj, item) => {
        obj[item.param] = item.value;
        return obj;
    }, {});

    let albumMap = {};
    let artistMap = {};
    // Resources only needed if Genre filter is set
    if (filterObj[RuleParam.Genre]) {
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
        if (filterObj[RuleParam.Artist]) {
            const thisFilter = track.artists.some((artist) => {
                return artist.name.toLowerCase() === filterObj[RuleParam.Artist].toLowerCase();
                // contains logic:
                // return artist.name.toLowerCase().indexOf(filterObj[RuleParam.Artist].toLowerCase()) > -1;
            });
            if (!thisFilter) { return false; }
        }

        if (filterObj[RuleParam.Album]) {
            const thisFilter = track.album.name.toLowerCase() === filterObj[RuleParam.Album].toLowerCase();
            if (!thisFilter) { return false; }
        }

        if (filterObj[RuleParam.Track]) {
            const thisFilter = track.name.toLowerCase() === filterObj[RuleParam.Track].toLowerCase();
            if (!thisFilter) { return false; }
        }

        if (filterObj[RuleParam.Genre]) {
            const fullAlbum = albumMap[track.album.id];
            const fullArtists = track.artists.map((artist) => artistMap[artist.id]);

            let allGenres: string[] = [];
            if (fullAlbum) {
                allGenres = allGenres.concat(fullAlbum.genres);
            }
            fullArtists.map((artist) => {
                allGenres = allGenres.concat(artist.genres);
            });
            // console.log('all genres ::', allGenres);

            const thisFilter = allGenres.some((genre) => genre.toLowerCase() === filterObj[RuleParam.Genre].toLowerCase());
            if (!thisFilter) { return false; }
        }

        // TODO
        if (filterObj[RuleParam.Year]) {

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
    console.log('in preValidatePublishPlaylist');

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
    console.log('in publishPlaylist. ID :: ', playlist._id);
    
    const list = await populateListByRules(playlist.rules, accessToken);
    console.log('publishing playlist will have ', list.length, ' songs');

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
    console.log('in publishAllPlaylists');

    const playlists: Playlist[] = await db.playlists.find();
    for (const playlist of playlists) {
        try {
            const user = await getUserById(playlist.userId);
            if (user) {
                await doAndRetry(async (accessToken: string) => {
                    // console.log('access token :: ', accessToken);
                    await preValidatePublishPlaylist(playlist, accessToken);
                }, user);
            }
        } catch (e) {
            console.log('error publishing playlist', playlist._id);
            console.log(e);
        }
    }
}

