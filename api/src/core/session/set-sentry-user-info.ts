import * as Sentry from '@sentry/node';
import { NextFunction, Request, Response } from 'express';
import { Unauthorized } from 'http-errors';

import { getCurrentUser } from '../../services/user-service';

import logger from '../logger/logger';


async function setSentryUserInfo(req: Request, res: Response, next: NextFunction) {
    logger.debug('>>>> Entering setSentryUserInfo');
    try {
        const user = await getCurrentUser();
        Sentry.setUser({
            id: user.id,
            username: user.username,
        });
    } catch (e) {
        if (e instanceof Unauthorized) {
            // eat the error
            return next();
        }
        logger.info('Error in setSentryUserInfo');
        logger.info(e);
    }
    next();
}

export default setSentryUserInfo;
