import { differenceWith } from 'lodash';

import { HasId } from '../../core/shared-models';


function getDifferenceOfTrackLists<T extends HasId>(source: T[], listsOfTrackExclusions: (T[])[]): T[] {
    if (listsOfTrackExclusions.length === 0) { return source; }
    const listOne = listsOfTrackExclusions[0];
    const results = differenceWith<T, T, T, T>(
        source,
        listOne,
        listOne,
        ...listsOfTrackExclusions,
        (a: T, b: T) => {
            return a.id === b.id;
        },
    );

    return results;
}

export default getDifferenceOfTrackLists;
