import { Controller, Get, Post } from '@overnightjs/core';
import { Request, Response } from 'express';

import { spotifyApi } from '../core/spotify/spotify-api';

@Controller('playlists')
export class PlaylistsController {
    @Post('populateList')
    private async populatePlaylist(req: Request, res: Response) {
        try {
            const rules = req.body;
    
            // get access token from request headers, apply to spotify api
            const accessToken = req.headers && req.headers.authorization && req.headers.authorization.replace(/^Bearer /, '');
            if (!accessToken) { return; }

            spotifyApi.setAccessToken(accessToken);
    
            // const list = [];
            const list = await spotifyApi.getMySavedTracks({ limit: 50, offset: 0 });
            res.send(list);
        } catch (e) {
            console.error(e);
        }
    }
}