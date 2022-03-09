import jestGlobals from '@jest/globals';
import { jest } from '@jest/globals';


console.log('>>>> Entering setupTests (api)');

Object.entries(jestGlobals).map(([key, value]) => {
    global[key] = value;
});

jest.mock('mongtype');

