var express     = require('express');
var router      = express.Router();
var dbChat      = require('../../db/chat');

module.exports = function (db) {
    router.post('/select', function(req, res, next) {
        dbChat.findChattingMessage(db, {}, function(chatResult) {
            res.writeHead(200);
            res.end(JSON.stringify({
                code    : "0000",
                message : "Success",
                result  : chatResult.result
            }));
        });
    });

    return router;
};