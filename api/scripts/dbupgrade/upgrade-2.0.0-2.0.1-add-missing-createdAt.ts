import moment from 'moment';

import { SimpleDBObject } from '../../../shared';

import { db } from '../../src/core/db/db';
import logger from '../../src/core/logger/logger';

async function addMissingCreatedAtForCollection(collection: string) {
    logger.info(`>>> Entering addMissingCreatedAtForCollection(collection = ${collection}`);
    const aggResult = await db[collection].aggregate([
        {
            $group: {
                _id: {},
                minUpdatedAt: { $min: '$updatedAt' }
            }
        }
    ]);
    const theDate = moment(aggResult[0].minUpdatedAt);

    // For all docs with missing createdAt, in reverse natural order (from bottom -> top)
    const docs: SimpleDBObject[] = await db[collection].findAsCursor({
        createdAt: { $exists: false }
    }).sort({
        $natural: -1
    }).toArray();
    
    return await docs.reduce(async (aggDate, doc) => {
        await aggDate;
        logger.debug('Updating item:', doc);

        // Set doc.createdAt to the stored date
        await db[collection].update(doc, {
            $set: {
                createdAt: theDate.toDate()
            }
        });

        // Decrement by an amount
        theDate.subtract(1, 'minute');

        return await aggDate;
    }, Promise.resolve(theDate));
}

async function addMissingCreatedAt() {
    try {
        const collections = [ 'playlists', 'users' ];

        for (const collection of collections) {
            await addMissingCreatedAtForCollection(collection);
        }
    } catch (e) {
        logger.info('Error in addMissingCreatedAt');
        logger.error(e);
        throw e;
    }
}

export default addMissingCreatedAt;
