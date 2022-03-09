import { albumContainsRuleFactory, trackFactory } from '../../core/test-data';

import filterListOfSongs from './filter-list-of-songs';


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
    });
});

