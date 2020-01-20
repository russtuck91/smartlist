import Spotify from 'spotify-web-api-node';

const CLIENT_ID = process.env.client_id;
const CLIENT_SECRET = process.env.client_secret;
const REDIRECT_URI = process.env.redirect_uri || 'http://localhost:5000/login/callback';

// configure spotify
export const spotifyApi = new Spotify({
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    redirectUri: REDIRECT_URI
});
