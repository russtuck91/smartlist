import { playlistFactory, trackFactory } from '../../core/test-data';

import * as getListForRuleGroup from './get-list-for-rule-group';
import * as getListForRules from './get-list-for-rules';
import populateList from './populate-list';


jest.mock('../spotify-service/spotify-service');

describe('populateList', () => {
    const getListForRuleGroupSpy = jest.spyOn(getListForRuleGroup, 'default');
    const getListForRulesSpy = jest.spyOn(getListForRules, 'default');

    it('should exclude songs from list', async () => {
        // Arrange
        const trackList = trackFactory.buildList(10);
        const chosenExclusions = [trackList[1], trackList[2]];
        getListForRuleGroupSpy.mockResolvedValueOnce(trackList);
        getListForRulesSpy.mockResolvedValueOnce(chosenExclusions);
        const playlist = playlistFactory.build();

        // Act
        const result = await populateList(playlist, '');

        // Assert
        expect(result).toHaveLength(trackList.length - chosenExclusions.length);
        chosenExclusions.map((e) => expect(result).not.toContain(e));
    });
});
