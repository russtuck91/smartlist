import { playlistFactory } from '../../core/test-data';

import preValidatePublishPlaylist from './pre-validate-publish-playlist';
import publishPlaylist from './publish-playlist';


jest.mock('../spotify-service/spotify-service');
jest.mock('../user-service');
jest.mock('./publish-playlist');


describe('preValidatePublishPlaylist', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should publish playlist if not deleted', async () => {
        // Arrange
        const playlist = playlistFactory.build();

        // Act
        await preValidatePublishPlaylist(playlist);

        // Assert
        expect(publishPlaylist).toHaveBeenCalledWith(playlist);
    });

    it('should not publish playlist if deleted', async () => {
        // Arrange
        const playlist = playlistFactory.build({
            deleted: true,
        });

        // Act
        await preValidatePublishPlaylist(playlist);

        // Assert
        expect(publishPlaylist).not.toHaveBeenCalled();
    });
});
