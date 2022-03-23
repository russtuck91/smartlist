import { keyBy } from 'lodash';
import moment from 'moment';

import {
    AlbumRule, ArtistRule, GenreRule,
    isAlbumContainsRule, isAlbumIsRule, isAlbumRule,
    isArtistContainsRule, isArtistIsRule, isArtistRule,
    isGenreRule,
    isTempoRule,
    isTrackContainsRule, isTrackIsRule, isTrackRule,
    isYearBetweenRule, isYearIsRule, isYearRule,
    PlaylistRule, RuleComparator,
    TempoRule,
    Track,
    TrackRule, YearRule,
} from '../../../../shared';

import logger from '../../core/logger/logger';
import { Album, Artist } from '../../core/shared-models';

import spotifyCacheService from '../cache/spotify/spotify-cache-service';


async function filterListOfSongs(trackList: Track[], rules: PlaylistRule[], accessToken: string|undefined, filterOut: boolean = false) {
    if (rules.length === 0) return trackList;

    let albumMap: Record<string, Album> = {};
    let artistMap: Record<string, Artist> = {};
    let audioFeaturesMap = {};

    // Resources only needed if Genre filter is set
    if (rules.find((rule) => isGenreRule(rule))) {
        const allAlbumIds: string[] = [];
        const allArtistIds: string[] = [];
        trackList.map((track) => {
            allAlbumIds.push(track.albumId);
            track.artistIds.map((aId) => {
                allArtistIds.push(aId);
            });
        });

        const albums = await spotifyCacheService.getAlbums(allAlbumIds, accessToken);
        albumMap = keyBy(albums, 'id');
        const artists = await spotifyCacheService.getArtists(allArtistIds, accessToken);
        artistMap = keyBy(artists, 'id');
    }

    if (rules.find((rule) => isTempoRule(rule))) {
        const allTrackIds: string[] = [];
        trackList.map((track) => {
            allTrackIds.push(track.id);
        });
        const audioFeatures = await spotifyCacheService.getAudioFeatures(allTrackIds, accessToken);
        audioFeaturesMap = keyBy(audioFeatures, 'id');
    }

    const filteredList = trackList.filter((track) => {
        return filterOut ?
            !rules.some((thisFilter) => filterTrack(track, thisFilter, { albumMap, artistMap, audioFeaturesMap })) :
            rules.every((thisFilter) => filterTrack(track, thisFilter, { albumMap, artistMap, audioFeaturesMap }));
    });

    return filteredList;
}

function filterTrack(track: Track, thisFilter: PlaylistRule, { albumMap, artistMap, audioFeaturesMap }) {
    if (isArtistRule(thisFilter)) {
        return !!filterTrackByArtist(track, thisFilter);
    }

    if (isAlbumRule(thisFilter)) {
        return !!filterTrackByAlbum(track, thisFilter);
    }

    if (isTrackRule(thisFilter)) {
        return !!filterTrackByTrack(track, thisFilter);
    }

    if (isGenreRule(thisFilter)) {
        return filterTrackByGenre(track, thisFilter, albumMap, artistMap);
    }

    if (isYearRule(thisFilter)) {
        return !!filterTrackByYear(track, thisFilter);
    }

    if (isTempoRule(thisFilter)) {
        const thisAudioFeatures = audioFeaturesMap[track.id];
        return filterTrackByTempo(track, thisFilter, thisAudioFeatures);
    }
}

function filterTrackByArtist(track: Track, thisFilter: ArtistRule) {
    if (isArtistIsRule(thisFilter)) {
        return track.artistIds.some((id) => {
            return id === thisFilter.value.id;
        });
    }
    if (isArtistContainsRule(thisFilter)) {
        return track.artistNames.some((name) => {
            return name.toLowerCase().indexOf(thisFilter.value.toLowerCase()) > -1;
        });
    }
    logger.warn('Did not find matching filter logic for stored filter value');
    logger.debug(thisFilter);
}

function filterTrackByAlbum(track: Track, thisFilter: AlbumRule) {
    if (isAlbumIsRule(thisFilter)) {
        return track.albumId === thisFilter.value.id;
    }
    if (isAlbumContainsRule(thisFilter)) {
        return track.albumName.toLowerCase().indexOf(thisFilter.value.toLowerCase()) > -1;
    }
}

function filterTrackByTrack(track: Track, thisFilter: TrackRule) {
    if (isTrackIsRule(thisFilter)) {
        return track.id === thisFilter.value.id;
    }
    if (isTrackContainsRule(thisFilter)) {
        return track.name.toLowerCase().indexOf(thisFilter.value.toLowerCase()) > -1;
    }
}

function filterTrackByGenre(track: Track, thisFilter: GenreRule, albumMap: Record<string, Album>, artistMap: Record<string, Artist>) {
    const fullAlbum = albumMap[track.albumId];
    const fullArtists = track.artistIds.map((id) => artistMap[id]);

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

function filterTrackByYear(track: Track, thisFilter: YearRule) {
    const trackMoment = moment(track.albumReleaseDate);
    if (isYearIsRule(thisFilter)) {
        return trackMoment.format('YYYY') === thisFilter.value;
    }
    if (isYearBetweenRule(thisFilter)) {
        return trackMoment.isSameOrAfter(thisFilter.value.start, 'year') && trackMoment.isSameOrBefore(thisFilter.value.end, 'year');
    }
}

function filterTrackByTempo(track: Track, thisFilter: TempoRule, audioFeatures: SpotifyApi.AudioFeaturesObject) {
    const { start, end } = thisFilter.value;
    return (!start || audioFeatures.tempo > parseFloat(start)) && (!end || audioFeatures.tempo < parseFloat(end));
}

export default filterListOfSongs;
