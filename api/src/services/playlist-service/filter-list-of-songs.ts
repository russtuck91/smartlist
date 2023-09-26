import { keyBy } from 'lodash';
import moment from 'moment';

import {
    AlbumRule, ArtistRule, EnergyRule, GenreRule,
    InstrumentalRule,
    isAlbumContainsRule, isAlbumIsRule, isAlbumRule,
    isArtistContainsRule, isArtistIsRule, isArtistRule,
    isEnergyRule,
    isGenreRule,
    isInstrumentalRule,
    isSearchItem,
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

    if (rules.find((rule) => isTempoRule(rule) || isEnergyRule(rule) || isInstrumentalRule(rule))) {
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

    if (isEnergyRule(thisFilter)) {
        const thisAudioFeatures = audioFeaturesMap[track.id];
        return filterTrackByEnergy(track, thisFilter, thisAudioFeatures);
    }

    if (isInstrumentalRule(thisFilter)) {
        const thisAudioFeatures = audioFeaturesMap[track.id];
        return filterTrackByInstrumental(track, thisFilter, thisAudioFeatures);
    }
}

function filterTrackByArtist(track: Track, thisFilter: ArtistRule) {
    if (isArtistIsRule(thisFilter)) {
        if (isSearchItem(thisFilter.value)) {
            const thisFilterValue = thisFilter.value;
            return track.artistIds.some((id) => {
                return id === thisFilterValue.id;
            });
        }
        if (typeof thisFilter.value === 'string') {
            const thisFilterValue = thisFilter.value;
            return track.artistNames.some((name) => {
                return name.toLowerCase() === thisFilterValue.toLowerCase();
            });
        }
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
        if (isSearchItem(thisFilter.value)) {
            return track.albumId === thisFilter.value.id;
        }
        if (typeof thisFilter.value === 'string') {
            return track.albumName.toLowerCase() === thisFilter.value.toLowerCase();
        }
    }
    if (isAlbumContainsRule(thisFilter)) {
        return track.albumName.toLowerCase().indexOf(thisFilter.value.toLowerCase()) > -1;
    }
}

function filterTrackByTrack(track: Track, thisFilter: TrackRule) {
    if (isTrackIsRule(thisFilter)) {
        if (isSearchItem(thisFilter.value)) {
            return track.id === thisFilter.value.id;
        }
        if (typeof thisFilter.value === 'string') {
            return track.name.toLowerCase() === thisFilter.value.toLowerCase();
        }
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

function filterTrackByEnergy(track: Track, rule: EnergyRule, audioFeatures: SpotifyApi.AudioFeaturesObject) {
    const { start, end } = rule.value;
    return (!start || audioFeatures.energy > parseFloat(start)) && (!end || audioFeatures.energy < parseFloat(end));
}

function filterTrackByInstrumental(track: Track, rule: InstrumentalRule, audioFeatures: SpotifyApi.AudioFeaturesObject) {
    const threshold = 0.5;
    return rule.value ? audioFeatures.instrumentalness >= threshold : audioFeatures.instrumentalness < threshold;
}

export default filterListOfSongs;
