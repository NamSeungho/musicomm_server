var express     = require('express');
var router      = express.Router();
var dbMusic     = require('../../db/music');
var dbArtist    = require('../../db/artist');

module.exports = function (db) {
    router.post('/', function(req, res, next) {
        dbArtist.findArtistByKeyDown(db, req.body, function(result) {
            dbMusic.findMusicByKeyDown(db, req.body, function(result2) {
                res.writeHead(200);
                res.end(JSON.stringify({
                    clienttime: req.body.clienttime,
                    artistList: result.result,
                    musicList: result2.result
                }));
            });
        });
    });

    return router;
};