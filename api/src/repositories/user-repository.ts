import { MongoRepository } from 'mongtype';

import { User } from '../../../shared';

import dbc from './dbc';


const userRepo = new MongoRepository<User>(dbc, { name: 'users' });

export default userRepo;
