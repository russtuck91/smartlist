import { playlistFactory } from '../../core/test-data';

import spotifyService from '../spotify-service/spotify-service';

import preValidatePublishPlaylist from './pre-validate-publish-playlist';
import publishPlaylist from './publish-playlist';
import updatePlaylist from './update-playlist';


jest.mock('../spotify-service/spotify-service');
jest.mock('../cache/spotify/spotify-cache-service');
jest.mock('../subscription-service');
jest.mock('../user-service');
jest.mock('./publish-playlist');
jest.mock('./update-playlist');

const mockedUserHasPlaylist = jest.mocked(spotifyService.userHasPlaylist);


describe('preValidatePublishPlaylist', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should publish playlist if not deleted currently or previously', async () => {
        // Arrange
        const playlist = playlistFactory.build();
        mockedUserHasPlaylist.mockResolvedValue(true);

        // Act
        await preValidatePublishPlaylist(playlist, '');

        // Assert
        expect(publishPlaylist).toHaveBeenCalledWith(playlist);
        expect(updatePlaylist).not.toHaveBeenCalled();
    });

    it('should publish playlist and update DB if not deleted currently but was deleted previously', async () => {
        // Arrange
        const playlist = playlistFactory.build({
            deleted: true,
        });
        mockedUserHasPlaylist.mockResolvedValue(true);

        // Act
        await preValidatePublishPlaylist(playlist, '');

        // Assert
        expect(publishPlaylist).toHaveBeenCalledWith(playlist);
        expect(updatePlaylist).toHaveBeenCalledWith(playlist.id, { deleted: false });
    });

    it('should not publish playlist if deleted currently and previously', async () => {
        // Arrange
        const playlist = playlistFactory.build({
            deleted: true,
        });
        mockedUserHasPlaylist.mockResolvedValue(false);

        // Act
        await preValidatePublishPlaylist(playlist, '');

        // Assert
        expect(publishPlaylist).not.toHaveBeenCalled();
        expect(updatePlaylist).not.toHaveBeenCalled();
    });

    it('should not publish playlist and update DB if deleted currently but not deleted previously', async () => {
        // Arrange
        const playlist = playlistFactory.build();
        mockedUserHasPlaylist.mockResolvedValue(false);

        // Act
        await preValidatePublishPlaylist(playlist, '');

        // Assert
        expect(publishPlaylist).not.toHaveBeenCalled();
        expect(updatePlaylist).toHaveBeenCalledWith(playlist.id, { deleted: true });
    });
});
