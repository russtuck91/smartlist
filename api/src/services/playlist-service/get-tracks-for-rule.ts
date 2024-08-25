import {
    isAlbumIsRule, isArtistIsRule, isPlaylistTypeRule, isSavedRule,
    isSearchItem,
    PlaylistRule, Track,
} from '../../../../shared';

import { mapToTrack } from '../../mappers/spotify/track-object-full-mapper';

import spotifyCacheService from '../cache/spotify/spotify-cache-service';
import spotifyService from '../spotify-service/spotify-service';


async function getTracksForRule(rule: PlaylistRule, accessToken: string): Promise<(Track[] | null)> {
    if (isSavedRule(rule)) {
        return await spotifyCacheService.getFullMySavedTracks(accessToken);
    }
    if (isPlaylistTypeRule(rule)) {
        return (await spotifyService.getTracksForPlaylist(rule.value.id, accessToken)).map(mapToTrack);
    }
    if (isArtistIsRule(rule)) {
        if (isSearchItem(rule.value)) {
            return await spotifyCacheService.getTracksForArtist(rule.value.id, accessToken);
        }
        return await spotifyService.getTracksForArtistName(rule.value, accessToken);
    }
    if (isAlbumIsRule(rule) && isSearchItem(rule.value)) {
        return (await spotifyService.getTracksForAlbums([ rule.value.id ], accessToken)).map(mapToTrack);
    }
    return null;
}

export default getTracksForRule;
