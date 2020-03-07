import { Controller, Get } from '@overnightjs/core';
import { Request, Response } from 'express';
import { doAndRetryWithCurrentUser } from '../core/session/session-util';
import { getMe } from '../services/spotify-service';


@Controller('users')
export class UserController {
    @Get('me')
    private async getMe(req: Request, res: Response) {
        await doAndRetryWithCurrentUser(async () => {
            const userProfile: SpotifyApi.CurrentUsersProfileResponse = await getMe();

            res.send(userProfile);
        });
    }
}

