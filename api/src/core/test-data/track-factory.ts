import { faker } from '@faker-js/faker';
import * as Factory from 'factory.ts';
import { random } from 'lodash';

import { Track } from '../../../../shared';

import randomStringFactory from './random-string-factory';


export const trackFactory = Factory.Sync.makeFactory<Track>({
    id: Factory.each(() => randomStringFactory(22)),
    name: Factory.each(() => `Test track name ${faker.word.adjective()} ${faker.word.noun()}`),
    uri: `spotify:track:${randomStringFactory(22)}`,

    albumId: randomStringFactory(22),
    albumName: Factory.each(() => `Test album name ${faker.word.adjective()} ${faker.word.noun()}`),
    albumReleaseDate: '',

    artistIds: [ randomStringFactory(22) ],
    artistNames: Factory.each(() => [ `Test artist name ${faker.word.adjective()} ${faker.word.noun()}` ]),

    disc_number: Factory.each(() => random(1, 2)),
    duration_ms: 1000,
    popularity: 1,
    track_number: Factory.each(() => random(1, 20)),
});
