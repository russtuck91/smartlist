import { Controller, Delete, Get, Post, Put, Wrapper } from '@overnightjs/core';
import { Request, Response } from 'express';
import expressAsyncHandler from 'express-async-handler';

import { Playlist, PlaylistDeleteOptions, PlaylistRuleGroup } from '../../../shared';

import { playlistCreatedEvent, playlistPublishedEvent, playlistUpdatedEvent } from '../core/analytics/analytics-utils';
import { doAndRetryWithCurrentUser } from '../core/session/session-util';

import * as playlistService from '../services/playlist-service';

@Controller('playlists')
export class PlaylistsController {
    @Get('lists')
    @Wrapper(expressAsyncHandler)
    async getPlaylists(req: Request, res: Response) {
        const playlists = await playlistService.getPlaylists();

        res.send(playlists);
    }

    @Get(':id')
    @Wrapper(expressAsyncHandler)
    async getPlaylistById(req: Request, res: Response) {
        const playlist = await playlistService.getPlaylistById(req.params.id);

        res.send(playlist);
    }

    @Put(':id')
    @Wrapper(expressAsyncHandler)
    async updatePlaylist(req: Request, res: Response) {
        const playlist: Playlist = req.body;
        const result = await playlistService.updatePlaylist(req.params.id, playlist);
        playlistUpdatedEvent();

        res.send(result);
    }

    @Post('')
    @Wrapper(expressAsyncHandler)
    async createPlaylist(req: Request, res: Response) {
        const playlist: Playlist = req.body;
        const result = await playlistService.createPlaylist(playlist);
        playlistCreatedEvent();

        res.send(result);
    }

    @Delete(':id')
    @Wrapper(expressAsyncHandler)
    async deletePlaylist(req: Request, res: Response) {
        const deleteOptions: PlaylistDeleteOptions = req.body;
        await playlistService.deletePlaylist(req.params.id, deleteOptions);

        res.send();
    }


    @Post('populateList')
    @Wrapper(expressAsyncHandler)
    async populatePlaylist(req: Request, res: Response) {
        await doAndRetryWithCurrentUser(async (accessToken) => {
            const playlist: Playlist = req.body;

            const list = await playlistService.populateList(playlist, accessToken);

            res.send(list);
        });
    }


    @Post('publish/:id')
    @Wrapper(expressAsyncHandler)
    async publishPlaylist(req: Request, res: Response) {
        await doAndRetryWithCurrentUser(async (accessToken) => {
            await playlistService.publishPlaylistById(req.params.id, accessToken);
            playlistPublishedEvent();

            res.send();
        });
    }
}
