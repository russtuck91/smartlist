import mongoutils from '@seiren/mongoutils';

import { MONGODB_URI } from '../src/core/db/db';
import logger from '../src/core/logger/logger';

import { BACKUP_DIRECTORY } from './constants';

export default async function() {
    logger.info('>>>> Entering restoreDatabase()');
    const info = mongoutils.parseMongoUrl(MONGODB_URI);
    const command = mongoutils.createRestoreCommand(info, `${BACKUP_DIRECTORY }/smartlist`);
    const enhCommand = `${command } --drop --preserveUUID`;
    await mongoutils.executeCommand(enhCommand);
}
