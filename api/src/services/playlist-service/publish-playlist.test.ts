import { playlistFactory } from '../../core/test-data';

import spotifyService from '../spotify-service/spotify-service';

import publishPlaylist from './publish-playlist';


jest.mock('../spotify-service/spotify-service');
jest.mock('../cache/spotify/spotify-cache-service');
jest.mock('../user-service');
jest.mock('./populate-list', () => () => []);

const mockedCreateNewPlaylist = jest.mocked(spotifyService.createNewPlaylist);


describe('publishPlaylist', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        mockedCreateNewPlaylist.mockResolvedValue({id: ''} as any);
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
    });

    it('should update existing playlist if created & not deleted', async () => {
        // Arrange
        const playlist = playlistFactory.build();

        // Act
        await publishPlaylist(playlist);

        // Assert
        expect(spotifyService.removeTracksFromPlaylist).toHaveBeenCalled();
    });
});
