import { Controller, Get, Wrapper } from '@overnightjs/core';
import { Request, Response } from 'express';
import expressAsyncHandler from 'express-async-handler';

import { doAndRetryWithCurrentUser } from '../core/session/session-util';

import * as trackService from '../services/track-service';


@Controller('track')
export class TrackController {
    @Get(':id/details')
    @Wrapper(expressAsyncHandler)
    async getTrackDetails(req: Request, res: Response) {
        await doAndRetryWithCurrentUser(async (accessToken) => {
            const details = await trackService.getTrackDetails(req.params.id!, accessToken);

            res.send(details);
        });
    }
}
