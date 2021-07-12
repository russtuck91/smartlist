import httpContext from 'express-http-context';
import { NotFound } from 'http-errors';
import { ObjectId } from 'mongodb';

import logger from '../core/logger/logger';
import { User } from '../core/session/models';

import userRepo from '../repositories/user-repository';


export async function getCurrentUser(): Promise<User> {
    const sessionToken = httpContext.get('sessionToken');
    const currentUser = await userRepo.findOne({ sessionToken: sessionToken });
    if (!currentUser) {
        logger.debug('Current user not found, exiting getCurrentUser()');
        throw new NotFound();
    }
    return currentUser;
}

export async function getUserById(id: ObjectId|string) {
    const user = await userRepo.findOne({ _id: new ObjectId(id) });
    if (!user) {
        throw new NotFound();
    }
    return user;
}

export async function updateUser(username: string, user: Partial<User>, sessionToken: string) {
    const now = new Date();
    user.updatedAt = now;

    await userRepo.findOneAndUpdate({
        conditions: { username: username },
        updates: {
            $set: user,
            $setOnInsert: { createdAt: now },
            $push: { sessionToken: sessionToken },
        },
        upsert: true,
    });
}

export async function removeSessionTokenFromCurrentUser() {
    const sessionToken = httpContext.get('sessionToken');

    await userRepo.findOneAndUpdate({
        conditions: { sessionToken: sessionToken },
        updates: {
            $set: { updatedAt: new Date() },
            $pull: { sessionToken: sessionToken },
        },
    });
}

