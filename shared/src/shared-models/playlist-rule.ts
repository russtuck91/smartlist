export interface PlaylistRule {
    param: RuleParam;
    comparator?: RuleComparator;
    value: string|boolean|SearchItem|BetweenValue;
}

export enum RuleParam {
    Saved = 'Saved',
    Artist = 'Artist',
    Album = 'Album',
    Track = 'Track',
    Genre = 'Genre',
    Year = 'Year',
    Playlist = 'Playlist',
    Tempo = 'Tempo',
}

export enum RuleComparator {
    Is = 'Is',
    Contains = 'Contains',
    Between = 'Between',
}

export function getComparatorsForParam(param: RuleParam): RuleComparator[] {
    if (
        param === RuleParam.Saved ||
        param === RuleParam.Genre ||
        param === RuleParam.Playlist
    ) {
        return [ RuleComparator.Is ];
    }

    if (
        param === RuleParam.Year
    ) {
        return [ RuleComparator.Is, RuleComparator.Between ];
    }

    if (
        param === RuleParam.Tempo
    ) {
        return [ RuleComparator.Between ];
    }

    return [ RuleComparator.Is, RuleComparator.Contains ];
}

export type SearchItemBase = SpotifyApi.ArtistObjectFull | SpotifyApi.AlbumObjectSimplified | SpotifyApi.TrackObjectFull | SpotifyApi.PlaylistObjectSimplified;
export type SearchItem = SearchItemBase & {
    images?: SpotifyApi.ImageObject[];
}

export interface BetweenValue {
    start: string;
    end: string;
}
