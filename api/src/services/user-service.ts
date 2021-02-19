import httpContext from 'express-http-context';
import { NotFound } from 'http-errors';
import { ObjectId } from 'mongodb';

import { db } from '../core/db/db';
import { User } from '../core/session/models';


export async function getCurrentUser(): Promise<User> {
    const sessionToken = httpContext.get('sessionToken');
    const currentUser: User|null = await db.users.findOne({ sessionToken: sessionToken });
    if (!currentUser) {
        throw new NotFound();
    }
    return currentUser;
}

export async function getUserById(id: ObjectId|string) {
    const user: User|null = await db.users.findOne({ _id: new ObjectId(id) });
    if (!user) {
        throw new NotFound();
    }
    return user;
}

export async function updateUser(username: string, user: Partial<User>, sessionToken: string) {
    const now = new Date();
    user.updatedAt = now;

    await db.users.update(
        { username: username },
        {
            $set: user,
            $setOnInsert: { createdAt: now },
            $push: { sessionToken: sessionToken },
        },
        {
            upsert: true,
        }
    );
}

export async function removeSessionTokenFromCurrentUser() {
    const sessionToken = httpContext.get('sessionToken');

    await db.users.update(
        { sessionToken: sessionToken },
        {
            $set: { updatedAt: new Date() },
            $pull: { sessionToken: sessionToken },
        }
    );
}

