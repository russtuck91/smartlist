import httpContext from 'express-http-context';
import { NotFound } from 'http-errors';

import { User } from '../../core/session/models';

import userRepo from '../../repositories/user-repository';


async function getCurrentUser(): Promise<User> {
    const sessionToken = httpContext.get('sessionToken');
    const currentUser = await userRepo.findOne({ sessionToken: sessionToken });
    if (!currentUser) {
        throw new NotFound();
    }
    return currentUser;
}

export default getCurrentUser;
