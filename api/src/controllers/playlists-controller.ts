import { Controller, Get, Post } from '@overnightjs/core';
import { Request, Response } from 'express';
import httpContext from 'express-http-context';
import { intersection, union } from 'lodash';

import { spotifyUtil } from '../core/spotify/spotify-util';
import { sessionUtil } from '../core/session/session-util';

import { PlaylistRuleGroup, PlaylistRule, RuleGroupType, isPlaylistRuleGroup } from '../../../shared/src/playlists/models';

@Controller('playlists')
export class PlaylistsController {
    @Post('populateList')
    private async populatePlaylist(req: Request, res: Response) {
        // get access token from request headers, apply to spotify api
        const accessToken = req.headers && req.headers.authorization && req.headers.authorization.replace(/^Bearer /, '');
        if (!accessToken) { return; }
        httpContext.set('accessToken', accessToken);

        sessionUtil.doAndRetry(async () => {
            const rules = req.body;
    
            // const list = await spotifyUtil.getFullMySavedTracks();
            // const list = await spotifyUtil.getFullSearchResults([]);

            const list = await this.getListByAllRules(rules);

            res.send(list);
        }, res);
    }

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
            // TODO: special handling for Saved songs? Or by Playlist?
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
            const straightRuleResults = await this.getListForRules(straightRules);
            listsOfTrackResults.push(straightRuleResults);

            // console.log('Query Results, AND path, ', listsOfTrackResults);

            // Get "AND" intersection
            const results = intersection(...listsOfTrackResults);

            return results;
        }
    }

    private async getListForRules(rules: PlaylistRule[]): Promise<SpotifyApi.TrackObjectFull[]> {
        console.log('IN getListForRules');
        const results = await spotifyUtil.getFullSearchResults(rules);

        if (!results) { return []; }

        // console.log(results);
        return results.items;
    }
}