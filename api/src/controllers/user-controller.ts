import { Controller, Get, Wrapper } from '@overnightjs/core';
import { Request, Response } from 'express';
import expressAsyncHandler from 'express-async-handler';

import * as userService from '../services/user-service';


@Controller('users')
export class UserController {
    @Get('me')
    @Wrapper(expressAsyncHandler)
    private async getMe(req: Request, res: Response) {
        const user = await userService.getCurrentUserWithHydrating();
        res.send(user);
    }
}

