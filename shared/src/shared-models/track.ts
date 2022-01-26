

export interface Track {
    id: string;
    name: string;
    uri: string;

    albumId: string;
    albumName: string;
    albumReleaseDate: string;
    albumThumbnail?: string;

    artistIds: string[];
    artistNames: string[];

    disc_number: number;
    duration_ms: number;
    popularity: number;
    track_number: number;
}
