import Spotify from 'spotify-web-api-node';

const CLIENT_ID = process.env.client_id;
const CLIENT_SECRET = process.env.client_secret;
const REDIRECT_URI = process.env.redirect_uri || 'http://localhost:5000/login/callback';

export class SpotifyApi extends Spotify {
    constructor() {
        super({
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            redirectUri: REDIRECT_URI
        });
    }
}
