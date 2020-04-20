var ObjectID = require('mongodb').ObjectID;

exports.insertChattingMessage = function(db, params) {
    params.id       = params.id.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    params.message  = params.message.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    var date  = new Date();
    var hour  = date.getHours();
    var min   = date.getMinutes();
    var sec   = date.getSeconds();
    var year  = date.getFullYear();
    var month = date.getMonth() + 1;
    var day   = date.getDate();

    db.collection('chat').insertOne({
        _id       : (new ObjectID()).toString(),
        user      : params.id,
        message   : params.message,
        date      : year + (month < 10 ? "0" : "") + month + (day < 10 ? "0" : "") + day,
        time      : (hour < 10 ? "0" : "") + hour + (min < 10 ? "0" : "") + min + (sec < 10 ? "0" : "") + sec,
        timestamp : date.getTime()
    }, function(err, res) {

    });
};

exports.findChattingMessage = function(db, params, callbackSuccess, callbackFail) {
    const cursor = db.collection('chat').aggregate(
        [{
            $match: {}
        }, {
            $lookup: {
                from: "account",
                localField: "user",
                foreignField: "_id",
                as: "account"
            }
        }, {
            $project: {
                item        : 1,
                user        : "$user",
                nickname    : "$account.nickname",
                message     : "$message",
                timestamp   : "$timestamp"
            }
        }]
    ).sort({timestamp: 1}).limit(200).toArray(function(err, doc) {
        if (err) throw err;

        if (doc === null) {
            doc = [];
        }

        doc = doc.map(chatInfo => {
            return {
                userId: chatInfo.user,
                nickname: chatInfo.nickname[0],
                message: chatInfo.message,
                timestamp: chatInfo.timestamp
            };
        });

        callbackSuccess({
            code    : "0000",
            message : "Success",
            result  : {
                chatList: doc,
                currentTimeStamp: (new Date()).getTime()
            }
        });
    });
};