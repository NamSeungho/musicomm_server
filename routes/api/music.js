const express   = require('express');
const fs        = require('fs');
const appRoot   = require('app-root-path');
const router    = express.Router();
const dbMusic   = require('../../db/music');

module.exports = function (db) {
    router.post('/ranked_music', function(req, res) {
        if( req.session && req.session.user !== null && req.session.user !== undefined )
            req.body.user = req.session.user;
        else
            req.body.user = '';

        dbMusic.findRankedMusic(db, req.body, function(result) {
            res.writeHead(200);
            res.end(JSON.stringify(result));
        });
    });

    router.post('/latest_music', function(req, res) {
        if( req.session && req.session.user !== null && req.session.user !== undefined )
            req.body.user = req.session.user;
        else
            req.body.user = '';

        dbMusic.findLatestMusic(db, req.body, function(result) {
            res.writeHead(200);
            res.end(JSON.stringify(result));
        });
    });

    router.post('/detail', function(req, res) {
        if( req.session && req.session.user !== null && req.session.user !== undefined )
            req.body.user = req.session.user;
        else
            req.body.user = "";

        dbMusic.findMusicDetail(db, req.body, function(result) {
            fs.readFile(appRoot + '/files/lyrics/' + req.body.no + '.txt', 'utf8', function(err, data) {
                if (err) {
                    result.result.lyrics = '';
                } else {
                    result.result.lyrics = data;
                }

                res.writeHead(200);
                res.end(JSON.stringify(result));
            });
        }, function(result) {
            res.writeHead(200);
            res.end(JSON.stringify(result));
        });
    });

    router.post('/theme', function(req, res) {
        dbMusic.findRadioMusicByYear(db, null, function(result) {
            dbMusic.findRadioMusicByArtistType(db, null, function(result2){
                result.result = {
                    musicListByYear: result.result,
                    musicListByArtistType : result2.result
                };

                res.writeHead(200);
                res.end(JSON.stringify(result));
            });
        }, function(result) {
            res.writeHead(200);
            res.end(JSON.stringify(result));
        });
    });

    router.post('/favorite', function(req, res, next) {
        if(req.body.type === 1) {
            dbMusic.addFavoriteMusic(db, req.body, function(result) {
                res.writeHead(200);
                res.end(JSON.stringify(result));
            }, function(result) {
                res.writeHead(200);
                res.end(JSON.stringify(result));
            });
        } else if(req.body.type === 2) {
            dbMusic.removeFavoriteMusic(db, req.body, function(result) {
                res.writeHead(200);
                res.end(JSON.stringify(result));
            }, function(result) {
                res.writeHead(200);
                res.end(JSON.stringify(result));
            });
        } else {
            res.writeHead(200);
            res.end(JSON.stringify({
                code    : "C001",
                message : "비정상적인 접근입니다"
            }));
        }
    });

    router.post('/play', function(req, res) {
        if( req.session && req.session.user !== null && req.session.user !== undefined )
            req.body.user = req.session.user;
        else
            req.body.user = "";

        dbMusic.insertMusicPlay(db, req.body, function(result) {
            res.writeHead(200);
            res.end(JSON.stringify(result));
        }, function(result) {
            res.writeHead(200);
            res.end(JSON.stringify(result));
        });
    });

    return router;
};