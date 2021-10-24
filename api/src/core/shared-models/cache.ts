
export interface SavedCacheRecord<T> {
    item: T;
    lastFetched: Date;
}

export interface CacheableResource {
    id: string;
}

export interface ChronoCacheRecord {
    userId: string;
    tracks: SpotifyApi.SavedTrackObject[];
}
