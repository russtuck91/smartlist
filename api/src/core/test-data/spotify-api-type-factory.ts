import * as Factory from 'factory.ts';
import moment from 'moment';

import randomStringFactory from './random-string-factory';


export const albumObjectSimplifiedFactory = Factory.Sync.makeFactory<SpotifyApi.AlbumObjectSimplified>({
    album_type: '',
    artists: [],
    external_urls: { spotify: '' },
    href: '',
    id: randomStringFactory(22),
    images: [],
    name: 'Test album name',
    release_date: moment().format(),
    release_date_precision: '',
    type: 'album',
    uri: '',
});

export const trackObjectFullFactory = Factory.Sync.makeFactory<SpotifyApi.TrackObjectFull>({
    album: albumObjectSimplifiedFactory.build(),
    external_ids: {},
    popularity: 1,
    artists: [],
    disc_number: 1,
    duration_ms: 1000,
    explicit: false,
    external_urls: { spotify: '' },
    href: '',
    id: Factory.each(() => randomStringFactory(22)),
    name: 'Test track name',
    preview_url: '',
    track_number: 1,
    type: 'track',
    uri: `spotify:track:${randomStringFactory(22)}`,
});

export const savedTrackObjectFactory = Factory.Sync.makeFactory<SpotifyApi.SavedTrackObject>({
    added_at: moment().format(),
    track: Factory.each(() => trackObjectFullFactory.build()),
});
