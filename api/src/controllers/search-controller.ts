import { Controller, Get, Wrapper } from '@overnightjs/core';
import expressAsyncHandler from 'express-async-handler';
import { Request, Response } from 'express-serve-static-core';

import { SearchItem } from '../../../shared';

import { doAndRetryWithCurrentUser } from '../core/session/session-util';

import spotifyCacheService from '../services/cache/spotify/spotify-cache-service';
import spotifyService, { SearchType } from '../services/spotify-service/spotify-service';


@Controller('search')
export class SearchController {
    @Get('')
    @Wrapper(expressAsyncHandler)
    private async searchForItem(
        req: Request<unknown, unknown, unknown, {
            type: SearchType;
            text: string;
        }>,
        res: Response<SearchItem[]>,
    ) {
        await doAndRetryWithCurrentUser(async (accessToken) => {
            const { type, text } = req.query;

            const result = await spotifyService.searchForItem(type, text, accessToken);

            res.send(result?.items);
        });
    }

    @Get('genre')
    @Wrapper(expressAsyncHandler)
    private async searchForGenre(
        req: Request<unknown, unknown, unknown, { text: string }>,
        res: Response<string[]>,
    ) {
        const { text } = req.query;

        const result = await spotifyCacheService.searchForGenre(text);

        res.send(result);
    }
}
