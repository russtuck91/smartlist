export interface Playlist {
    title: string;

    rules: PlaylistRuleGroup[];
}

export interface PlaylistRuleGroup {
    type: 'and'|'or';
    rules: (PlaylistRule|PlaylistRuleGroup)[];
}

export interface PlaylistRule {
    param: RuleParam;
    // comparator? equals, contains, gt, lt
    value: string;
}

enum RuleParam {
    Saved = 'Saved',
    Artist = 'Artist',
    Album = 'Album',
    Track = 'Track',
    Genre = 'Genre',
    Year = 'Year',
    Playlist = 'Playlist'
}