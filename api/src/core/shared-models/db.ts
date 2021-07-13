import { ObjectId } from 'mongodb';

import { SimpleDBObject } from '../../../../shared';

export interface DBObject extends SimpleDBObject {
    _id: ObjectId;
}
