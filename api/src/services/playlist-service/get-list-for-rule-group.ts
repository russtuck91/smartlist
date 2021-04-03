import { union } from 'lodash';

import { isPlaylistRuleGroup, PlaylistRule, PlaylistRuleGroup, RuleGroupType } from '../../../../shared';

import logger from '../../core/logger/logger';

import getIntersectionOfTrackLists from './get-intersection-of-track-lists';
import getListForRules from './get-list-for-rules';


async function getListForRuleGroup(
    ruleGroup: PlaylistRuleGroup,
    accessToken: string|undefined,
    currentBatchOfSongs: SpotifyApi.TrackObjectFull[]|undefined,
): Promise<SpotifyApi.TrackObjectFull[]> {
    logger.debug('>>>> Entering getListForRuleGroup()');

    if (ruleGroup.type === RuleGroupType.Or) {
        // Send each individual rule to getListForRules
        const listOfTrackResults = await Promise.all(
            ruleGroup.rules.map((rule) => {
                if (isPlaylistRuleGroup(rule)) {
                    return getListForRuleGroup(rule, accessToken, currentBatchOfSongs);
                } else {
                    return getListForRules([ rule ], accessToken, currentBatchOfSongs);
                }
            }),
        );

        logger.debug('Query Results, OR path, ');
        // logger.debug(listOfTrackResults);

        // Get "OR" union
        const results = union(...listOfTrackResults);

        return results;
    } else {
        // Send batches of PlaylistRules to getListForRules, send individual PlaylistRuleGroups
        const straightRules: PlaylistRule[] = [];
        const nestedRuleGroups: PlaylistRuleGroup[] = [];

        ruleGroup.rules.map((rule) => {
            if (isPlaylistRuleGroup(rule)) {
                nestedRuleGroups.push(rule);
            } else {
                straightRules.push(rule);
            }
        });

        const listsOfTrackResults: (SpotifyApi.TrackObjectFull[])[] = [];

        // Do straight rules before nestedRuleGroups, then send results into call for nestedRuleGroups
        if (straightRules.length > 0) {
            const straightRuleResults = await getListForRules(straightRules, accessToken, currentBatchOfSongs);
            listsOfTrackResults.push(straightRuleResults);
        }

        const nestedRuleGroupResults: (SpotifyApi.TrackObjectFull[])[] = await Promise.all(
            nestedRuleGroups.map((rule) => {
                return getListForRuleGroup(rule, accessToken, listsOfTrackResults[0]);
            }),
        );
        listsOfTrackResults.push(...nestedRuleGroupResults);

        logger.debug('Query Results, AND path...');
        // logger.debug(listsOfTrackResults[0][0]);
        // logger.debug(listsOfTrackResults[1][0]);

        if (listsOfTrackResults.length <= 1) {
            return listsOfTrackResults[0];
        }

        // Get "AND" intersection
        const results = getIntersectionOfTrackLists(listsOfTrackResults);
        return results;
    }
}

export default getListForRuleGroup;
