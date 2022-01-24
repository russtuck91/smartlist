import { UserSavedTrackReference } from '../../core/shared-models';


export function mapToTrackObjectFull(savedTrackObject: SpotifyApi.SavedTrackObject): SpotifyApi.TrackObjectFull {
    return savedTrackObject.track;
}

export function mapToUserSavedTrackReference(savedTrackObject: SpotifyApi.SavedTrackObject): UserSavedTrackReference {
    return {
        added_at: savedTrackObject.added_at,
        trackId: savedTrackObject.track.id,
    };
}
