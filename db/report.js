var ObjectID    = require('mongodb').ObjectID;

exports.insertReport = function(db, params, callbackSuccess, callbackFail) {
    params.user     = params.user.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    params.email    = params.email.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    params.message  = params.message.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    var date  = new Date();
    var hour  = date.getHours();
    var min   = date.getMinutes();
    var sec   = date.getSeconds();
    var year  = date.getFullYear();
    var month = date.getMonth() + 1;
    var day   = date.getDate();

    db.collection('report').insertOne({
        _id       : (new ObjectID()).toString(),
        user      : params.user,
        email     : params.email,
        message   : params.message,
        date      : year + (month < 10 ? "0" : "") + month + (day < 10 ? "0" : "") + day,
        time      : (hour < 10 ? "0" : "") + hour + (min < 10 ? "0" : "") + min + (sec < 10 ? "0" : "") + sec
    }, function(err, res) {
        if (err) throw err;

        callbackSuccess({
            code    : "0000",
            message : "Success",
            result  : {}
        });
    });
};
