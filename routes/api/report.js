var express     = require('express');
var router      = express.Router();
var dbReport   = require('../../db/report');

module.exports = function (db) {
    router.post('/', function(req, res) {
        if (req.session && req.session.user !== null && req.session.user !== undefined) {
            req.body.user = req.session.user;
        } else {
            req.body.user = '';
        }

        dbReport.insertReport(db, req.body, function(result) {
            res.writeHead(200);
            res.end(JSON.stringify(result));
        }, function(result) {
            res.writeHead(200);
            res.end(JSON.stringify(result));
        });
    });

    return router;
};