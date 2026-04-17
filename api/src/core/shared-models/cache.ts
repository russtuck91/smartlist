
export interface SavedCacheRecord<T> {
    item: T;
    lastFetched: Date;
    usageCount: number;
}

export interface CacheableResource {
    id: string;
}

export interface ChronoCacheRecord {
    userId: string;
    tracks: UserSavedTrackReference[];
}

export interface UserSavedTrackReference {
    added_at: string;
    trackId: string;
}
