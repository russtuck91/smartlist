import { SimpleDBObject } from './db';


export interface User extends SimpleDBObject {
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
