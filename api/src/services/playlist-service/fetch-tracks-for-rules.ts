import { PlaylistRule, Track } from '../../../../shared';

import { mapToTrack } from '../../mappers/spotify/track-object-full-mapper';

import spotifyService from '../spotify-service/spotify-service';

import getIntersectionOfTrackLists from './get-intersection-of-track-lists';
import getTracksForRule from './get-tracks-for-rule';


// TODO promises from getTracksForRule calls do more in parallel

async function fetchTracksForRules(rules: PlaylistRule[], accessToken: string): Promise<Track[]> {
    const listsOfTrackResults: (Track[])[] = [];

    // Send special rules through specific APIs, others through getFullSearchResults
    for (let i = rules.length - 1; i >= 0; i--) {
        const rule = rules[i]!;
        const ruleResults = await getTracksForRule(rule, accessToken);
        if (ruleResults) {
            listsOfTrackResults.push(ruleResults);
            rules.splice(i, 1);
        }
    }

    const searchResults = await spotifyService.getFullSearchResults(rules, accessToken);
    if (searchResults) {
        listsOfTrackResults.push(searchResults.items.map(mapToTrack));
    }

    // Union the results
    const union = getIntersectionOfTrackLists(listsOfTrackResults);
    return union;
}

export default fetchTracksForRules;
