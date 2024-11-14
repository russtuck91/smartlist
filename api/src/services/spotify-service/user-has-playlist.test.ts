import { SpotifyApi } from '../../core/spotify/spotify-api';

import userHasPlaylist from './user-has-playlist';


jest.mock('../user-service');

jest.setTimeout(200_000);

describe('userHasPlaylist', () => {
    const areFollowingPlaylistSpy = jest.spyOn(SpotifyApi.prototype, 'areFollowingPlaylist');

    beforeEach(() => {
        jest.clearAllMocks();

        areFollowingPlaylistSpy.mockResolvedValue({
            body: [true],
            headers: {},
            statusCode: 200,
        });
    });

    it('should call API once when confirming existing value', async () => {
        // Arrange
        const existingValue = true;
        const expectedResult = true;

        // Act
        const result = await userHasPlaylist('', '', existingValue);

        // Assert
        expect(result).toBe(expectedResult);
        expect(areFollowingPlaylistSpy).toHaveBeenCalledTimes(1);
    });


    it('should call API twice when given one unexpected result', async () => {
        // Arrange
        const existingValue = true;
        const expectedResult = true;
        areFollowingPlaylistSpy.mockResolvedValueOnce({
            body: [false],
            headers: {},
            statusCode: 200,
        });

        // Act
        const result = await userHasPlaylist('', '', existingValue);

        // Assert
        expect(result).toBe(expectedResult);
        expect(areFollowingPlaylistSpy).toHaveBeenCalledTimes(2);
    });

    it('should return real result when false positives last for 8 seconds', async () => {
        // Arrange
        const existingValue = true;
        const expectedResult = true;
        areFollowingPlaylistSpy.mockResolvedValue({
            body: [false],
            headers: {},
            statusCode: 200,
        });
        setTimeout(() => {
            areFollowingPlaylistSpy.mockResolvedValue({
                body: [expectedResult],
                headers: {},
                statusCode: 200,
            });
        }, 8 * 1000);

        // Act
        const result = await userHasPlaylist('', '', existingValue);

        // Assert
        expect(result).toBe(expectedResult);
        expect(areFollowingPlaylistSpy).toHaveBeenCalledTimes(2);
    });

    it('should return new result when given unexpected result repeatedly', async () => {
        // Arrange
        const existingValue = true;
        const expectedResult = false;
        areFollowingPlaylistSpy.mockResolvedValue({
            body: [expectedResult],
            headers: {},
            statusCode: 200,
        });

        // Act
        const result = await userHasPlaylist('', '', existingValue);

        // Assert
        expect(result).toBe(expectedResult);
    });
});
