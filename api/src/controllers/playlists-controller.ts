import { Controller, Delete, Get, Post, Put, Wrapper } from '@overnightjs/core';
import { Request, Response } from 'express';
import expressAsyncHandler from 'express-async-handler';

import { Playlist, PlaylistDeleteOptions, PlaylistRuleGroup } from '../../../shared';

import { doAndRetryWithCurrentUser } from '../core/session/session-util';

import { createPlaylist, deletePlaylist, getPlaylistById, getPlaylists, populateListByRules, publishPlaylistById, updatePlaylist } from '../services/playlist-service';

@Controller('playlists')
export class PlaylistsController {
    // todo: rename? ""? "mine"?
    @Get('lists')
    @Wrapper(expressAsyncHandler)
    private async getPlaylists(req: Request, res: Response) {
        const playlists = await getPlaylists();

        res.send(playlists);
    }

    @Get(':id')
    @Wrapper(expressAsyncHandler)
    private async getPlaylistById(req: Request, res: Response) {
        const playlist = await getPlaylistById(req.params.id);

        res.send(playlist);
    }

    @Put(':id')
    @Wrapper(expressAsyncHandler)
    private async updatePlaylist(req: Request, res: Response) {
        const playlist: Playlist = req.body;
        const result = await updatePlaylist(req.params.id, playlist);

        res.send(result);
    }

    @Post('')
    @Wrapper(expressAsyncHandler)
    private async createPlaylist(req: Request, res: Response) {
        const playlist: Playlist = req.body;
        const result = await createPlaylist(playlist);

        res.send(result);
    }

    @Delete(':id')
    @Wrapper(expressAsyncHandler)
    private async deletePlaylist(req: Request, res: Response) {
        const deleteOptions: PlaylistDeleteOptions = req.body;
        await deletePlaylist(req.params.id, deleteOptions);

        res.send();
    }


    @Post('populateList')
    @Wrapper(expressAsyncHandler)
    private async populatePlaylist(req: Request, res: Response) {
        await doAndRetryWithCurrentUser(async (accessToken) => {
            const rules: PlaylistRuleGroup[] = req.body;

            const list = await populateListByRules(rules, accessToken);

            res.send(list);
        });
    }


    @Post('publish/:id')
    @Wrapper(expressAsyncHandler)
    private async publishPlaylist(req: Request, res: Response) {
        await publishPlaylistById(req.params.id);

        res.send();
    }
}
