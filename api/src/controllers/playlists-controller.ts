import { Controller, Delete, Get, Post, Put } from '@overnightjs/core';
import { Request, Response } from 'express';
import httpContext from 'express-http-context';
import { intersectionWith, union } from 'lodash';

import { isPlaylistRuleGroup, Playlist, PlaylistRule, PlaylistRuleGroup, RuleGroupType, RuleParam } from '../../../shared/src/playlists/models';

import { sessionUtil } from '../core/session/session-util';
import { spotifyUtil } from '../core/spotify/spotify-util';
import { createPlaylist, getPlaylists, getPlaylistById, updatePlaylist, deletePlaylist } from '../services/playlist-service';

@Controller('playlists')
export class PlaylistsController {
    // todo: rename? ""? "mine"?
    @Get('lists')
    private async getPlaylists(req: Request, res: Response) {
        sessionUtil.setAccessTokenContext(req);

        const playlists = await getPlaylists();

        res.send(playlists);
    }

    @Get(':id')
    private async getPlaylistById(req: Request, res: Response) {
        try {
            sessionUtil.setAccessTokenContext(req);

            const playlist = await getPlaylistById(req.params.id);

            res.send(playlist);
        } catch (e) {
            console.log(e);
            res.sendStatus(e.statusCode);
        }
    }

    @Put(':id')
    private updatePlaylist(req: Request, res: Response) {
        try {
            sessionUtil.setAccessTokenContext(req);

            const playlist: Playlist = req.body;
            updatePlaylist(req.params.id, playlist);

            res.send();
        } catch (e) {
            res.sendStatus(e.statusCode);
        }
    }

    @Post('')
    private async createPlaylist(req: Request, res: Response) {
        try {
            sessionUtil.setAccessTokenContext(req);

            const playlist: Playlist = req.body;
            createPlaylist(playlist);

            res.send();
        } catch (e) {
            res.sendStatus(e.statusCode);
        }
    }

    @Delete(':id')
    private deletePlaylist(req: Request, res: Response) {
        try {
            sessionUtil.setAccessTokenContext(req);

            deletePlaylist(req.params.id);

            res.send();
        } catch (e) {
            res.sendStatus(e.statusCode);
        }
    }


    @Post('populateList')
    private async populatePlaylist(req: Request, res: Response) {
        // get access token from request headers, apply to spotify api
        const accessToken = req.headers && req.headers.authorization && req.headers.authorization.replace(/^Bearer /, '');
        if (!accessToken) { return; }
        httpContext.set('accessToken', accessToken);

        sessionUtil.doAndRetry(async () => {
            const rules: PlaylistRuleGroup[] = req.body;

            const list = await this.getListByAllRules(rules);

            res.send(list);
        }, res);
    }


    // TODO: move these methods to PlaylistService
    private async getListByAllRules(rules: PlaylistRuleGroup[]): Promise<SpotifyApi.TrackObjectFull[]> {
        const results: (SpotifyApi.TrackObjectFull[])[] = await Promise.all(
            rules.map((rule) => {
                return this.getListForRuleGroup(rule);
            })
        );

        // console.log('Results, #1, ', results);

        const unionResult = union(...results);

        return unionResult;
    }

    private async getListForRuleGroup(ruleGroup: PlaylistRuleGroup): Promise<SpotifyApi.TrackObjectFull[]> {
        if (ruleGroup.type === RuleGroupType.Or) {
            // Send each individual rule to getListForRules
            const listOfTrackResults = await Promise.all(
                ruleGroup.rules.map((rule) => {
                    if (isPlaylistRuleGroup(rule)) {
                        return this.getListForRuleGroup(rule);
                    } else {
                        return this.getListForRules([ rule ]);
                    }
                })
            );

            console.log('Query Results, OR path, ', listOfTrackResults);

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
                    return this.getListForRuleGroup(rule);
                })
            );

            if (straightRules.length > 0) {
                const straightRuleResults = await this.getListForRules(straightRules);
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

    private async getListForRules(rules: PlaylistRule[]): Promise<SpotifyApi.TrackObjectFull[]> {
        console.log('IN getListForRules');
        
        // Bundle Saved rule with regular search rules (all but playlist)
        // if no Saved rule, do regular search
        // TODO: what about playlist rule

        const hasSavedRule: boolean = !!(rules.find(rule => rule.param === RuleParam.Saved));
        
        let results: SpotifyApi.TrackObjectFull[]|undefined;
        if (hasSavedRule) {
            results = await this.getFilteredListOfSavedSongs(rules);
        } else {
            const searchResults = await spotifyUtil.getFullSearchResults(rules);
            results = searchResults && searchResults.items;
        }

        if (!results) { return []; }

        // console.log(results);
        return results;
    }

    private async getFilteredListOfSavedSongs(rules: PlaylistRule[]) {
        const savedTrackObjects = await spotifyUtil.getFullMySavedTracks();

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

    private async getListForSpecialRule(rule: PlaylistRule): Promise<SpotifyApi.TrackObjectFull[]> {
        console.log('IN getListForSpecialRule');

        if (rule.param === RuleParam.Saved) {
            const results = await spotifyUtil.getFullMySavedTracks();

            if (!results) { return []; }

            return results.items.map((item) => item.track);
        }

        return [];
    }
}