import { albumContainsRuleFactory, trackFactory } from '../../core/test-data';
import { savedRuleFactory } from '../../core/test-data/playlist-rule-factory';

import getListForRules from './get-list-for-rules';


jest.mock('../cache/spotify/spotify-cache-service');
jest.mock('../spotify-service/spotify-service');

const fetchTracksForRulesSpy = jest.spyOn(jest.requireActual('./fetch-tracks-for-rules'), 'default');
const filterListOfSongsSpy = jest.spyOn(jest.requireActual('./filter-list-of-songs'), 'default');

describe('getListForRules', () => {
    it('given 2 AlbumContains rules and currentBatchOfSongs, should call filterListOfSongs with both', async () => {
        // Arrange
        const expectedAlbumOne = 'foo';
        const expectedAlbumTwo = 'bar';
        const rules = [
            albumContainsRuleFactory.build({ value: expectedAlbumOne }),
            albumContainsRuleFactory.build({ value: expectedAlbumTwo }),
        ];
        const currentBatchOfSongs = trackFactory.buildList(10);

        // Act
        await getListForRules(rules, '', currentBatchOfSongs);

        // Assert
        expect(fetchTracksForRulesSpy).not.toHaveBeenCalled();
        expect(filterListOfSongsSpy).toHaveBeenCalled();
        expect(filterListOfSongsSpy).toHaveBeenCalledWith(currentBatchOfSongs, rules, '');
    });

    it('given 1 Saved rule and 1 AlbumContains rule, should call fetchTracksForRules with Saved rule and filterListOfSongs with other', async () => {
        // Arrange
        const expectedAlbumOne = 'foo';
        const savedRule = savedRuleFactory.build();
        const albumRule = albumContainsRuleFactory.build({ value: expectedAlbumOne });
        const rules = [
            savedRule,
            albumRule,
        ];

        // Act
        await getListForRules(rules, '', undefined);

        // Assert
        expect(fetchTracksForRulesSpy).toHaveBeenCalled();
        expect(fetchTracksForRulesSpy).toHaveBeenCalledWith([savedRule], '');
        expect(filterListOfSongsSpy).toHaveBeenCalled();
        expect(filterListOfSongsSpy).toHaveBeenCalledWith(expect.anything(), [albumRule], '');
    });

    it('given 1 AlbumContains rule, should call fetchTracksForRules with rule', async () => {
        // Arrange
        const expectedAlbumOne = 'foo';
        const rules = [
            albumContainsRuleFactory.build({ value: expectedAlbumOne }),
        ];

        // Act
        await getListForRules(rules, '', undefined);

        // Assert
        expect(fetchTracksForRulesSpy).toHaveBeenCalled();
        expect(fetchTracksForRulesSpy).toHaveBeenCalledWith(rules, '');
        expect(filterListOfSongsSpy).toHaveBeenCalled();
        expect(filterListOfSongsSpy).toHaveBeenCalledWith(expect.anything(), [], '');
    });
});

