import { Playlist, PlaylistRule, RuleComparator, RuleParam } from '../../../../../shared';

export interface PlaylistBuilderFormValues extends Pick<Playlist, 'name'|'rules'> {

}

export const getNewConditionByParam = (param: RuleParam): PlaylistRule => {
    switch (param) {
        case RuleParam.Saved:
            return { param: param, comparator: RuleComparator.Is, value: true };
        default:
            return { param: param, comparator: RuleComparator.Is, value: '' };
    }
};

export const DEFAULT_NEW_CONDITION: PlaylistRule = getNewConditionByParam(RuleParam.Artist);
