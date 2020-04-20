var express     = require('express');
var router      = express.Router();
var dbArtist    = require('../../db/artist');

module.exports = function (db) {
    router.post('/list', function(req, res) {
        if( req.session && req.session.user !== null && req.session.user !== undefined )
            req.body.user = req.session.user;
        else
            req.body.user = '';

        dbArtist.findArtist(db, req.body, function(result) {
            res.writeHead(200);
            res.end(JSON.stringify(result));
        });
    });

    router.post('/detail', function(req, res) {
        if( req.session && req.session.user !== null && req.session.user !== undefined )
            req.body.user = req.session.user;
        else
            req.body.user = '';

        dbArtist.findArtistDetail(db, req.body, function(result) {
            res.writeHead(200);
            res.end(JSON.stringify(result));
        });
    });

    router.post('/like', function(req, res, next) {
        if(req.body.type === 1) {
            dbArtist.addLikeArtist(db, req.body, function(result) {
                res.writeHead(200);
                res.end(JSON.stringify(result));
            }, function(result) {
                res.writeHead(200);
                res.end(JSON.stringify(result));
            });
        } else if(req.body.type === 2) {
            dbArtist.removeLikeArtist(db, req.body, function(result) {
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

    return router;
};