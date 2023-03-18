import { ObjectId } from 'mongodb';

import { SimpleDBObject } from './db';
import { PlaylistRule } from './playlist-rule';

export interface Playlist extends SimpleDBObject {
    name: string;

    rules: PlaylistRuleGroup[];
    exceptions: PlaylistRule[];
    trackSort?: PlaylistTrackSortOption;

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
    Or = 'Or',
}

export enum PlaylistTrackSortOption {
    None = 'None',
    Artist = 'Artist',
    Album = 'Album',
    Track = 'Track',
    SavedDate = 'SavedDate',
}
