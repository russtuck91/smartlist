import { User } from '../../../../shared';

import userRepo from '../../repositories/user-repository';


async function updateUser(username: string, user: Partial<User>, sessionToken?: string) {
    const now = new Date();
    user.updatedAt = now;

    const pushSet: Partial<Record<keyof User, any>> = {};
    if (sessionToken) {
        pushSet.sessionToken = sessionToken;
    }

    const updated = await userRepo.findOneAndUpdate({
        conditions: { username: username },
        updates: {
            $set: user,
            $setOnInsert: { createdAt: now },
            $push: pushSet,
        },
        upsert: true,
    });
    return updated!;
}

export default updateUser;
