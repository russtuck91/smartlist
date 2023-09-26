import {
    albumContainsRuleFactory, artistContainsRuleFactory, artistIsRuleFactory,
    trackFactory,
} from '../../core/test-data';

import filterListOfSongs from './filter-list-of-songs';


describe('filter by artist', () => {
    it('should filter list by Artist/Is rule', async () => {
        // Arrange
        const expectedArtistName = 'some artist';
        const tracks = trackFactory.buildList(10);
        tracks[0].artistNames = [expectedArtistName];
        const playlistRule = artistIsRuleFactory.build({
            value: expectedArtistName,
        });

        // Act
        const result = await filterListOfSongs(tracks, [playlistRule], undefined);

        // Assert
        expect(result).toHaveLength(1);
        expect(result.every((t) => t.artistNames.includes(expectedArtistName))).toBeTruthy();
    });

    it('should filter list by Artist/Contains rule', async () => {
        // Arrange
        const ruleValue = 'contains value';
        const expectedArtistName = `some ${ruleValue} here`;
        const tracks = trackFactory.buildList(10);
        tracks[0].artistNames = [expectedArtistName];
        const playlistRule = artistContainsRuleFactory.build({
            value: ruleValue,
        });

        // Act
        const result = await filterListOfSongs(tracks, [playlistRule], undefined);

        // Assert
        expect(result).toHaveLength(1);
        expect(result.every((t) => t.artistNames.includes(expectedArtistName))).toBeTruthy();
    });
});

describe('filter by album', () => {
    it('should filter list by Album/Contains rule', async () => {
        // Arrange
        const expectedAlbumName = 'some album';
        const tracks = trackFactory.buildList(10);
        tracks[0].albumName = expectedAlbumName;
        const playlistRule = albumContainsRuleFactory.build({
            value: expectedAlbumName,
        });

        // Act
        const result = await filterListOfSongs(tracks, [playlistRule], undefined);

        // Assert
        expect(result).toHaveLength(1);
        expect(result.every((t) => t.albumName === expectedAlbumName)).toBeTruthy();
    });

    it('should filter list by multiple Album/Contains rule', async () => {
        // Arrange
        const expectedAlbumOne = 'foo';
        const expectedAlbumTwo = 'bar';
        const tracks = trackFactory.buildList(10);
        tracks.map((track, index) => {
            let name = '';
            if (index % 2 === 0) name += expectedAlbumOne;
            if (index % 3 === 0) name += expectedAlbumTwo;
            if (name) track.albumName = name;
        });
        const rules = [
            albumContainsRuleFactory.build({ value: expectedAlbumOne }),
            albumContainsRuleFactory.build({ value: expectedAlbumTwo }),
        ];

        // Act
        const result = await filterListOfSongs(tracks, rules, undefined);

        // Assert
        expect(result).toHaveLength(2);
        expect(result.every(({ albumName }) => {
            return albumName.indexOf(expectedAlbumOne) > -1 && albumName.indexOf(expectedAlbumTwo) > -1;
        })).toBeTruthy();
    });
});

describe('filterOut mode', () => {
    describe('filter by album', () => {
        it('should filter list by multiple Album/Contains rule', async () => {
            // Arrange
            const expectedAlbumOne = 'foo';
            const expectedAlbumTwo = 'bar';
            const tracks = trackFactory.buildList(10);
            tracks.map((track, index) => {
                let name = '';
                if (index % 2 === 0) name += expectedAlbumOne;
                if (index % 3 === 0) name += expectedAlbumTwo;
                if (name) track.albumName = name;
            });
            const rules = [
                albumContainsRuleFactory.build({ value: expectedAlbumOne }),
                albumContainsRuleFactory.build({ value: expectedAlbumTwo }),
            ];

            // Act
            const result = await filterListOfSongs(tracks, rules, undefined, true);

            // Assert
            expect(result).toHaveLength(3);
            expect(result.every(({ albumName }) => {
                return albumName.indexOf(expectedAlbumOne) === -1 && albumName.indexOf(expectedAlbumTwo) === -1;
            })).toBeTruthy();
        });
    });
});

