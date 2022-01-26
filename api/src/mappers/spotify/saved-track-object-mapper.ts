import { Track } from '../../../../shared';

import { UserSavedTrackReference } from '../../core/shared-models';

import * as TrackObjectFullMapper from './track-object-full-mapper';


export function mapToTrackObjectFull(savedTrackObject: SpotifyApi.SavedTrackObject): SpotifyApi.TrackObjectFull {
    return savedTrackObject.track;
}

export function mapToTrack(savedTrackObjct: SpotifyApi.SavedTrackObject): Track {
    return TrackObjectFullMapper.mapToTrack(mapToTrackObjectFull(savedTrackObjct));
}

export function mapToUserSavedTrackReference(savedTrackObject: SpotifyApi.SavedTrackObject): UserSavedTrackReference {
    return {
        added_at: savedTrackObject.added_at,
        trackId: savedTrackObject.track.id,
    };
}
