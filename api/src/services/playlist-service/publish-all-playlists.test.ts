import moment from 'moment';
import * as workerpool from 'workerpool';

import { playlistFactory } from '../../core/test-data';

import playlistRepo from '../../repositories/playlist-repository';

import publishAllPlaylists from './publish-all-playlists';


const mockedFind = jest.mocked(playlistRepo.find);
const execMock = ((workerpool as any).execMock as jest.Mock);

jest.setTimeout(10_000);


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
        expect(execMock.mock.calls).toMatchObject([
            ['publishPlaylistProcess', [playlist1]],
            ['publishPlaylistProcess', [playlist2]],
            ['publishPlaylistProcess', [playlist3]],
            ['publishPlaylistProcess', [playlist4]],
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
        expect(execMock).toHaveBeenCalledTimes(expectedCalls);
    });
});
