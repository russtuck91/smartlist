import { NotFound } from 'http-errors';
import { ObjectId } from 'mongodb';

import logger from '../../core/logger/logger';

import userRepo from '../../repositories/user-repository';


async function getUserById(id: ObjectId|string) {
    logger.debug(`>>>> Entering getUserById(id = ${id}`);
    const user = await userRepo.findOne({ _id: new ObjectId(id) });
    if (!user) {
        logger.debug('<<<< Exiting getUserById after user not found');
        throw new NotFound();
    }
    return user;
}

export default getUserById;
