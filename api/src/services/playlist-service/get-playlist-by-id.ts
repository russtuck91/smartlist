import { NotFound } from 'http-errors';
import { ObjectId } from 'mongodb';

import logger from '../../core/logger/logger';
import { User } from '../../core/session/models';

import playlistRepo from '../../repositories/playlist-repository';

import { getCurrentUser } from '../user-service';


async function getPlaylistById(id: string) {
    logger.debug(`>>>> Entering getPlaylistById(id=${id}`);
    const currentUser: User = await getCurrentUser();

    const objId = new ObjectId(id);
    const playlist = await playlistRepo.findOne({ userId: currentUser._id, _id: objId });

    if (!playlist) {
        throw new NotFound();
    }

    return playlist;
}

export default getPlaylistById;
