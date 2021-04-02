export interface SpResponse<T> {
    body: T;
    headers: Record<string, string>;
    statusCode: number;
}
