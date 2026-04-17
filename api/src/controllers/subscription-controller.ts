import { Controller, Post } from '@overnightjs/core';
import { Request, Response } from 'express';

import { saveSubscription } from '../services/subscription-service';

@Controller('subscription')
export class SubscriptionController {
    @Post('')
    async saveSubscription(req: Request, res: Response) {
        await saveSubscription(req.body);

        res.sendStatus(200);
    }
}
