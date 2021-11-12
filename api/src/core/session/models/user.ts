import { DBObject } from '../../shared-models';

export interface User extends DBObject {
    username: string;

    sessionTokens: string[];

    // Spotify
    accessToken: string;
    refreshToken: string;

    // Feature flags
    useNewCacheFeature: boolean;
}
