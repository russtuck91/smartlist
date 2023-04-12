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
    Energy = 'Energy',
    Instrumental = 'Instrumental',
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
        param === RuleParam.Playlist ||
        param === RuleParam.Instrumental
    ) {
        return [ RuleComparator.Is ];
    }

    if (
        param === RuleParam.Year
    ) {
        return [ RuleComparator.Is, RuleComparator.Between ];
    }

    if (
        param === RuleParam.Tempo ||
        param === RuleParam.Energy
    ) {
        return [ RuleComparator.Between ];
    }

    return [ RuleComparator.Is, RuleComparator.Contains ];
}

export type SearchItem = SpotifyApi.ArtistObjectFull | SpotifyApi.AlbumObjectSimplified | SpotifyApi.TrackObjectFull | SpotifyApi.PlaylistObjectSimplified;
export function isSearchItem(value: PlaylistRule['value']): value is SearchItem {
    if (typeof value !== 'object' || value === null) return false;
    const cast = value as SearchItem;
    return cast.id !== undefined && cast.name !== undefined && cast.type !== undefined;
}

export interface BetweenValue {
    start: string;
    end: string;
}
export function isBetweenValue(value: PlaylistRule['value']): value is BetweenValue {
    if (typeof value !== 'object' || value == null) return false;
    const cast = value as BetweenValue;
    return cast.start !== undefined && cast.end !== undefined;
}
