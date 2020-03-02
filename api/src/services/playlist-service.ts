import httpContext from 'express-http-context';
import { NotFound } from 'http-errors';
import { intersectionWith, union } from 'lodash';
import { ObjectId } from 'mongodb';
import mongoist from 'mongoist';

import { isPlaylistRuleGroup, Playlist, PlaylistRule, PlaylistRuleGroup, RuleGroupType, RuleParam } from '../../../shared/src/playlists/models';

import { User } from '../../src/core/session/models';

import * as spotifyService from './spotify-service';
import { getCurrentUser, getUserById } from './user-service';
import { doAndRetryV2 } from '../core/session/session-util';
import { spotifyApi } from '../core/spotify/spotify-api';

const db = mongoist('mongodb://localhost:27017/smartify');


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

    db.playlists.update(
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
    const results: (SpotifyApi.TrackObjectFull[])[] = await Promise.all(
        rules.map((rule) => {
            return getListForRuleGroup(rule);
        })
    );

    // console.log('Results, #1, ', results);

    const unionResult = union(...results);

    return unionResult;
}

async function getListForRuleGroup(ruleGroup: PlaylistRuleGroup): Promise<SpotifyApi.TrackObjectFull[]> {
    if (ruleGroup.type === RuleGroupType.Or) {
        // Send each individual rule to getListForRules
        const listOfTrackResults = await Promise.all(
            ruleGroup.rules.map((rule) => {
                if (isPlaylistRuleGroup(rule)) {
                    return getListForRuleGroup(rule);
                } else {
                    return getListForRules([ rule ]);
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
                return getListForRuleGroup(rule);
            })
        );

        if (straightRules.length > 0) {
            const straightRuleResults = await getListForRules(straightRules);
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

async function getListForRules(rules: PlaylistRule[]): Promise<SpotifyApi.TrackObjectFull[]> {
    console.log('IN getListForRules');
    
    // Bundle Saved rule with regular search rules (all but playlist)
    // if no Saved rule, do regular search
    // TODO: what about playlist rule

    const hasSavedRule: boolean = !!(rules.find(rule => rule.param === RuleParam.Saved));
    
    let results: SpotifyApi.TrackObjectFull[]|undefined;
    if (hasSavedRule) {
        results = await getFilteredListOfSavedSongs(rules);
    } else {
        const searchResults = await spotifyService.getFullSearchResults(rules);
        results = searchResults && searchResults.items;
    }

    if (!results) { return []; }

    // console.log(results);
    return results;
}

async function getFilteredListOfSavedSongs(rules: PlaylistRule[]) {
    const savedTrackObjects = await spotifyService.getFullMySavedTracks();

    if (!savedTrackObjects) { return []; }

    const savedTracks: SpotifyApi.TrackObjectFull[] = savedTrackObjects.items.map(item => item.track);

    const filterObj = rules.reduce((obj, item) => {
        obj[item.param] = item.value;
        return obj;
    }, {});

    const filteredList = savedTracks.filter((track) => {
        if (filterObj[RuleParam.Artist]) {
            return track.artists.some((artist) => {
                return artist.name.toLowerCase() === filterObj[RuleParam.Artist].toLowerCase();
            });
        }

        if (filterObj[RuleParam.Album]) {
            return track.album.name.toLowerCase() === filterObj[RuleParam.Album].toLowerCase();
        }

        if (filterObj[RuleParam.Track]) {
            return track.name.toLowerCase() === filterObj[RuleParam.Track].toLowerCase();
        }

        // TODO
        if (filterObj[RuleParam.Genre]) {

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

export async function publishPlaylist(playlist: Playlist) {
    const list = await populateListByRules(playlist.rules);
    console.log('publishing playlist will have ', list.length, ' songs');

    if (playlist.spotifyPlaylistId) {
        // Remove all tracks from playlist
        await spotifyService.removeTracksFromPlaylist(playlist.spotifyPlaylistId);

        // Add tracks to playlist (batches of 100)
        spotifyService.addTracksToPlaylist(playlist.spotifyPlaylistId, list);

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
        spotifyService.addTracksToPlaylist(newPlaylist.id, list);
    }
}

export async function publishAllPlaylists() {
    console.log('in publishAllPlaylists');

    const playlists = await db.playlists.find();
    playlists.forEach(async (playlist: Playlist) => {
        const user = await getUserById(playlist.userId);
        if (user) {
            // httpContext.set('accessToken', user.accessToken);
            spotifyApi.setAccessToken(user.accessToken);

            doAndRetryV2(async () => {
                publishPlaylist(playlist);
            }, user);
        }
    });
}

