import addTracksToPlaylist from './add-tracks-to-playlist';
import createNewPlaylist from './create-new-playlist';
import getAlbums from './get-albums';
import getArtists from './get-artists';
import getFullMySavedTracks from './get-full-my-saved-tracks';
import getFullSearchResults from './get-full-search-results';
import getMe from './get-me';
import getTracksForAlbums from './get-tracks-for-albums';
import getTracksForArtists from './get-tracks-for-artists';
import getTracksForPlaylist from './get-tracks-for-playlist';
import removeTracksFromPlaylist from './remove-tracks-from-playlist';
import searchForItem from './search-for-item';
import unfollowPlaylist from './unfollow-playlist';
import updatePlaylistDetails from './update-playlist-details';
import userHasPlaylist from './user-has-playlist';

class SpotifyService {
    getMe = getMe;
    getFullMySavedTracks = getFullMySavedTracks;
    getFullSearchResults = getFullSearchResults;
    searchForItem = searchForItem;

    userHasPlaylist = userHasPlaylist;
    createNewPlaylist = createNewPlaylist;
    removeTracksFromPlaylist = removeTracksFromPlaylist;
    addTracksToPlaylist = addTracksToPlaylist;
    updatePlaylistDetails = updatePlaylistDetails;
    unfollowPlaylist = unfollowPlaylist;

    getAlbums = getAlbums;
    getArtists = getArtists;
    getTracksForAlbums = getTracksForAlbums;
    getTracksForArtists = getTracksForArtists;
    getTracksForPlaylist = getTracksForPlaylist;
}

const spotifyService = new SpotifyService;

export default spotifyService;
