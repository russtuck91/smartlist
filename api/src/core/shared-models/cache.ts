
export interface SavedCacheRecord<T> {
    item: T;
    lastFetched: Date;
}

export interface CacheableResource {
    id: string;
}
