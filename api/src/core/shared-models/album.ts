

export interface Album {
    id: string;
    name: string;

    artistIds: string[];
    artistNames: string[];

    releaseDate: string;
    thumbnail?: string;
    genres: string[];
    popularity: number;
}
