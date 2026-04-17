import { NotFound } from 'http-errors';
import { ObjectId } from 'mongodb';

import logger from '../../core/logger/logger';

import playlistRepo from '../../repositories/playlist-repository';

import { getCurrentUser } from '../user-service';


async function getPlaylistById(id: string) {
    logger.debug(`>>>> Entering getPlaylistById(id=${id}`);
    const currentUser = await getCurrentUser();

    const playlist = await playlistRepo.findOne({
        _id: new ObjectId(id),
        userId: new ObjectId(currentUser.id),
    });

    if (!playlist) {
        throw new NotFound();
    }

    return playlist;
}

export default getPlaylistById;
