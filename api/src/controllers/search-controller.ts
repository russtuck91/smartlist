import { Controller, Get, Wrapper } from '@overnightjs/core';
import { Request, Response } from 'express';
import expressAsyncHandler from 'express-async-handler';

import { doAndRetryWithCurrentUser } from '../core/session/session-util';

import spotifyCacheService from '../services/cache/spotify/spotify-cache-service';
import spotifyService from '../services/spotify-service/spotify-service';

@Controller('search')
export class SearchController {
    @Get('')
    @Wrapper(expressAsyncHandler)
    private async searchForItem(req: Request, res: Response) {
        await doAndRetryWithCurrentUser(async (accessToken) => {
            const { type, text } = req.query;

            const result = await spotifyService.searchForItem(type.toLowerCase(), text, accessToken);

            res.send(result?.items);
        });
    }

    @Get('genre')
    @Wrapper(expressAsyncHandler)
    private async searchForGenre(req: Request, res: Response) {
        const { text } = req.query;

        const result = await spotifyCacheService.searchForGenre(text);

        res.send(result);
    }
}
