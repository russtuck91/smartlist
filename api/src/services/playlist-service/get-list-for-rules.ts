import { PlaylistRule, RuleParam, Track } from '../../../../shared';

import logger from '../../core/logger/logger';

import fetchTracksForRules from './fetch-tracks-for-rules';
import filterListOfSongs from './filter-list-of-songs';


const rulesThatCanBeFiltered = [
    RuleParam.Artist, RuleParam.Album, RuleParam.Track, RuleParam.Genre, RuleParam.Year,
    RuleParam.Tempo, RuleParam.Energy, RuleParam.Instrumental,
];

const rulesThatCanBeFetched = [
    RuleParam.Saved,
    RuleParam.Playlist,
    RuleParam.Artist, RuleParam.Album, RuleParam.Track, RuleParam.Genre, RuleParam.Year,
];

async function getListForRules(
    rules: PlaylistRule[],
    accessToken: string,
    currentBatchOfSongs: Track[] | undefined,
): Promise<Track[]> {
    logger.debug('>>>> Entering getListForRules()');

    // Separate rules by fetch-able and filter-able status, i.e.:
    // - can be filtered (Artist, Album, Genre, etc)
    // - must be fetched (Saved, Playlist)
    // - must be filtered (Tempo, Energy)
    const canBeFiltered: PlaylistRule[] = [];
    const mustBeFetched: PlaylistRule[] = [];
    const canBeFetched: PlaylistRule[] = [];
    const mustBeFiltered: PlaylistRule[] = [];
    rules.map((rule) => {
        if (rulesThatCanBeFiltered.includes(rule.param)) {
            canBeFiltered.push(rule);
        } else {
            mustBeFetched.push(rule);
        }
        if (rulesThatCanBeFetched.includes(rule.param)) {
            canBeFetched.push(rule);
        } else {
            mustBeFiltered.push(rule);
        }
    });

    // If there are none that require a fetch AND not working from a batch of songs
    // Then do fetchEager mode - perform fetch for rules that could be either fetched or filtered
    const fetchEager = mustBeFetched.length === 0 && !currentBatchOfSongs;
    const rulesToFetch = fetchEager ? canBeFetched : mustBeFetched;
    const rulesToFilter = fetchEager ? mustBeFiltered : canBeFiltered;

    const fetchBaseList = mustBeFetched.length === 0 && currentBatchOfSongs ? currentBatchOfSongs : await fetchTracksForRules(rulesToFetch, accessToken);
    const filteredList = await filterListOfSongs(fetchBaseList, rulesToFilter, accessToken);
    return filteredList;
}

export default getListForRules;
