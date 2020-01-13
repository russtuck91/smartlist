var express = require('express');
var router = express.Router();

var mongojs = require('mongojs');
var db = mongojs('mongodb://localhost:27017/smartify', ['users']);

var spotifyApi = require('../core/spotify/spotify-api');


var STATE_KEY = 'spotify_auth_state';
// your application requests authorization
var scopes = ['user-read-private', 'user-read-email', 'user-library-read'];

/** Generates a random string containing numbers and letters of N characters */
var generateRandomString = N => (Math.random().toString(36)+Array(N).join('0')).slice(2, N+2);

router.get('/', (req, res, next) => {
    const state = generateRandomString(16);
    res.cookie(STATE_KEY, state);
    res.redirect(spotifyApi.createAuthorizeURL(scopes, state));
});

router.get('/callback', (req, res) => {
    const { code, state } = req.query;
    const storedState = req.cookies ? req.cookies[STATE_KEY] : null;
    // first do state validation
    if (state === null || state !== storedState) {
        // TODO: error handling
        res.redirect('/#/error/state mismatch');
    // if the state is valid, get the authorization code and pass it on to the client
    } else {
        res.clearCookie(STATE_KEY);
        // Retrieve an access token and a refresh token
        spotifyApi.authorizationCodeGrant(code).then(async (data) => {
            const { expires_in, access_token, refresh_token } = data.body;
    
            // Set the access token on the API object to use it in later calls
            spotifyApi.setAccessToken(access_token);
            spotifyApi.setRefreshToken(refresh_token);

            const userInfo = await spotifyApi.getMe();
            console.log(userInfo.body);

            const accessTokenPatch = {
                username: userInfo.body.id,
                accessToken: access_token,
                refreshToken: refresh_token
            };

            // Store in DB
            db.users.update(
                { username: accessTokenPatch.username },
                accessTokenPatch,
                {
                  upsert: true
                }
            );
    
            // we can also pass the token to the browser to make requests from there
            res.redirect(`http://localhost:3000/login/callback/${access_token}/${refresh_token}`);
        }).catch(err => {
            console.error(err);
            // TODO: error handling
            res.redirect('/error/invalid token');
        });
    }
});

module.exports = router;
