
var Spotify = require('spotify-web-api-node');

var CLIENT_ID = process.env.client_id;
var CLIENT_SECRET = process.env.client_secret;
var REDIRECT_URI = process.env.redirect_uri || 'http://localhost:5000/login/callback';

// configure spotify
var spotifyApi = new Spotify({
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    redirectUri: REDIRECT_URI
});

module.exports = spotifyApi;
