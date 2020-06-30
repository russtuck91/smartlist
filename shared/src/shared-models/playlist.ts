import { ObjectId } from 'mongodb';

import { SimpleDBObject } from './db';

export interface Playlist extends SimpleDBObject {
    name: string;

    rules: PlaylistRuleGroup[];

    userId: ObjectId;
    spotifyPlaylistId?: string;
    lastPublished?: Date;
    deleted?: boolean;
}

export interface PlaylistRuleGroup {
    type: RuleGroupType;
    rules: (PlaylistRule|PlaylistRuleGroup)[];
}
export function isPlaylistRuleGroup(input: any): input is PlaylistRuleGroup {
    const typed: PlaylistRuleGroup = input;
    return typed.type !== undefined && typed.rules !== undefined;
}

export enum RuleGroupType {
    And = 'And',
    Or = 'Or'
}

export interface PlaylistRule {
    param: RuleParam;
    // comparator? equals, contains, gt, lt
    value: string|boolean;
}

export enum RuleParam {
    Saved = 'Saved',
    Artist = 'Artist',
    Album = 'Album',
    Track = 'Track',
    Genre = 'Genre',
    Year = 'Year',
    Playlist = 'Playlist'
}