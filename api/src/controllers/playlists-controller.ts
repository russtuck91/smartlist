import { Controller, Delete, Get, Post, Put } from '@overnightjs/core';
import { Request, Response } from 'express';

import { Playlist, PlaylistRuleGroup } from '../../../shared/src/playlists/models';

import { doAndRetryWithCurrentUser } from '../core/session/session-util';
import { createPlaylist, deletePlaylist, getPlaylistById, getPlaylists, populateListByRules, updatePlaylist, publishPlaylistById } from '../services/playlist-service';

@Controller('playlists')
export class PlaylistsController {
    // todo: rename? ""? "mine"?
    @Get('lists')
    private async getPlaylists(req: Request, res: Response) {
        try {
            const playlists = await getPlaylists();

            res.send(playlists);
        } catch (e) {
            console.log(e);
            res.sendStatus(e.statusCode);
        }
    }

    @Get(':id')
    private async getPlaylistById(req: Request, res: Response) {
        try {
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
            deletePlaylist(req.params.id);

            res.send();
        } catch (e) {
            res.sendStatus(e.statusCode);
        }
    }


    @Post('populateList')
    private async populatePlaylist(req: Request, res: Response) {
        doAndRetryWithCurrentUser(async () => {
            const rules: PlaylistRuleGroup[] = req.body;

            const list = await populateListByRules(rules);

            res.send(list);
        });
    }


    @Post('publish/:id')
    private async publishPlaylist(req: Request, res: Response) {
        try {
            await publishPlaylistById(req.params.id);

            res.send();
        } catch (e) {
            res.sendStatus(e.statusCode);
        }
    }
}