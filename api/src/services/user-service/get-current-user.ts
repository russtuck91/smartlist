import httpContext from 'express-http-context';
import { Unauthorized } from 'http-errors';

import logger from '../../core/logger/logger';
import { User } from '../../core/session/models';

import userRepo from '../../repositories/user-repository';


async function getCurrentUser(): Promise<User> {
    logger.debug('>>>> Entering getCurrentUser()');
    const sessionToken: string|undefined = httpContext.get('sessionToken');
    if (!sessionToken) {
        throw new Unauthorized();
    }

    const currentUser = await userRepo.findOne({ sessionToken: sessionToken });
    if (!currentUser) {
        throw new Unauthorized();
    }
    return currentUser;
}

export default getCurrentUser;
