import ReactGA from 'react-ga4';


enum EventCategory {
    User = 'User',
    Playlist = 'Playlist',
}

export function userLoggedInEvent() {
    ReactGA.event({
        category: EventCategory.User,
        action: 'User Logged In',
    });
}

export function playlistCreatedEvent() {
    ReactGA.event({
        category: EventCategory.Playlist,
        action: 'Playlist Created',
    });
}

export function playlistUpdatedEvent() {
    ReactGA.event({
        category: EventCategory.Playlist,
        action: 'Playlist Updated',
    });
}

export function playlistPublishedEvent() {
    ReactGA.event({
        category: EventCategory.Playlist,
        action: 'Playlist Published',
    });
}

