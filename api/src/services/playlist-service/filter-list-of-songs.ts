import { PlaylistRule, RuleComparator, RuleParam } from '../../../../shared';

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
            const shouldPass = track.artists.some((artist) => {
                // Is logic:
                if (thisFilter.comparator === RuleComparator.Is && typeof thisFilter.value === 'object') {
                    return artist.id === thisFilter.value.id;
                }
                // Contains logic:
                if (thisFilter.comparator === RuleComparator.Contains && typeof thisFilter.value === 'string') {
                    return artist.name.toLowerCase().indexOf(thisFilter.value.toLowerCase()) > -1;
                }
                logger.warn('Did not find matching filter logic for stored filter value');
                logger.debug(thisFilter);
            });
            if (shouldPass === false) { return false; }
        }

        if (filtersByParam[RuleParam.Album]) {
            const thisFilter = filtersByParam[RuleParam.Album];
            let shouldPass;
            if (thisFilter.comparator === RuleComparator.Is && typeof thisFilter.value === 'object') {
                shouldPass = track.album.id === thisFilter.value.id;
            }
            if (thisFilter.comparator === RuleComparator.Contains && typeof thisFilter.value === 'string') {
                shouldPass = track.album.name.toLowerCase().indexOf(thisFilter.value.toLowerCase()) > -1;
            }
            if (shouldPass === false) { return false; }
        }

        if (filtersByParam[RuleParam.Track]) {
            const thisFilter = filtersByParam[RuleParam.Track];
            let shouldPass;
            if (thisFilter.comparator === RuleComparator.Is && typeof thisFilter.value === 'object') {
                shouldPass = track.id === thisFilter.value.id;
            }
            if (thisFilter.comparator === RuleComparator.Contains && typeof thisFilter.value === 'string') {
                shouldPass = track.name.toLowerCase().indexOf(thisFilter.value.toLowerCase()) > -1;
            }
            if (shouldPass === false) { return false; }
        }

        if (filtersByParam[RuleParam.Genre]) {
            const fullAlbum = albumMap[track.album.id];
            const fullArtists = track.artists.map((artist) => artistMap[artist.id]);

            let allGenres: string[] = [];
            if (fullAlbum) {
                allGenres = allGenres.concat(fullAlbum.genres);
            }
            fullArtists.map((artist) => {
                allGenres = allGenres.concat(artist.genres);
            });
            // logger.debug('all genres ::', allGenres);

            const thisFilter = filtersByParam[RuleParam.Genre];
            const shouldPass = allGenres.some((genre) => {
                if (thisFilter.comparator === RuleComparator.Is && typeof thisFilter.value === 'string') {
                    return genre.toLowerCase() === thisFilter.value.toLowerCase();
                }
                if (thisFilter.comparator === RuleComparator.Contains && typeof thisFilter.value === 'string') {
                    return genre.toLowerCase().indexOf(thisFilter.value.toLowerCase()) > -1;
                }
                logger.warn('Did not find matching filter logic for stored filter value');
                logger.debug(thisFilter);
            });
            if (shouldPass === false) { return false; }
        }

        // TODO
        if (filtersByParam[RuleParam.Year]) {

        }

        return true;
    });

    return filteredList;
}

export default filterListOfSongs;
