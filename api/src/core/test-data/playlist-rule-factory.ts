import * as Factory from 'factory.ts';

import { AlbumContainsRule, InstrumentalRule, RuleComparator, RuleParam, SavedRule } from '../../../../shared';


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

export const instrumentalRuleFactory = Factory.Sync.makeFactory<InstrumentalRule>({
    param: RuleParam.Instrumental,
    comparator: RuleComparator.Is,
    value: false,
});
