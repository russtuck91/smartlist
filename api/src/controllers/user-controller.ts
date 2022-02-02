import { Controller, Get, Wrapper } from '@overnightjs/core';
import { Request, Response } from 'express';
import expressAsyncHandler from 'express-async-handler';

import { doAndRetryWithCurrentUser } from '../core/session/session-util';

import spotifyService from '../services/spotify-service/spotify-service';


@Controller('users')
export class UserController {
    @Get('me')
    @Wrapper(expressAsyncHandler)
    private async getMe(req: Request, res: Response) {
        await doAndRetryWithCurrentUser(async () => {
            const userProfile: SpotifyApi.CurrentUsersProfileResponse = await spotifyService.getMe();

            res.send(userProfile);
        });
    }
}

