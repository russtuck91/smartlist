import { ObjectId } from 'mongodb';
import { SimpleDBObject } from '../../../../shared';

export interface DBObject extends Omit<SimpleDBObject, '_id'> {
    _id: ObjectId;
}