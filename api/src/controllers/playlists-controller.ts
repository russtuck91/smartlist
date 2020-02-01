import { Controller, Get, Post } from '@overnightjs/core';
import { Request, Response } from 'express';
import httpContext from 'express-http-context';

import { spotifyApi } from '../core/spotify/spotify-api';
import { spotifyUtil } from '../core/spotify/spotify-util';
import { sessionUtil } from '../core/session/session-util';

import { PlaylistRuleGroup } from '../../../shared/playlists/models';

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
    
            const list = await spotifyUtil.getFullMySavedTracks();
            // const list = await spotifyUtil.getFullSearchResults([]);

            res.send(list);
        }, res);
    }

    private getListByRules(rules: PlaylistRuleGroup[]) {
        
    }

    private getListForRuleGroup(ruleGroup: PlaylistRuleGroup) {

    }
}