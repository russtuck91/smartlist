import * as Factory from 'factory.ts';

import { AlbumContainsRule, RuleComparator, RuleParam, SavedRule } from '../../../../shared';


export const savedRuleFactory = Factory.Sync.makeFactory<SavedRule>({
    param: RuleParam.Saved,
    comparator: RuleComparator.Is,
    value: true,
});

export const albumContainsRuleFactory = Factory.Sync.makeFactory<AlbumContainsRule>({
    param: RuleParam.Album,
    comparator: RuleComparator.Contains,
    value: '',
});
