import httpContext from 'express-http-context';
import { NotFound } from 'http-errors';
import { ObjectId } from 'mongodb';
import mongoist from 'mongoist';

import { User } from '../core/session/models';

const db = mongoist('mongodb://localhost:27017/smartify');


export async function getCurrentUser(): Promise<User> {
    const accessToken = httpContext.get('accessToken');
    const currentUser: User|null = await db.users.findOne({ accessToken: accessToken });
    if (!currentUser) {
        throw new NotFound();
    }
    return currentUser;
}

export async function getUserById(id: ObjectId) {
    const user: User|null = await db.users.findOne({ _id: id });
    if (!user) {
        throw new NotFound();
    }
    return user;
}

