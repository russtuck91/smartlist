import { DBObject } from '../../shared-models';

export interface User extends DBObject {
    username: string;
    email: string;

    sessionToken: string[];

    // Spotify
    accessToken: string;
    refreshToken: string;
    spotifyPermissionError?: boolean;

    // Feature flags
    suppressNewCacheFeature: boolean;
    enableNotificationFeature: boolean;
}
