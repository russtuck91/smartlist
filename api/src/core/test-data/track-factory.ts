import * as Factory from 'factory.ts';

import { Track } from '../../../../shared';

import randomStringFactory from './random-string-factory';


export const trackFactory = Factory.Sync.makeFactory<Track>({
    id: Factory.each(() => randomStringFactory(22)),
    name: 'Test track name',
    uri: `spotify:track:${randomStringFactory(22)}`,

    albumId: randomStringFactory(22),
    albumName: 'Test album name',
    albumReleaseDate: '',

    artistIds: [ randomStringFactory(22) ],
    artistNames: [ 'Test artist name' ],

    disc_number: 1,
    duration_ms: 1000,
    popularity: 1,
    track_number: 1,
});
