import { SpotifyApi } from '../../core/spotify/spotify-api';
import { trackFactory } from '../../core/test-data';

import addTracksToPlaylist, { batchSize } from './add-tracks-to-playlist';


describe('addTracksToPlaylist', () => {
    const numTracks = 2000;
    const tracks = trackFactory.buildList(numTracks);
    const uris = tracks.map((t) => t.uri);
    const addTracksToPlaylistSpy = jest.spyOn(SpotifyApi.prototype, 'addTracksToPlaylist');

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should call API in batches', async () => {
        // Act
        await addTracksToPlaylist('', uris, '');

        // Assert
        expect(addTracksToPlaylistSpy).toHaveBeenCalledTimes(numTracks / batchSize);
    });

    it('should send all batches when 1 API call errors out', async () => {
        // Arrange
        addTracksToPlaylistSpy.mockImplementationOnce(() => {
            throw {
                body: {
                    error: {
                        message: 'Invalid base62 id',
                    },
                },
                statusCode: 400,
            };
        });

        // Act
        await addTracksToPlaylist('', uris, '');

        // Assert
        expect(addTracksToPlaylistSpy).toHaveBeenCalledTimes(numTracks / batchSize);
    });
});
