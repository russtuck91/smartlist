import { MongoRepository } from 'mongtype';

import dbc from './dbc';


interface DbVersion {
    version: string;
    source: string;
    updatedAt: Date;
}

const dbversionRepo = new MongoRepository<DbVersion>(dbc, { name: 'dbversion' });

export default dbversionRepo;
