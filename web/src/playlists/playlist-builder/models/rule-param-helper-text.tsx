import React from 'react';

import { RuleParam } from '../../../../../shared';


const ruleParamHelperTextMap: Map<string, React.ReactNode> = new Map([
    [RuleParam.Tempo, (
        <>
            Tempo is the speed or pace.
            <br />
            Values are in beats per minute (BPM),
            <br />
            {' '}
            up to around 240.
        </>
    )],
    [RuleParam.Energy, (
        <>
            Energy is a measure of intensity and activity.
            <br />
            Values are from 0 to 1.
        </>
    )],
]);

export default ruleParamHelperTextMap;
