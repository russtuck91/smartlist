import { PlaylistTrackSortOption } from '../../../../shared';

import { savedTrackObjectFactory, trackFactory } from '../../core/test-data';

import { mapToTrack, mapToUserSavedTrackReference } from '../../mappers/spotify/saved-track-object-mapper';

import spotifyCacheService from '../cache/spotify/spotify-cache-service';

import sortTrackList from './sort-track-list';


describe('sortTrackList', () => {
    it('should sort list of tracks by artist name', async () => {
        // Arrange
        const trackList = trackFactory.buildList(10);

        // Act
        const result = await sortTrackList(trackList, PlaylistTrackSortOption.Artist, '');

        // Assert
        expect(result[0].artistNames[0].localeCompare(result[result.length - 1].artistNames[0])).toBe(-1);
    });

    it('should sort list of tracks by artist name, secondarily by release date', async () => {
        // Arrange
        const sameArtist = 'Ingrid Michaelson';
        const beOk = trackFactory.build({ artistNames: [sameArtist], albumName: 'Be OK', albumReleaseDate: '2008-10-14', name: 'Be OK' });
        const everybody = trackFactory.build({ artistNames: [sameArtist], albumName: 'Everybody', albumReleaseDate: '2009-08-25', name: 'Everybody' });
        const theWayIAm = trackFactory.build({ artistNames: [sameArtist], albumName: 'Girls and Boys', albumReleaseDate: '2007-01-01', name: 'The Way I Am' });
        const lightMeUp = trackFactory.build({ artistNames: [sameArtist], albumName: 'It doesn\'t have to make sense', albumReleaseDate: '2016-08-26', name: 'Light Me Up' });
        const girlsChaseBoys = trackFactory.build({ artistNames: [sameArtist], albumName: 'Lights Out', albumReleaseDate: '2014-04-15', name: 'Girls Chase Boys' });
        const trackList = [
            beOk,
            everybody,
            theWayIAm,
            lightMeUp,
            girlsChaseBoys,
        ];

        // Act
        const result = await sortTrackList(trackList, PlaylistTrackSortOption.Artist, '');

        // Assert
        const expectedOrder = [
            lightMeUp,
            girlsChaseBoys,
            everybody,
            beOk,
            theWayIAm,
        ];
        expect(result).toEqual(expectedOrder);
    });

    it('should sort list of tracks by album name', async () => {
        // Arrange
        const trackList = trackFactory.buildList(10);

        // Act
        const result = await sortTrackList(trackList, PlaylistTrackSortOption.Album, '');

        // Assert
        expect(result[0].albumName.localeCompare(result[result.length - 1].albumName)).toBe(-1);
    });

    it('should sort list of tracks by album name, secondarily by track number', async () => {
        // Arrange
        const trackList = trackFactory.buildList(10, {
            albumName: 'SameAlbumTrackTest',
        });

        // Act
        const result = await sortTrackList(trackList, PlaylistTrackSortOption.Album, '');

        // Assert
        expect(result[0].track_number).toBeLessThanOrEqual(result[result.length - 1].track_number);
    });

    it('should sort list of tracks by track name', async () => {
        // Arrange
        const trackList = trackFactory.buildList(10);

        // Act
        const result = await sortTrackList(trackList, PlaylistTrackSortOption.Track, '');

        // Assert
        expect(result[0].name.localeCompare(result[result.length - 1].name)).toBe(-1);
    });

    it('should sort list of tracks by track name, secondarily by release date', async () => {
        // Arrange
        const sameTrackName = 'Stand by Me';
        const otisRedding1964 = trackFactory.build({ name: sameTrackName, artistNames: [ 'Otis Redding' ], albumReleaseDate: '1964' });
        const weezer2019 = trackFactory.build({ name: sameTrackName, artistNames: [ 'Weezer' ], albumReleaseDate: '2019-01-24' });
        const benKing1962 = trackFactory.build({ name: sameTrackName, artistNames: [ 'Ben E. King' ], albumReleaseDate: '1962' });
        const florenceAndTheMachine2016 = trackFactory.build({ name: sameTrackName, artistNames: [ 'Florence + The Machine' ], albumReleaseDate: '2016-08-12' });
        const trackList = [
            otisRedding1964,
            weezer2019,
            benKing1962,
            florenceAndTheMachine2016,
        ];

        // Act
        const result = await sortTrackList(trackList, PlaylistTrackSortOption.Track, '');

        // Assert
        const expectedOrder = [
            weezer2019,
            florenceAndTheMachine2016,
            otisRedding1964,
            benKing1962,
        ];
        expect(result).toEqual(expectedOrder);
    });

    it('should sort list of tracks by saved date', async () => {
        // Arrange
        const batch1 = savedTrackObjectFactory.buildList(20);
        const batch2 = savedTrackObjectFactory.buildList(20);
        const savedTracks = [
            ...batch2,
            ...savedTrackObjectFactory.buildList(100),
            ...batch1,
        ];
        jest.spyOn(spotifyCacheService, 'getFullSavedTrackReference').mockResolvedValueOnce(savedTracks.map(mapToUserSavedTrackReference));
        const trackList = [
            ...batch1.map(mapToTrack),
            ...batch2.map(mapToTrack),
        ];

        // Act
        const result = await sortTrackList(trackList, PlaylistTrackSortOption.SavedDate, '');

        // Assert
        const expectedOrder = [
            ...batch2.map(mapToTrack),
            ...batch1.map(mapToTrack),
        ];
        expect(result).toEqual(expectedOrder);
    });
});
