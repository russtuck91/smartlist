
/**
 * Reference: https://developer.spotify.com/documentation/web-api/concepts/api-calls
 */

export interface SpResponse<T> {
    body: T;
    headers: Record<string, string>;
    statusCode: number;
}

interface SpotifyError extends SpResponse<{
    error?: SpotifyApi.ErrorObject;
}> {
}

export function isSpotifyError(input: any): input is SpotifyError {
    return input.statusCode && input.body;
}

interface SpotifyAuthError extends SpResponse<{
    error: string;
    error_description: string;
}> {
}

export function isSpotifyAuthError(input: any): input is SpotifyAuthError {
    return input.statusCode && input.body && typeof input.body.error === 'string';
}

export function isSpotify401Error(input: any): input is SpotifyError {
    return isSpotifyError(input) && input.statusCode === 401;
}
