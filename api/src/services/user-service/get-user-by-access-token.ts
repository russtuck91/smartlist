import { NotFound } from 'http-errors';

import logger from '../../core/logger/logger';
import maskToken from '../../core/logger/mask-token';

import userRepo from '../../repositories/user-repository';


async function getUserByAccessToken(accessToken: string) {
    logger.debug(`>>>> Entering getUserByAccessToken(accessToken = ${maskToken(accessToken)}`);
    const user = await userRepo.findOne({ accessToken: accessToken });
    if (!user) {
        logger.debug('<<<< Exiting getUserByAccessToken after user not found');
        throw new NotFound();
    }
    return user;
}

export default getUserByAccessToken;
