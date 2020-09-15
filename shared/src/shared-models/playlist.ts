import { ObjectId } from 'mongodb';

import { SimpleDBObject } from './db';
import { convertEnumToArray } from '../util/object-util';

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
    comparator?: RuleComparator;
    value: string|boolean|SearchItem;
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

export enum RuleComparator {
    Is = 'Is',
    Contains = 'Contains'
}

export function getComparatorsForParam(param: RuleParam): RuleComparator[] {
    if (
        param === RuleParam.Genre ||
        param === RuleParam.Year ||
        param === RuleParam.Playlist
    ) {
        return [ RuleComparator.Is ];
    }

    return convertEnumToArray(RuleComparator);
}

export type SearchItemBase = SpotifyApi.ArtistObjectFull | SpotifyApi.AlbumObjectSimplified | SpotifyApi.TrackObjectFull | SpotifyApi.PlaylistObjectSimplified;
export type SearchItem = SearchItemBase & {
    images?: SpotifyApi.ImageObject[];
}
