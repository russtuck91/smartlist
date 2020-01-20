import { Controller, Get, Post } from '@overnightjs/core';
import { Request, Response } from 'express';

import { spotifyApi } from '../core/spotify/spotify-api';
import { spotifyUtil } from '../core/spotify/spotify-util';
import { sessionUtil } from '../core/session/session-util';

@Controller('playlists')
export class PlaylistsController {
    @Post('populateList')
    private async populatePlaylist(req: Request, res: Response) {
        // get access token from request headers, apply to spotify api
        const accessToken = req.headers && req.headers.authorization && req.headers.authorization.replace(/^Bearer /, '');
        if (!accessToken) { return; }

        try {
            const rules = req.body;
    
            // // get access token from request headers, apply to spotify api
            // const accessToken = req.headers && req.headers.authorization && req.headers.authorization.replace(/^Bearer /, '');
            // if (!accessToken) { return; }

            spotifyApi.setAccessToken(accessToken);
    
            const list = await spotifyUtil.getFullMySavedTracks(accessToken);

            res.send(list);
        } catch (e) {
            if (e.statusCode === 401) {
                // refresh access token
                const newAccessToken = await sessionUtil.refreshAccessToken(accessToken);

                if (newAccessToken) {
                    // res.cookie();

                    // TODO: this should probably be more automatic
                    const list = await spotifyUtil.getFullMySavedTracks(newAccessToken);

                    res.set('Access-Token', newAccessToken)
                    res.send(list);
                }
            }

            console.error(e);
        }
    }
}