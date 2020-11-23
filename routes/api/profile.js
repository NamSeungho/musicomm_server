var express     = require('express');
var router      = express.Router();
var dbAccount   = require('../../db/account');

module.exports = function (db) {
    router.post('/detail', function(req, res) {
        if (req.session && req.session.user !== null && req.session.user !== undefined) {
            req.body.user = req.session.user;
        } else {
            req.body.user = '';
        }

        dbAccount.findAccountDetail(db, req.body, function(result) {
            res.writeHead(200);
            res.end(JSON.stringify(result));
        }, function(result) {
            res.writeHead(200);
            res.end(JSON.stringify(result));
        });
    });

    router.post('/change_nickname', function(req, res) {
        if (!req.session || !req.session.user || req.body.id !== req.session.user) {
            req.body.id = '';
        }

        dbAccount.changeNickname(db, req.body, function(result) {
            req.session.nickname = req.body.nickname;

            res.writeHead(200);
            res.end(JSON.stringify(result));
        }, function(result) {
            res.writeHead(200);
            res.end(JSON.stringify(result));
        });
    });

    return router;
};
