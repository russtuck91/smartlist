import moment from 'moment';

import {
    AlbumRule, ArtistRule, GenreRule,
    isAlbumContainsRule, isAlbumIsRule, isAlbumRule,
    isArtistContainsRule, isArtistIsRule, isArtistRule,
    isGenreRule,
    isTrackContainsRule, isTrackIsRule, isTrackRule,
    isYearBetweenRule, isYearIsRule, isYearRule,
    PlaylistRule, RuleComparator, RuleParam, TrackRule, YearRule,
} from '../../../../shared';

import logger from '../../core/logger/logger';

import { spCache } from '../spotify-service-cache';


async function filterListOfSongs(trackList: SpotifyApi.TrackObjectFull[], rules: PlaylistRule[], accessToken: string|undefined) {
    const filtersByParam: { [s: string]: PlaylistRule } = rules.reduce((obj, item) => {
        obj[item.param] = item;
        return obj;
    }, {});

    let albumMap = {};
    let artistMap = {};
    // Resources only needed if Genre filter is set
    if (filtersByParam[RuleParam.Genre]) {
        const allAlbumIds: string[] = [];
        const allArtistIds: string[] = [];
        trackList.map((track) => {
            allAlbumIds.push(track.album.id);
            track.artists.map((artist) => {
                allArtistIds.push(artist.id);
            });
        });

        albumMap = await spCache.getAlbums(allAlbumIds, accessToken);
        artistMap = await spCache.getArtists(allArtistIds, accessToken);
    }

    const filteredList = trackList.filter((track) => {
        if (filtersByParam[RuleParam.Artist]) {
            const thisFilter = filtersByParam[RuleParam.Artist];
            if (isArtistRule(thisFilter)) {
                const shouldPass = filterTrackByArtist(track, thisFilter);
                if (shouldPass === false) { return false; }
            }
        }

        if (filtersByParam[RuleParam.Album]) {
            const thisFilter = filtersByParam[RuleParam.Album];
            if (isAlbumRule(thisFilter)) {
                const shouldPass = filterTrackByAlbum(track, thisFilter);
                if (shouldPass === false) { return false; }
            }
        }

        if (filtersByParam[RuleParam.Track]) {
            const thisFilter = filtersByParam[RuleParam.Track];
            if (isTrackRule(thisFilter)) {
                const shouldPass = filterTrackByTrack(track, thisFilter);
                if (shouldPass === false) { return false; }
            }
        }

        if (filtersByParam[RuleParam.Genre]) {
            const thisFilter = filtersByParam[RuleParam.Genre];
            if (isGenreRule(thisFilter)) {
                const shouldPass = filterTrackByGenre(track, thisFilter, albumMap, artistMap);
                if (shouldPass === false) { return false; }
            }
        }

        if (filtersByParam[RuleParam.Year]) {
            const thisFilter = filtersByParam[RuleParam.Year];
            if (isYearRule(thisFilter)) {
                const shouldPass = filterTrackByYear(track, thisFilter);
                if (shouldPass === false) { return false; }
            }
        }

        return true;
    });

    return filteredList;
}

function filterTrackByArtist(track: SpotifyApi.TrackObjectFull, thisFilter: ArtistRule) {
    return track.artists.some((artist) => {
        if (isArtistIsRule(thisFilter)) {
            return artist.id === thisFilter.value.id;
        }
        if (isArtistContainsRule(thisFilter)) {
            return artist.name.toLowerCase().indexOf(thisFilter.value.toLowerCase()) > -1;
        }
        logger.warn('Did not find matching filter logic for stored filter value');
        logger.debug(thisFilter);
    });
}

function filterTrackByAlbum(track: SpotifyApi.TrackObjectFull, thisFilter: AlbumRule) {
    if (isAlbumIsRule(thisFilter)) {
        return track.album.id === thisFilter.value.id;
    }
    if (isAlbumContainsRule(thisFilter)) {
        return track.album.name.toLowerCase().indexOf(thisFilter.value.toLowerCase()) > -1;
    }
}

function filterTrackByTrack(track: SpotifyApi.TrackObjectFull, thisFilter: TrackRule) {
    if (isTrackIsRule(thisFilter)) {
        return track.id === thisFilter.value.id;
    }
    if (isTrackContainsRule(thisFilter)) {
        return track.name.toLowerCase().indexOf(thisFilter.value.toLowerCase()) > -1;
    }
}

function filterTrackByGenre(track: SpotifyApi.TrackObjectFull, thisFilter: GenreRule, albumMap: Record<string, SpotifyApi.AlbumObjectFull>, artistMap: Record<string, SpotifyApi.ArtistObjectFull>) {
    const fullAlbum = albumMap[track.album.id];
    const fullArtists = track.artists.map((artist) => artistMap[artist.id]);

    let allGenres: string[] = [];
    if (fullAlbum) {
        allGenres = allGenres.concat(fullAlbum.genres);
    }
    fullArtists.map((artist) => {
        allGenres = allGenres.concat(artist.genres);
    });

    const shouldPass = allGenres.some((genre) => {
        if (thisFilter.comparator === RuleComparator.Is) {
            return genre.toLowerCase() === thisFilter.value.toLowerCase();
        }
        if (thisFilter.comparator === RuleComparator.Contains) {
            return genre.toLowerCase().indexOf(thisFilter.value.toLowerCase()) > -1;
        }
        logger.warn('Did not find matching filter logic for stored filter value');
        logger.debug(thisFilter);
    });
    return shouldPass;
}

function filterTrackByYear(track: SpotifyApi.TrackObjectFull, thisFilter: YearRule) {
    const trackMoment = moment(track.album.release_date);
    if (isYearIsRule(thisFilter)) {
        return trackMoment.format('YYYY') === thisFilter.value;
    }
    if (isYearBetweenRule(thisFilter)) {
        return trackMoment.isSameOrAfter(thisFilter.value.start, 'year') && trackMoment.isSameOrBefore(thisFilter.value.end, 'year');
    }
}

export default filterListOfSongs;
