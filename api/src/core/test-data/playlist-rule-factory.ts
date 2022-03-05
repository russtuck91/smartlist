import * as Factory from 'factory.ts';

import { AlbumContainsRule, RuleComparator, RuleParam } from '../../../../shared';


export const albumContainsRuleFactory = Factory.Sync.makeFactory<AlbumContainsRule>({
    param: RuleParam.Album,
    comparator: RuleComparator.Contains,
    value: '',
});
