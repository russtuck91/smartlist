import { Controller, Post } from '@overnightjs/core';
import { Request, Response } from 'express';
import logger from '../core/logger/logger';

@Controller('logger')
export class LogController {
    @Post('')
    private logToLogger(req: Request, res: Response) {
        logger.log(req.body);
        res.send({
            logged: req.body
        });
    }
}
