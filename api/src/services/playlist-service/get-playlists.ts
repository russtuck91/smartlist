import { db } from '../../core/db/db';
import { User } from '../../core/session/models';

import { getCurrentUser } from '../user-service';


async function getPlaylists() {
    const currentUser: User = await getCurrentUser();

    const playlists = await db.playlists.find({ userId: currentUser._id });
    return playlists;
}

export default getPlaylists;
