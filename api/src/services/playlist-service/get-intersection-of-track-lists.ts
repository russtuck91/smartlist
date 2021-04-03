import { intersectionWith } from 'lodash';


function getIntersectionOfTrackLists<T extends SpotifyApi.TrackObjectFull | SpotifyApi.TrackObjectSimplified>(listsOfTrackResults: (T[])[]): T[] {
    const listOne = listsOfTrackResults[0];
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
