

export type SourceMethod<R> = (ids: string[], accessToken: string|undefined) => Promise<R[]>;

