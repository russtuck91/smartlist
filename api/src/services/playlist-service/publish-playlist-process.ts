import 'reflect-metadata';

import workerpool from 'workerpool';

import { Playlist } from '../../../../shared';

import setupSentry from '../../core/sentry/setup-sentry';

import preValidatePublishPlaylist from './pre-validate-publish-playlist';


setupSentry();

async function publishPlaylistProcess(playlist: Playlist) {
    await preValidatePublishPlaylist(playlist);
    return `Finished processing playlist ${playlist.id}`;
}

workerpool.worker({ publishPlaylistProcess });
