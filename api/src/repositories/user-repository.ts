import { MongoRepository } from 'mongtype';

import { User } from '../core/session/models';

import dbc from './dbc';


const userRepo = new MongoRepository<User>(dbc, { name: 'users' });

export default userRepo;
