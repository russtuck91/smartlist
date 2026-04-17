import moment from 'moment';

import { PlaylistTrackSortOption, Track, TrackList } from '../../../../shared';

import logger from '../../core/logger/logger';

import spotifyCacheService from '../cache/spotify/spotify-cache-service';


function sortReleaseDate(a: Track, b: Track): number|undefined {
    const releaseDateCompare = moment(b.albumReleaseDate).diff(moment(a.albumReleaseDate));
    if (releaseDateCompare) return releaseDateCompare;
}

function sortAlbumBase(a: Track, b: Track): number|undefined {
    const albumNameCompare = a.albumName.localeCompare(b.albumName);
    if (albumNameCompare) return albumNameCompare;
    const discNumberCompare = a.disc_number - b.disc_number;
    if (discNumberCompare) return discNumberCompare;
    const trackNumberCompare = a.track_number - b.track_number;
    if (trackNumberCompare) return trackNumberCompare;
}

async function sortTrackList(trackList: TrackList, sorting: PlaylistTrackSortOption|null|undefined, accessToken: string): Promise<TrackList> {
    logger.debug('>>>> Entering sortTrackList()');
    if (!sorting || sorting === PlaylistTrackSortOption.None) {
        return trackList;
    }

    const sortFunctions: Record<Exclude<PlaylistTrackSortOption, PlaylistTrackSortOption.None>, () => Promise<TrackList>> = {
        [PlaylistTrackSortOption.Artist]: async () => {
            return trackList.sort((a, b) => {
                const artistNameCompare = a.artistNames[0]!.localeCompare(b.artistNames[0]!);
                if (artistNameCompare) return artistNameCompare;
                const releaseDateCompare = sortReleaseDate(a, b);
                if (releaseDateCompare) return releaseDateCompare;
                const albumCompare = sortAlbumBase(a, b);
                if (albumCompare) return albumCompare;
                return 0;
            });
        },
        [PlaylistTrackSortOption.Album]: async () => {
            return trackList.sort((a, b) => {
                const albumCompare = sortAlbumBase(a, b);
                if (albumCompare) return albumCompare;
                return 0;
            });
        },
        [PlaylistTrackSortOption.Track]: async () => {
            return trackList.sort((a, b) => {
                const trackNameCompare = a.name.toLowerCase().localeCompare(b.name.toLowerCase());
                if (trackNameCompare) return trackNameCompare;
                const releaseDateCompare = sortReleaseDate(a, b);
                if (releaseDateCompare) return releaseDateCompare;
                return 0;
            });
        },
        [PlaylistTrackSortOption.SavedDate]: async () => {
            const savedTracks = await spotifyCacheService.getFullSavedTrackReference(accessToken);
            return trackList.sort((a, b) => {
                const savedDateCompare = savedTracks.findIndex((t) => t.trackId === a.id) - savedTracks.findIndex((t) => t.trackId === b.id);
                if (savedDateCompare) return savedDateCompare;
                return 0;
            });
        },
    };

    const chosenSortFunction = sortFunctions[sorting];
    if (!chosenSortFunction) {
        logger.warn(`Sorting function not implemented for chosen sorting option: ${sorting}`);
        return trackList;
    }
    return await chosenSortFunction();
}

export default sortTrackList;
