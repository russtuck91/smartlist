import * as Factory from 'factory.ts';

import {
    AlbumContainsRule,
    ArtistContainsRule, ArtistIsRule,
    InstrumentalRule,
    RuleComparator, RuleParam,
    SavedRule,
} from '../../../../shared';


export const savedRuleFactory = Factory.Sync.makeFactory<SavedRule>({
    param: RuleParam.Saved,
    comparator: RuleComparator.Is,
    value: true,
});

export const artistIsRuleFactory = Factory.Sync.makeFactory<ArtistIsRule>({
    param: RuleParam.Artist,
    comparator: RuleComparator.Is,
    value: '',
});

export const artistContainsRuleFactory = Factory.Sync.makeFactory<ArtistContainsRule>({
    param: RuleParam.Artist,
    comparator: RuleComparator.Contains,
    value: '',
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
