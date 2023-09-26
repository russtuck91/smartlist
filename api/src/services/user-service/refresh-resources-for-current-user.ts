import { NextFunction, Request, Response } from 'express';

import { agenda } from '../../agenda';
import { FetchResourcesForUserParams } from '../../jobs/fetch-resources-for-user';
import JobTypes from '../../jobs/job-types';

import getCurrentUser from './get-current-user';


async function refreshResourcesForCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
        const user = await getCurrentUser();
        agenda.create<FetchResourcesForUserParams>(JobTypes.fetchResourcesForUser, { userId: user.id })
            .unique({ 'data.userId': user.id })
            .save();
    } catch(e) {
        // eat the error
    }
    next();
}

export default refreshResourcesForCurrentUser;
