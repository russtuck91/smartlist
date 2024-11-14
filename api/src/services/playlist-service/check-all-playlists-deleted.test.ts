import moment from 'moment';

import { playlistFactory } from '../../core/test-data';

import playlistRepo from '../../repositories/playlist-repository';

import checkAllPlaylistsDeleted from './check-all-playlists-deleted';
import checkPlaylistDeleted from './check-playlist-deleted';


jest.mock('./check-playlist-deleted');

const mockedFind = jest.mocked(playlistRepo.find);
const mockedCheckPlaylistDeleted = jest.mocked(checkPlaylistDeleted);

describe('checkAllPlaylistsDeleted', () => {
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
        await checkAllPlaylistsDeleted();

        // Assert
        expect(mockedCheckPlaylistDeleted.mock.calls).toMatchObject([
            [playlist1],
            [playlist2],
            [playlist3],
            [playlist4],
        ]);
    });
});
