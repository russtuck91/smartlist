import React from 'react';

import { RuleParam } from '../../../../../shared';


const ruleParamHelperTextMap: Map<string, React.ReactNode> = new Map([
    [RuleParam.Tempo, (
        <>
            The speed or pace.
            <br />
            Values in beats per minute (BPM),
            <br />
            {' '}
            up to around 240.
        </>
    )],
    [RuleParam.Energy, (
        <>
            Intensity and activity.
            <br />
            Values from 0 to 1.
        </>
    )],
]);

export default ruleParamHelperTextMap;
