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

    await db.playlists.update(
        { _id: new ObjectId(id) },
        { $set: playlist }
    );
}

export async function createPlaylist(playlist: Playlist) {
    const currentUser: User = await getCurrentUser();

    const newPlaylist: Playlist = { ...playlist, userId: currentUser._id };
    db.playlists.insertOne(newPlaylist);
}

export async function deletePlaylist(id: string) {
    const currentUser: User = await getCurrentUser();

    db.playlists.remove(
        { _id: new ObjectId(id), userId: currentUser._id },
        true
    );
}



export async function populateListByRules(rules: PlaylistRuleGroup[], accessToken?: string): Promise<SpotifyApi.TrackObjectFull[]> {
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

async function getListForRuleGroup(ruleGroup: PlaylistRuleGroup, accessToken?: string): Promise<SpotifyApi.TrackObjectFull[]> {
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

async function getListForRules(rules: PlaylistRule[], accessToken?: string): Promise<SpotifyApi.TrackObjectFull[]> {
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

async function getFilteredListOfSavedSongs(rules: PlaylistRule[], accessToken?: string) {
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

        albumMap = await spCache.getAlbums(allAlbumIds);
        artistMap = await spCache.getArtists(allArtistIds);
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

export async function publishPlaylist(playlist: Playlist, accessToken?: string) {
    console.log('in publishPlaylist. ID :: ', playlist._id);
    
    const list = await populateListByRules(playlist.rules, accessToken);
    console.log('publishing playlist will have ', list.length, ' songs');

    if (playlist.spotifyPlaylistId) {
        // Remove all tracks from playlist
        await spotifyService.removeTracksFromPlaylist(playlist.spotifyPlaylistId, accessToken);

        // Add tracks to playlist (batches of 100)
        spotifyService.addTracksToPlaylist(playlist.spotifyPlaylistId, list, accessToken);

        // Save last published date
        const playlistUpdate: Partial<Playlist> = {
            lastPublished: new Date()
        };
        updatePlaylist(playlist._id!, playlistUpdate);
    } else {
        const newPlaylist = await spotifyService.createNewPlaylist(playlist.name, playlist.userId);

        // Save new playlist id to DB as spotifyPlaylistId
        const playlistUpdate: Partial<Playlist> = {
            spotifyPlaylistId: newPlaylist.id,
            lastPublished: new Date()
        };
        updatePlaylist(playlist._id!, playlistUpdate);

        // Add tracks to playlist
        spotifyService.addTracksToPlaylist(newPlaylist.id, list, accessToken);
    }
}

export async function publishAllPlaylists() {
    console.log('in publishAllPlaylists');

    const playlists = await db.playlists.find();
    await Promise.all(playlists.map(async (playlist: Playlist) => {
        const user = await getUserById(playlist.userId);
        if (user) {
            doAndRetry(async (accessToken: string) => {
                await publishPlaylist(playlist, accessToken);
            }, user);
        }
    }));
}

