import httpContext from 'express-http-context';
import { NotFound } from 'http-errors';
import { ObjectId } from 'mongodb';
import mongoist from 'mongoist';

import { User } from '../core/session/models';

const db = mongoist('mongodb://localhost:27017/smartify');


export async function getCurrentUser(): Promise<User> {
    const sessionToken = httpContext.get('sessionToken');
    const currentUser: User|null = await db.users.findOne({ sessionToken: sessionToken });
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

export async function updateUser(username: string, user: Partial<User>, sessionToken: string) {
    await db.users.update(
        { username: username },
        {
            $set: user,
            $push: { sessionToken: sessionToken }
        },
        {
            upsert: true
        }
    );
}

export async function removeSessionTokenFromCurrentUser() {
    const sessionToken = httpContext.get('sessionToken');

    await db.users.update(
        { sessionToken: sessionToken },
        {
            $pull: { sessionToken: sessionToken }
        }
    );
}

