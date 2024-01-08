import { ObjectID } from 'mongodb';
import { MongoRepository } from 'mongtype';
import { PushSubscription } from 'web-push';

import dbc from './dbc';


interface Subscription extends PushSubscription {
    userId: ObjectID;
}

const subscriptionRepo = new MongoRepository<Subscription>(dbc, { name: 'subscriptions' });

export default subscriptionRepo;
