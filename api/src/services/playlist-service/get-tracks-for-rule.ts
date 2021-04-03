import { PlaylistRule, RuleParam } from '../../../../shared';

import spotifyService from '../spotify-service/spotify-service';


async function getTracksForRule(rule: PlaylistRule, accessToken: string|undefined): Promise<(SpotifyApi.TrackObjectFull)[]> {
    switch (rule.param) {
        case RuleParam.Saved:
            return await spotifyService.getFullMySavedTracks(accessToken);
        case RuleParam.Playlist:
            if (typeof rule.value === 'object') {
                return await spotifyService.getTracksForPlaylist(rule.value.id, accessToken);
            }
            break;
        case RuleParam.Artist:
            if (typeof rule.value === 'object') {
                return await spotifyService.getTracksForArtists([ rule.value.id ], accessToken);
            }
            break;
        case RuleParam.Album:
            if (typeof rule.value === 'object') {
                return await spotifyService.getTracksForAlbums([ rule.value.id ], accessToken);
            }
            break;
    }
    return [];
}

export default getTracksForRule;
