import { getComparatorsForParam, PlaylistRule, RuleComparator, RuleParam } from '../../../../../shared';


export const getNewConditionByParam = (param: RuleParam): PlaylistRule => {
    const allowedComparators = getComparatorsForParam(param);
    const defaultComparator = allowedComparators[0];
    const defaultValue = ([RuleParam.Saved, RuleParam.Instrumental].includes(param)) ? true :
        (defaultComparator === RuleComparator.Between) ? { start: '', end: '' } :
            '';

    return { param: param, comparator: defaultComparator, value: defaultValue };
};

export const DEFAULT_NEW_CONDITION: PlaylistRule = getNewConditionByParam(RuleParam.Artist);

