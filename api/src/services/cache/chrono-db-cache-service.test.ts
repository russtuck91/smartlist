import { savedTrackObjectFactory, trackFactory } from '../../core/test-data';

import { mapToTrack, mapToUserSavedTrackReference } from '../../mappers/spotify/saved-track-object-mapper';
import userSavedTracksRepo from '../../repositories/cache/spotify/user-saved-tracks-repository';

import ChronoDbCacheService from './chrono-db-cache-service';
import spotifyCacheService from './spotify/spotify-cache-service';


jest.mock('./spotify/spotify-cache-service');

describe('ChronoDbCacheService', () => {
    const mockSourceMethod = jest.fn<Promise<SpotifyApi.SavedTrackObject[]>, any>(async () => await []);
    const service = new ChronoDbCacheService(userSavedTracksRepo, mockSourceMethod);

    jest.spyOn(spotifyCacheService, 'getTracks').mockImplementation(async (cachedListIds) => {
        return await cachedListIds.map((id) => trackFactory.build({ id }));
    });
    const setTracksSpy = jest.spyOn(spotifyCacheService, 'setTracks');
    const findTracksRepoSpy = jest.spyOn(userSavedTracksRepo, 'findOne');
    const updateTracksRepoSpy = jest.spyOn(userSavedTracksRepo, 'updateTracksForUserId');

    it('should return cachedList when fresh first page shows valid cache', async () => {
        // Arrange
        const fullTrackList = savedTrackObjectFactory.buildList(200);
        const truncatedFirstPage = fullTrackList.slice(0, 50);
        mockSourceMethod.mockResolvedValueOnce(truncatedFirstPage);
        // Mock repo.find method to return same ids as source method
        findTracksRepoSpy.mockResolvedValueOnce({
            userId: '',
            tracks: fullTrackList.map(mapToUserSavedTrackReference),
        });

        // Act
        const result = await service.getFullTrackList('');

        // Assert
        const resultIds = result.map((t) => t.id);
        const expectedIds = fullTrackList.map((t) => t.track.id);
        expect(resultIds).toEqual(expectedIds);
    });

    describe('fresh results path', () => {
        const freshFirstPage = savedTrackObjectFactory.buildList(50);
        const freshFullResults = [ ...freshFirstPage, ...savedTrackObjectFactory.buildList(200) ];

        afterEach(async () => {
            // Arrange
            mockSourceMethod.mockResolvedValueOnce(freshFirstPage);
            mockSourceMethod.mockResolvedValueOnce(freshFullResults);

            // Act
            const result = await service.getFullTrackList('');

            // Assert
            expect(result).toEqual(freshFullResults.map(mapToTrack));
            expect(updateTracksRepoSpy).toHaveBeenCalled();
            expect(setTracksSpy).toHaveBeenCalled();
        });

        it('should get fresh results and store them when no cache found', () => {
            // Arrange
            findTracksRepoSpy.mockResolvedValueOnce(null);
        });

        it('should get fresh results and store them when cache is different than fresh first page', () => {
            // Arrange
            // Mock repo.find method to return different ids as source method
            const cachedList = [ ...freshFirstPage.slice(30, 40), ...savedTrackObjectFactory.buildList(240) ];
            findTracksRepoSpy.mockResolvedValueOnce({
                userId: '',
                tracks: cachedList.map(mapToUserSavedTrackReference),
            });
        });
    });
});
