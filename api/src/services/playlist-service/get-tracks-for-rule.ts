import { isAlbumIsRule, isArtistIsRule, isPlaylistTypeRule, PlaylistRule, RuleParam, Track } from '../../../../shared';

import { mapToTrack } from '../../mappers/spotify/track-object-full-mapper';

import spotifyCacheService from '../cache/spotify/spotify-cache-service';
import spotifyService from '../spotify-service/spotify-service';


async function getTracksForRule(rule: PlaylistRule, accessToken: string): Promise<(Track[] | null)> {
    if (rule.param === RuleParam.Saved) {
        return await spotifyCacheService.getFullMySavedTracks(accessToken);
    }
    if (isPlaylistTypeRule(rule)) {
        return (await spotifyService.getTracksForPlaylist(rule.value.id, accessToken)).map(mapToTrack);
    }
    if (isArtistIsRule(rule)) {
        return (await spotifyService.getTracksForArtists([ rule.value.id ], accessToken)).map(mapToTrack);
    }
    if (isAlbumIsRule(rule)) {
        return (await spotifyService.getTracksForAlbums([ rule.value.id ], accessToken)).map(mapToTrack);
    }
    return null;
}

export default getTracksForRule;
