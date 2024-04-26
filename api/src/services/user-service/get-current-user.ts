import httpContext from 'express-http-context';
import { Unauthorized } from 'http-errors';

import logger from '../../core/logger/logger';
import { User } from '../../core/session/models';

import userRepo from '../../repositories/user-repository';


async function getCurrentUser(): Promise<User> {
    const sessionToken: string|undefined = httpContext.get('sessionToken');
    logger.info(`>>>> In getCurrentUser, typeof sessionToken ${typeof sessionToken}`);
    logger.info(`sessionToken = ${(sessionToken)}`);
    if (!sessionToken) {
        throw new Unauthorized();
    }

    const currentUser = await userRepo.findOne({ sessionToken: sessionToken });
    logger.info('current user found...');
    logger.info(JSON.stringify(currentUser));
    if (!currentUser) {
        throw new Unauthorized();
    }
    return currentUser;
}

export default getCurrentUser;
