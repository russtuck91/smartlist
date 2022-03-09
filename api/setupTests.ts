import jestGlobals from '@jest/globals';
import { jest } from '@jest/globals';


Object.entries(jestGlobals).map(([key, value]) => {
    global[key] = value;
});

jest.mock('mongtype');

