import { startTransaction } from '@sentry/node';
import { union } from 'lodash';

import { Playlist, TrackList } from '../../../../shared';

import logger from '../../core/logger/logger';
import { doAndRetry } from '../../core/session/session-util';

import { getUserById } from '../user-service';

import getDifferenceOfTrackLists from './get-difference-of-track-lists';
import getListForRuleGroup from './get-list-for-rule-group';
import getListForRules from './get-list-for-rules';
import sortTrackList from './sort-track-list';


async function populateList(playlist: Playlist, accessTokenOld: string): Promise<TrackList> {
    logger.debug('>>>> Entering populateList()');
    const transaction = startTransaction({
        op: 'populateList',
        name: 'Populate List',
    });

    try {
        const user = await getUserById(playlist.userId);
        return await doAndRetry(async (accessToken) => {
            const results: (TrackList)[] = await Promise.all(
                playlist.rules.map((rule) => {
                    return getListForRuleGroup(rule, accessToken, undefined);
                }),
            );

            const unionResult: TrackList = union(...results);

            // Send exceptions separately through getListForRules with a currentBatchOfSongs
            const listOfTrackExclusions: TrackList[] = await Promise.all(
                playlist.exceptions.map((rule) => {
                    return getListForRules([ rule ], accessToken, unionResult);
                }),
            );

            // Difference each of them from the main batch of songs
            const filteredForExceptions: TrackList = getDifferenceOfTrackLists(unionResult, listOfTrackExclusions);

            const sortedList: TrackList = await sortTrackList(filteredForExceptions, playlist.trackSort, accessToken);

            logger.debug(`<<<< Exiting populateList(), the playlist will have ${sortedList.length} songs`);
            transaction.finish();
            return sortedList;
        }, user);
    } catch (e) {
        logger.error('Error in populateList()');
        logger.error(e);
        transaction.setStatus('internal_error');
        transaction.finish();
        throw e;
    }
}

export default populateList;
