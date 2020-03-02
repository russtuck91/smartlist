import { Controller, Delete, Get, Post, Put } from '@overnightjs/core';
import { Request, Response } from 'express';

import { Playlist, PlaylistRuleGroup } from '../../../shared/src/playlists/models';

import { sessionUtil } from '../core/session/session-util';
import { createPlaylist, deletePlaylist, getPlaylistById, getPlaylists, populateListByRules, updatePlaylist, publishPlaylist, publishPlaylistById } from '../services/playlist-service';

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
        sessionUtil.setAccessTokenContext(req);

        sessionUtil.doAndRetry(async () => {
            const rules: PlaylistRuleGroup[] = req.body;

            const list = await populateListByRules(rules);

            res.send(list);
        }, res);
    }


    @Post('publish/:id')
    private async publishPlaylist(req: Request, res: Response) {
        try {
            sessionUtil.setAccessTokenContext(req);

            await publishPlaylistById(req.params.id);

            res.send();
        } catch (e) {
            res.sendStatus(e.statusCode);
        }
    }
}