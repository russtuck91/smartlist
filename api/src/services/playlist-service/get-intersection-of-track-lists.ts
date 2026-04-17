import { intersectionWith } from 'lodash';

import { HasId } from '../../core/shared-models';


function getIntersectionOfTrackLists<T extends HasId>(listsOfTrackResults: (T[])[]): T[] {
    if (listsOfTrackResults.length === 1) { return listsOfTrackResults[0]!; }
    const listOne = listsOfTrackResults[0]!;
    const results = intersectionWith<T, T, T, T>(
        listOne,
        listOne,
        listOne,
        ...listsOfTrackResults,
        (a: T, b: T) => {
            return a.id === b.id;
        },
    );

    return results;
}

export default getIntersectionOfTrackLists;
