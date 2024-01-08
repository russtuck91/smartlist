import { MongoRepository } from 'mongtype';

import { Subscription } from '../core/shared-models';

import dbc from './dbc';


const subscriptionRepo = new MongoRepository<Subscription>(dbc, { name: 'subscriptions' });

export default subscriptionRepo;
