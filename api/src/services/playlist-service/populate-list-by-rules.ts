import { union } from 'lodash';

import { PlaylistRuleGroup } from '../../../../shared';

import logger from '../../core/logger/logger';

import getListForRuleGroup from './get-list-for-rule-group';


async function populateListByRules(rules: PlaylistRuleGroup[], accessToken: string|undefined): Promise<SpotifyApi.TrackObjectFull[]> {
    logger.debug('>>>> Entering populateListByRules()');

    const results: (SpotifyApi.TrackObjectFull[])[] = await Promise.all(
        rules.map((rule) => {
            return getListForRuleGroup(rule, accessToken, undefined);
        }),
    );

    const unionResult = union(...results);

    return unionResult;
}

export default populateListByRules;
