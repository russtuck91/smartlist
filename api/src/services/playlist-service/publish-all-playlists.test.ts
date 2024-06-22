import moment from 'moment';

import { playlistFactory } from '../../core/test-data';

import playlistRepo from '../../repositories/playlist-repository';

import preValidatePublishPlaylist from './pre-validate-publish-playlist';
import publishAllPlaylists from './publish-all-playlists';


jest.mock('../spotify-service/spotify-service');
jest.mock('../user-service');
jest.mock('./pre-validate-publish-playlist');

const mockedFind = jest.mocked(playlistRepo.find);
const mockedPreValidatePublishPlaylist = jest.mocked(preValidatePublishPlaylist);


describe('publishAllPlaylists', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        delete process.env.PLAYLIST_PUBLISH_LIMIT;
    });

    it('should sort playlists by priority', async () => {
        // Arrange
        const playlist1 = playlistFactory.build({
            lastPublished: moment().subtract(3, 'day').toDate(),
            deleted: false,
        });
        const playlist2 = playlistFactory.build({
            lastPublished: moment().subtract(1, 'day').toDate(),
            deleted: false,
        });
        const playlist3 = playlistFactory.build({
            lastPublished: moment().subtract(2, 'day').toDate(),
            deleted: true,
        });
        const playlist4 = playlistFactory.build({
            lastPublished: moment().subtract(4, 'day').toDate(),
            deleted: true,
        });
        mockedFind.mockResolvedValue([
            playlist2,
            playlist4,
            playlist1,
            playlist3,
        ]);

        // Act
        await publishAllPlaylists();

        // Assert
        expect(mockedPreValidatePublishPlaylist.mock.calls).toMatchObject([
            [playlist1, expect.any(String)],
            [playlist2, expect.any(String)],
            [playlist3, expect.any(String)],
            [playlist4, expect.any(String)],
        ]);
    });

    it('should limit playlists to publish by env var', async () => {
        // Arrange
        const playlists = playlistFactory.buildList(10);
        mockedFind.mockResolvedValue(playlists);
        const expectedCalls = 1;
        process.env.PLAYLIST_PUBLISH_LIMIT = String(expectedCalls);

        // Act
        await publishAllPlaylists();

        // Assert
        expect(mockedPreValidatePublishPlaylist).toHaveBeenCalledTimes(expectedCalls);
    });
});
