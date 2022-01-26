import { union } from 'lodash';

import { isPlaylistRuleGroup, PlaylistRule, PlaylistRuleGroup, RuleGroupType, Track } from '../../../../shared';

import logger from '../../core/logger/logger';

import getIntersectionOfTrackLists from './get-intersection-of-track-lists';
import getListForRules from './get-list-for-rules';


async function getListForRuleGroup(
    ruleGroup: PlaylistRuleGroup,
    accessToken: string,
    currentBatchOfSongs: Track[]|undefined,
): Promise<Track[]> {
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

        // Get "OR" union
        const results = union(...listOfTrackResults);

        logger.debug(`<<<< Exiting getListForRuleGroup, via the "OR" path. Found ${results.length} tracks for rules`);
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

        const listsOfTrackResults: (Track[])[] = [];

        // Do straight rules before nestedRuleGroups, then send results into call for nestedRuleGroups
        if (straightRules.length > 0) {
            const straightRuleResults = await getListForRules(straightRules, accessToken, currentBatchOfSongs);
            listsOfTrackResults.push(straightRuleResults);
        }

        const nestedRuleGroupResults: (Track[])[] = await Promise.all(
            nestedRuleGroups.map((rule) => {
                return getListForRuleGroup(rule, accessToken, listsOfTrackResults[0]);
            }),
        );
        listsOfTrackResults.push(...nestedRuleGroupResults);

        // Get "AND" intersection
        const results = getIntersectionOfTrackLists(listsOfTrackResults);

        logger.debug(`<<<< Exiting getListForRuleGroup, via the "AND" path. Found ${results.length} tracks for rules`);
        return results;
    }
}

export default getListForRuleGroup;
