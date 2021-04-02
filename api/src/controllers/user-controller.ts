import { Controller, Get } from '@overnightjs/core';
import { Request, Response } from 'express';

import { doAndRetryWithCurrentUser } from '../core/session/session-util';

import spotifyService from '../services/spotify-service/spotify-service';


@Controller('users')
export class UserController {
    @Get('me')
    private async getMe(req: Request, res: Response) {
        await doAndRetryWithCurrentUser(async () => {
            const userProfile: SpotifyApi.CurrentUsersProfileResponse = await spotifyService.getMe();

            res.send(userProfile);
        });
    }
}

