export interface Playlist {
    title: string;

    rules: PlaylistRuleGroup[];
}

interface PlaylistRuleGroup {
    type: 'and'|'or';
    rules: (PlaylistRule|PlaylistRuleGroup)[];
}

interface PlaylistRule {
    param: string;
    value: string;
}