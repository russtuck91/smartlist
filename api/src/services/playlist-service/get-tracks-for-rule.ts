import { isAlbumIsRule, isArtistIsRule, isPlaylistTypeRule, PlaylistRule, RuleParam } from '../../../../shared';

import spotifyService from '../spotify-service/spotify-service';


async function getTracksForRule(rule: PlaylistRule, accessToken: string|undefined): Promise<(SpotifyApi.TrackObjectFull[] | null)> {
    if (rule.param === RuleParam.Saved) {
        return await spotifyService.getFullMySavedTracks(accessToken);
    }
    if (isPlaylistTypeRule(rule)) {
        return await spotifyService.getTracksForPlaylist(rule.value.id, accessToken);
    }
    if (isArtistIsRule(rule)) {
        return await spotifyService.getTracksForArtists([ rule.value.id ], accessToken);
    }
    if (isAlbumIsRule(rule)) {
        return await spotifyService.getTracksForAlbums([ rule.value.id ], accessToken);
    }
    return null;
}

export default getTracksForRule;
