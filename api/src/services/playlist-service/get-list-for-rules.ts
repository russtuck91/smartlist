import { PlaylistRule, RuleParam } from '../../../../shared';

import logger from '../../core/logger/logger';

import spotifyService from '../spotify-service/spotify-service';

import filterListOfSongs from './filter-list-of-songs';
import getIntersectionOfTrackLists from './get-intersection-of-track-lists';
import getTracksForRule from './get-tracks-for-rule';


async function getListForRules(
    rules: PlaylistRule[],
    accessToken: string|undefined,
    currentBatchOfSongs: SpotifyApi.TrackObjectFull[]|undefined,
): Promise<SpotifyApi.TrackObjectFull[]> {
    logger.debug('>>>> Entering getListForRules()');

    // Separate rules by those that can optionally be filtered from a list (Artist, Album, Genre, etc)
    // vs those that require their own fetch (My Saved, a Playlist)
    const canBeFilteredFromABatch: PlaylistRule[] = [];
    const requiresOwnFetch: PlaylistRule[] = [];
    rules.map((rule) => {
        if ([RuleParam.Artist, RuleParam.Album, RuleParam.Track, RuleParam.Genre, RuleParam.Year, RuleParam.Tempo].includes(rule.param)) {
            canBeFilteredFromABatch.push(rule);
        } else {
            requiresOwnFetch.push(rule);
        }
    });

    // If there are none that require a fetch
    if (requiresOwnFetch.length === 0) {
        // If working from a batch of songs
        if (currentBatchOfSongs) {
            // Filter list of songs by filterable rules
            const filteredBatch = await filterListOfSongs(currentBatchOfSongs, canBeFilteredFromABatch, accessToken);
            return filteredBatch;
        }

        // Else, we are NOT working from a batch, then fetch tracks
        const listsOfTrackResults: (SpotifyApi.TrackObjectFull[])[] = [];

        // Send special rules through specific APIs, others through getFullSearchResults
        for (let i = rules.length - 1; i >= 0; i--) {
            const rule = rules[i];
            const ruleResults = await getTracksForRule(rule, accessToken);
            if (ruleResults) {
                listsOfTrackResults.push(ruleResults);
                rules.splice(i, 1);
            }
        }

        const searchResults = await spotifyService.getFullSearchResults(rules, accessToken);
        if (searchResults) {
            listsOfTrackResults.push(searchResults.items);
        }

        // Union the results
        return getIntersectionOfTrackLists(listsOfTrackResults);

    } else {
        // Else, do fetch for each fetch-required rule
        const listsOfTrackResults: (SpotifyApi.TrackObjectFull[])[] = (await Promise.all(
            requiresOwnFetch.map((rule) => getTracksForRule(rule, accessToken)),
        )).filter((list): list is SpotifyApi.TrackObjectFull[] => !!list);
        // Union the results
        const unionOfTrackResults = getIntersectionOfTrackLists(listsOfTrackResults);
        // And filter by the filter-able rules
        const filteredUnion = await filterListOfSongs(unionOfTrackResults, canBeFilteredFromABatch, accessToken);
        return filteredUnion;
    }
}

export default getListForRules;
