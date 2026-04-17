import { playlistFactory } from '../../core/test-data';

import spotifyService from '../spotify-service/spotify-service';

import checkPlaylistDeleted from './check-playlist-deleted';
import updatePlaylist from './update-playlist';


jest.mock('../spotify-service/spotify-service');
jest.mock('../user-service');
jest.mock('./update-playlist');

const mockedUserHasPlaylist = jest.mocked(spotifyService.userHasPlaylist);

describe('checkPlaylistDeleted', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should not update DB if not deleted currently or previously', async () => {
        // Arrange
        const playlist = playlistFactory.build();
        mockedUserHasPlaylist.mockResolvedValue(true);

        // Act
        await checkPlaylistDeleted(playlist);

        // Assert
        expect(updatePlaylist).not.toHaveBeenCalled();
    });

    it('should not update DB if deleted currently and previously', async () => {
        // Arrange
        const playlist = playlistFactory.build({
            deleted: true,
        });
        mockedUserHasPlaylist.mockResolvedValue(false);

        // Act
        await checkPlaylistDeleted(playlist);

        // Assert
        expect(updatePlaylist).not.toHaveBeenCalled();
    });

    it('should update DB if deleted currently but not deleted previously', async () => {
        // Arrange
        const playlist = playlistFactory.build();
        mockedUserHasPlaylist.mockResolvedValue(false);

        // Act
        await checkPlaylistDeleted(playlist);

        // Assert
        expect(updatePlaylist).toHaveBeenCalledWith(playlist.id, { deleted: true });
    });

    it('should update DB if not deleted currently but was deleted previously', async () => {
        // Arrange
        const playlist = playlistFactory.build({
            deleted: true,
        });
        mockedUserHasPlaylist.mockResolvedValue(true);

        // Act
        await checkPlaylistDeleted(playlist);

        // Assert
        expect(updatePlaylist).toHaveBeenCalledWith(playlist.id, { deleted: false });
    });
});
