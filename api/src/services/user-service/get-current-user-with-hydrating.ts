import { User } from '../../../../shared';

import logger from '../../core/logger/logger';
import { doAndRetry } from '../../core/session/session-util';

import spotifyService from '../spotify-service/spotify-service';

import getCurrentUser from './get-current-user';
import updateUser from './update-user';


async function hydrateUser(currentUser: User) {
    const spotifyUser = await doAndRetry(spotifyService.getMe, currentUser);
    const updatedUser = await updateUser(currentUser.username, {
        email: spotifyUser.email,
    });
    return updatedUser;
}

async function getCurrentUserWithHydrating() {
    logger.debug('>>>> Entering getCurrentUserWithHydrating()');
    const currentUser = await getCurrentUser();

    const hasHydratedData = !!currentUser.email;
    // If all hydrated data is present
    if (hasHydratedData) {
        // stale-while-revalidate
        setImmediate(() => hydrateUser(currentUser));
        return currentUser;
    }

    // If missing data to hydrate from Spotify
    const hydratedUser = await hydrateUser(currentUser);
    return hydratedUser;
}

export default getCurrentUserWithHydrating;
