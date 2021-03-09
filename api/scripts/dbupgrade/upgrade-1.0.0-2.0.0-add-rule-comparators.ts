import { isPlaylistRuleGroup, PlaylistRule, PlaylistRuleGroup, RuleComparator, RuleParam } from '../../../shared';

import { db } from '../../src/core/db/db';
import logger from '../../src/core/logger/logger';


function addComparatorToRuleGroups(rules: PlaylistRuleGroup[]): PlaylistRuleGroup[] {
    return rules.map((rule) => addComparatorToRuleGroup(rule));
}

function addComparatorToRuleGroup(rule: PlaylistRuleGroup): PlaylistRuleGroup {
    return {
        ...rule,
        rules: addComparatorToEither(rule.rules),
    };
}

function addComparatorToEither(rules: (PlaylistRule|PlaylistRuleGroup)[]): (PlaylistRule|PlaylistRuleGroup)[] {
    return rules.map((rule) => {
        if (isPlaylistRuleGroup(rule)) {
            return addComparatorToRuleGroup(rule);
        } else {
            return addComparatorToRule(rule);
        }
    });
}

function addComparatorToRule(rule: PlaylistRule): PlaylistRule {
    switch (rule.param) {
        case RuleParam.Artist:
        case RuleParam.Album:
        case RuleParam.Track:
            rule.comparator = RuleComparator.Contains;
            break;
        case RuleParam.Genre:
        case RuleParam.Year:
            rule.comparator = RuleComparator.Is;
            break;
    }

    return rule;
}

async function addRuleComparators() {
    try {
        const playlists = await db.playlists.find();
        for (const playlist of playlists) {
            playlist.rules = addComparatorToRuleGroups(playlist.rules);
            await db.playlists.update(
                { _id: playlist._id },
                { $set: playlist },
            );
        }
    } catch (e) {
        logger.info('Error in addRuleComparators');
        logger.error(e);
        throw e;
    }
}
export default addRuleComparators;

