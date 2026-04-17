import { SpotifyApi } from '../../core/spotify/spotify-api';

import getTracksForPlaylist from './get-tracks-for-playlist';


describe('getTracksForPlaylist', () => {
    const getPlaylistTracksSpy = jest.spyOn(SpotifyApi.prototype, 'getPlaylistTracks').mockResolvedValue({
        body: {
            href: '',
            items: [
                { track: { id: 'test-id' } } as any,
            ],
            limit: 0,
            next: '',
            offset: 0,
            previous: '',
            total: 1,
        },
        headers: {},
        statusCode: 200,
    });

    it('should return default list', async () => {
        // Act
        const result = await getTracksForPlaylist('', '');

        // Assert
        expect(result.length).toBe(1);
    });

    it('should filter out invalid tracks', async () => {
        // Arrange
        getPlaylistTracksSpy.mockResolvedValue({
            body: {
                href: '',
                items: [
                    { track: null } as any,
                    { track: { id: null } } as any,
                ],
                limit: 0,
                next: '',
                offset: 0,
                previous: '',
                total: 2,
            },
            headers: {},
            statusCode: 200,
        });

        // Act
        const result = await getTracksForPlaylist('', '');

        // Assert
        expect(result.length).toBe(0);
    });
});
