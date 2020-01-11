var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');
var db = mongojs('mongodb://localhost:27017/smartify', ['users']);

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.put('/accessToken', function(req, res, next) {
  const accessTokenObj = req.body;
  if (false) {
    // TODO: check for invalid input
  } else {
    db.users.update(
        { username: accessTokenObj.username },
        accessTokenObj,
        {
          upsert: true
        }
    );
    res.sendStatus(200);
  }
});

module.exports = router;
