import { playlistFactory, trackFactory } from '../../core/test-data';

import spotifyService from '../spotify-service/spotify-service';

import populateList from './populate-list';
import publishPlaylist from './publish-playlist';


jest.mock('../spotify-service/spotify-service');
jest.mock('../cache/db-cache-service');
jest.mock('../cache/spotify/spotify-cache-service');
jest.mock('../user-service');
jest.mock('./populate-list', () => jest.fn(() => []));

const mockedCreateNewPlaylist = jest.mocked(spotifyService.createNewPlaylist);
const mockedGetTracksForPlaylist = jest.mocked(spotifyService.getTracksForPlaylist);
const mockedPopulateList = jest.mocked(populateList);


describe('publishPlaylist', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        mockedCreateNewPlaylist.mockResolvedValue({id: ''} as any);
        mockedGetTracksForPlaylist.mockResolvedValue([]);
    });

    it('should not publish if generated track list is same as existing track list', async () => {
        // Arrange
        const playlist = playlistFactory.build();

        // Act
        await publishPlaylist(playlist);

        // Assert
        expect(spotifyService.addTracksToPlaylist).not.toHaveBeenCalled();
    });

    it('should create new playlist if none ever created before', async () => {
        // Arrange
        const playlist = playlistFactory.build({
            spotifyPlaylistId: undefined,
        });

        // Act
        await publishPlaylist(playlist);

        // Assert
        expect(spotifyService.createNewPlaylist).toHaveBeenCalled();
        expect(spotifyService.addTracksToPlaylist).toHaveBeenCalled();
    });

    it('should update existing playlist if created & not deleted', async () => {
        // Arrange
        const playlist = playlistFactory.build();
        mockedPopulateList.mockResolvedValue(trackFactory.buildList(2));

        // Act
        await publishPlaylist(playlist);

        // Assert
        expect(spotifyService.removeTracksFromPlaylist).toHaveBeenCalled();
        expect(spotifyService.addTracksToPlaylist).toHaveBeenCalled();
    });
});
