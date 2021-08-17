import analytics from './analytics';


enum EventCategory {
    User = 'User',
    Playlist = 'Playlist',
}

export function userLoggedInEvent() {
    analytics.track('User Logged In', {
        category: EventCategory.User,
    });
}

export function playlistCreatedEvent() {
    analytics.track('Playlist Created', {
        category: EventCategory.Playlist,
    });
}

export function playlistUpdatedEvent() {
    analytics.track('Playlist Updated', {
        category: EventCategory.Playlist,
    });
}

export function playlistPublishedEvent() {
    analytics.track('Playlist Published', {
        category: EventCategory.Playlist,
    });
}

