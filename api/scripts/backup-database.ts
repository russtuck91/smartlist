import mongoutils from '@seiren/mongoutils';

import { MONGODB_URI } from '../src/core/db/db';
import logger from '../src/core/logger/logger';

import { BACKUP_DIRECTORY } from './constants';


async function backupDatabase() {
    logger.debug('>>>> Entering backupDatabase()');
    const info = mongoutils.parseMongoUrl(MONGODB_URI);
    const command = mongoutils.createDumpCommand(info, BACKUP_DIRECTORY);
    await mongoutils.executeCommand(command);
}

export default backupDatabase;
