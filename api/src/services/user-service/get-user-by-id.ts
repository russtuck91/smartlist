import { NotFound } from 'http-errors';
import { ObjectId } from 'mongodb';

import userRepo from '../../repositories/user-repository';


async function getUserById(id: ObjectId|string) {
    const user = await userRepo.findOne({ _id: new ObjectId(id) });
    if (!user) {
        throw new NotFound();
    }
    return user;
}

export default getUserById;
