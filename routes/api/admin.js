var express     = require('express');
var router      = express.Router();
var appRoot     = require('app-root-path');
var fs          = require('fs');
var dbMusic     = require('../../db/music');
var dbArtist    = require('../../db/artist');

module.exports = function (db) {
    router.post('/insert_music', function(req, res, next) {
        dbMusic.insertMusic(db, req.body, function(result) {
            res.writeHead(200);
            res.end(JSON.stringify(result));
        }, function(result) {
            res.writeHead(200);
            res.end(JSON.stringify(result));
        });
    });

    router.post('/insert_artist', function(req, res, next) {
        dbArtist.insertArtist(db, req.body, function(result) {
            res.writeHead(200);
            res.end(JSON.stringify(result));
        }, function(result) {
            res.writeHead(200);
            res.end(JSON.stringify(result));
        });
    });

    router.post('/insert_lyrics', function(req, res, next) {
        var lyricsFile = fs.createWriteStream(appRoot + '/files/lyrics/' + req.body.name + '.txt', {flags : 'w'});
        lyricsFile.write(req.body.contents);
        lyricsFile.end();

        res.end(JSON.stringify({
            code    : '0000',
            message : 'Success',
            result  : {}
        }));
    });

    router.post('/get_music', function(req, res, next) {
        dbMusic.getMusic(db, req.body, function(result) {
            res.writeHead(200);
            res.end(JSON.stringify(result));
        }, function(result) {
            res.writeHead(200);
            res.end(JSON.stringify(result));
        });
    });

    router.post('/get_artist', function(req, res, next) {
        dbMusic.getArtist(db, req.body, function(result) {
            res.writeHead(200);
            res.end(JSON.stringify(result));
        }, function(result) {
            res.writeHead(200);
            res.end(JSON.stringify(result));
        });
    });

    router.post('/change_music_id', function(req, res, next) {
        fs.rename(appRoot + '/files/lyrics/' + req.body.oldVideoId + '.txt', appRoot + '/files/lyrics/' + req.body.newVideoId + '.txt', function (err) {
            if (err) throw err;

            dbMusic.changeMusicId(db, req.body, function(result) {
                res.writeHead(200);
                res.end(JSON.stringify(result));
            }, function(result) {
                res.writeHead(200);
                res.end(JSON.stringify(result));
            });
        });
    });

    return router;
};
