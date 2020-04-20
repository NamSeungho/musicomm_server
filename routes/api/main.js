var express     = require('express');
var router      = express.Router();
var dbMusic = require('../../db/music');
var dbAccount   = require('../../db/account');

module.exports = function (db) {
    router.post('/get_info', function(req, res) {
        const result = {
            code    : '0000',
            message : 'Success',
        };
        if (req.session && req.session.user !== null && req.session.user !== undefined) {
            result.result = {
                nickname: req.session.nickname,
                email: req.session.email,
                user: req.session.user
            };
        }

        res.writeHead(200);
        res.end(JSON.stringify(result));
    });

    router.post('/login', function(req, res) {
        dbAccount.findAccount(db, req.body, function(result) {
            req.session.nickname  = result.result.nickname;
            req.session.email     = result.result.email;
            req.session.user      = result.result._id;

            dbAccount.insertAccess(db, result.result);

            res.writeHead(200);
            res.end(JSON.stringify(result));
        }, function(result) {
            res.writeHead(200);
            res.end(JSON.stringify(result));
        });
    });

    router.post('/signup', function(req, res) {
        dbAccount.insertAccount(db, req.body, function(result) {
            res.writeHead(200);
            res.end(JSON.stringify(result));
        }, function(result) {
            res.writeHead(200);
            res.end(JSON.stringify(result));
        });
    });

    router.post('/logout', function(req, res) {
        if( req.session ) {
            req.session.destroy();
        }

        res.writeHead(200);
        res.end(JSON.stringify({
            code    : '0000',
            message : 'Success',
            result  : {}
        }));
    });

    return router;
};