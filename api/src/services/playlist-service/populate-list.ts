import { union } from 'lodash';

import { Playlist, Track } from '../../../../shared';

import logger from '../../core/logger/logger';

import getDifferenceOfTrackLists from './get-difference-of-track-lists';
import getListForRuleGroup from './get-list-for-rule-group';
import getListForRules from './get-list-for-rules';


async function populateList(playlist: Playlist, accessToken: string): Promise<Track[]> {
    logger.debug('>>>> Entering populateList()');

    const results: (Track[])[] = await Promise.all(
        playlist.rules.map((rule) => {
            return getListForRuleGroup(rule, accessToken, undefined);
        }),
    );

    const unionResult = union(...results);

    // Send exceptions separately through getListForRules with a currentBatchOfSongs
    const listOfTrackExclusions = await Promise.all(
        playlist.exceptions.map((rule) => {
            return getListForRules([ rule ], accessToken, unionResult);
        }),
    );

    // Difference each of them from the main batch of songs
    const filteredForExceptions = getDifferenceOfTrackLists(unionResult, listOfTrackExclusions);

    logger.debug(`<<<< Exiting populateList(), the playlist will have ${filteredForExceptions.length} songs`);
    return filteredForExceptions;
}

export default populateList;
