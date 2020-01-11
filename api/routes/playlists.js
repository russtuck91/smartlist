var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');
var db = mongojs('mongodb://localhost:27017/smartify', ['playlists']);

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
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
