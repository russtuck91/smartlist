import { random, times } from 'lodash';


function randomStringFactory(numChars: number) {
    return times(numChars, () => random(35).toString(36)).join('');
}

export default randomStringFactory;
