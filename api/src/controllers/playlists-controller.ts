import { Controller, Get, Post } from '@overnightjs/core';
import { Request, Response } from 'express';
import httpContext from 'express-http-context';

import { spotifyApi } from '../core/spotify/spotify-api';
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

            this.getListByAllRules(rules);

            res.send([]);
        }, res);
    }

    private getListByAllRules(rules: PlaylistRuleGroup[]) {
        const results1 = rules.map((rule) => {
            return this.getListForRuleGroup(rule);
        });

        console.log('Results, #1, ', results1);
    }

    private async getListForRuleGroup(ruleGroup: PlaylistRuleGroup) {
        if (ruleGroup.type === RuleGroupType.Or) {
            // Send each individual rule to getListForRules
            const results = ruleGroup.rules.map((rule) => {
                if (isPlaylistRuleGroup(rule)) {
                    return this.getListForRuleGroup(rule);
                } else {
                    return this.getListForRules([ rule ]);
                }
            });

            console.log('Query Results, OR path, ', results);

            // TODO: take all lists of items from `results` and "OR" them together. Flatten all into 1 list together.
            return results[0];
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

            const results: any[] = nestedRuleGroups.map((rule) => {
                return this.getListForRuleGroup(rule);
            });
            const straightRuleResults = await this.getListForRules(straightRules);
            results.push(straightRuleResults);

            console.log('Query Results, AND path, ', results);

            // TODO: take all lists of items from `results` and "AND" them together. Only keep them if it's present in all lists of `results`
            return results[0];
        }
    }

    private async getListForRules(rules: PlaylistRule[]): Promise<SpotifyApi.PagingObject<any>|undefined> {
        console.log('IN getListForRules');
        const results = await spotifyUtil.getFullSearchResults(rules);

        // console.log(results);
        return results;
    }
}