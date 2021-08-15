import Agenda from 'agenda';

import logger from '../core/logger/logger';

import { JobTypes } from '../agenda';
import { fetchResourcesForUser } from '../services/user-service';


export interface FetchResourcesForUserParams {
    userId: string;
}

export default function(agenda: Agenda) {
    agenda.define<FetchResourcesForUserParams>(JobTypes.fetchResourcesForUser, async (job) => {
        logger.info('>>>> Entering fetchResourcesForUser job');
        const { userId } = job.attrs.data;

        try {
            await fetchResourcesForUser(userId);
        } catch (e) {
            logger.error('error in fetchResourcesForUser', e);
        }
    });
}