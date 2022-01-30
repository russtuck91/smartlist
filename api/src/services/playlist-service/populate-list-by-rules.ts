import { union } from 'lodash';

import { PlaylistRuleGroup, Track } from '../../../../shared';

import logger from '../../core/logger/logger';

import getListForRuleGroup from './get-list-for-rule-group';


async function populateListByRules(rules: PlaylistRuleGroup[], accessToken: string): Promise<Track[]> {
    logger.debug('>>>> Entering populateListByRules()');

    const results: (Track[])[] = await Promise.all(
        rules.map((rule) => {
            return getListForRuleGroup(rule, accessToken, undefined);
        }),
    );

    const unionResult = union(...results);

    logger.debug(`<<<< Exiting populateListByRules(), the playlist will have ${unionResult.length} songs`);
    return unionResult;
}

export default populateListByRules;
