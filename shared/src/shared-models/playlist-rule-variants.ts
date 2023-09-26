import {
    BetweenValue, PlaylistRule, RuleComparator, RuleParam, SearchItem,
} from './playlist-rule';


export interface SavedRule extends PlaylistRule {
    param: RuleParam.Saved;
    value: boolean;
}
export function isSavedRule(rule: PlaylistRule): rule is SavedRule {
    return rule.param === RuleParam.Saved;
}

export interface ArtistRule extends PlaylistRule {
    param: RuleParam.Artist;
    value: string|SearchItem;
}
export function isArtistRule(rule: PlaylistRule): rule is ArtistRule {
    return rule.param === RuleParam.Artist;
}
export interface ArtistIsRule extends ArtistRule {
    comparator: RuleComparator.Is;
}
export function isArtistIsRule(rule: PlaylistRule): rule is ArtistIsRule {
    return isArtistRule(rule) && rule.comparator === RuleComparator.Is;
}
export interface ArtistContainsRule extends ArtistRule {
    comparator: RuleComparator.Contains;
    value: string;
}
export function isArtistContainsRule(rule: PlaylistRule): rule is ArtistContainsRule {
    return isArtistRule(rule) && rule.comparator === RuleComparator.Contains;
}

export interface AlbumRule extends PlaylistRule {
    param: RuleParam.Album;
    value: string|SearchItem;
}
export function isAlbumRule(rule: PlaylistRule): rule is AlbumRule {
    return rule.param === RuleParam.Album;
}
export interface AlbumIsRule extends AlbumRule {
    comparator: RuleComparator.Is;
}
export function isAlbumIsRule(rule: PlaylistRule): rule is AlbumIsRule {
    return isAlbumRule(rule) && rule.comparator === RuleComparator.Is;
}
export interface AlbumContainsRule extends AlbumRule {
    comparator: RuleComparator.Contains;
    value: string;
}
export function isAlbumContainsRule(rule: PlaylistRule): rule is AlbumContainsRule {
    return isAlbumRule(rule) && rule.comparator === RuleComparator.Contains;
}

export interface TrackRule extends PlaylistRule {
    param: RuleParam.Track;
    value: string|SearchItem;
}
export function isTrackRule(rule: PlaylistRule): rule is TrackRule {
    return rule.param === RuleParam.Track;
}
export interface TrackIsRule extends TrackRule {
    comparator: RuleComparator.Is;
}
export function isTrackIsRule(rule: PlaylistRule): rule is TrackIsRule {
    return isTrackRule(rule) && rule.comparator === RuleComparator.Is;
}
export interface TrackContainsRule extends TrackRule {
    comparator: RuleComparator.Contains;
    value: string;
}
export function isTrackContainsRule(rule: PlaylistRule): rule is TrackContainsRule {
    return isTrackRule(rule) && rule.comparator === RuleComparator.Contains;
}

export interface GenreRule extends PlaylistRule {
    param: RuleParam.Genre;
    value: string;
}
export function isGenreRule(rule: PlaylistRule): rule is GenreRule {
    return rule.param === RuleParam.Genre;
}

export interface YearRule extends PlaylistRule {
    param: RuleParam.Year;
    value: string|BetweenValue;
}
export function isYearRule(rule: PlaylistRule): rule is YearRule {
    return rule.param === RuleParam.Year;
}
export interface YearIsRule extends YearRule {
    comparator: RuleComparator.Is;
    value: string;
}
export function isYearIsRule(rule: PlaylistRule): rule is YearIsRule {
    return isYearRule(rule) && rule.comparator === RuleComparator.Is;
}
export interface YearBetweenRule extends YearRule {
    comparator: RuleComparator.Between;
    value: BetweenValue;
}
export function isYearBetweenRule(rule: PlaylistRule): rule is YearBetweenRule {
    return isYearRule(rule) && rule.comparator === RuleComparator.Between;
}

export interface PlaylistTypeRule extends PlaylistRule {
    param: RuleParam.Playlist;
    value: SearchItem;
}
export function isPlaylistTypeRule(rule: PlaylistRule): rule is PlaylistTypeRule {
    return rule.param === RuleParam.Playlist;
}

export interface TempoRule extends PlaylistRule {
    param: RuleParam.Tempo;
    value: BetweenValue;
}
export function isTempoRule(rule: PlaylistRule): rule is TempoRule {
    return rule.param === RuleParam.Tempo;
}

export interface EnergyRule extends PlaylistRule {
    param: RuleParam.Energy;
    value: BetweenValue;
}
export function isEnergyRule(rule: PlaylistRule): rule is EnergyRule {
    return rule.param === RuleParam.Energy;
}

export interface InstrumentalRule extends PlaylistRule {
    param: RuleParam.Instrumental;
    value: boolean;
}
export function isInstrumentalRule(rule: PlaylistRule): rule is InstrumentalRule {
    return rule.param === RuleParam.Instrumental;
}
