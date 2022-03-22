import 'reflect-metadata';

import logger from '../../src/core/logger/logger';
import playlistRepo from '../../src/repositories/playlist-repository';


async function addExceptionList() {
    try {
        const collection = await playlistRepo.collection;
        await collection.updateMany(
            { exceptions: { $exists: false } },
            { $set: { exceptions: [] } },
        );
    } catch (e) {
        logger.info('Error in addExceptionList');
        logger.error(e);
        throw e;
    }
}

export default addExceptionList;
