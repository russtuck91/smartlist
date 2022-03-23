import { union } from 'lodash';

import { Playlist, Track } from '../../../../shared';

import logger from '../../core/logger/logger';

import filterListOfSongs from './filter-list-of-songs';
import getListForRuleGroup from './get-list-for-rule-group';


async function populateList(playlist: Playlist, accessToken: string): Promise<Track[]> {
    logger.debug('>>>> Entering populateList()');

    const results: (Track[])[] = await Promise.all(
        playlist.rules.map((rule) => {
            return getListForRuleGroup(rule, accessToken, undefined);
        }),
    );

    const unionResult = union(...results);

    const filteredForExceptions = await filterListOfSongs(unionResult, playlist.exceptions, accessToken, true);

    logger.debug(`<<<< Exiting populateList(), the playlist will have ${filteredForExceptions.length} songs`);
    return filteredForExceptions;
}

export default populateList;
