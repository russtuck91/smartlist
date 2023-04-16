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
