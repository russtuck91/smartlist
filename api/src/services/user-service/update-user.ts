import { User } from '../../core/session/models';

import userRepo from '../../repositories/user-repository';


async function updateUser(username: string, user: Partial<User>, sessionToken?: string) {
    const now = new Date();
    user.updatedAt = now;

    const updated = await userRepo.findOneAndUpdate({
        conditions: { username: username },
        updates: {
            $set: user,
            $setOnInsert: { createdAt: now },
            $push: { sessionToken: sessionToken },
        },
        upsert: true,
    });
    return updated!;
}

export default updateUser;
