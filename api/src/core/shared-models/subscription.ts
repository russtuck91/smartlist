import { ObjectId } from 'mongodb';
import { PushSubscription } from 'web-push';

import { SimpleDBObject } from '../../../../shared';

export interface Subscription extends PushSubscription, SimpleDBObject {
    userId: ObjectId;
}
