var express = require('express');
var router = express.Router();

var mongojs = require('mongojs');
var db = mongojs('mongodb://localhost:27017/smartify', ['playlists']);

var spotifyApi = require('../core/spotify/spotify-api');

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

router.post('/populateList', async (req, res, next) => {
    try {
        var rules = req.body;

        // get access token from request headers, apply to spotify api
        const accessToken = req.headers.authorization.replace(/^Bearer /, '');
        spotifyApi.setAccessToken(accessToken);

        // const list = [];
        const list = await spotifyApi.getMySavedTracks();
        // const list = await spotifyApi.getMe();
        res.send(list);
    } catch (e) {
        console.error(e);
        next(e);
    }
});

router.post('/', (req, res, next) => {
    var playlist = req.body;
    if (false) {
        // check for invalid input
    } else {
        db.playlists.save(playlist, (err, playlist) => {
            if (err) {
                res.send(err);
            }
            res.json(playlist);
        });
    }
});

module.exports = router;
