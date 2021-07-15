import httpContext from 'express-http-context';

import userRepo from '../../repositories/user-repository';


async function removeSessionTokenFromCurrentUser() {
    const sessionToken = httpContext.get('sessionToken');

    await userRepo.findOneAndUpdate({
        conditions: { sessionToken: sessionToken },
        updates: {
            $set: { updatedAt: new Date() },
            $pull: { sessionToken: sessionToken },
        },
    });
}

export default removeSessionTokenFromCurrentUser;
