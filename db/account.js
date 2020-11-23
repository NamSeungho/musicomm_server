var ObjectID    = require('mongodb').ObjectID;
var crypto      = require('crypto');

exports.findAccount = function(db, params, callbackSuccess, callbackFail) {
    params.email    = params.email.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    params.password = params.password.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    db.collection('account').findOne({ email: params.email }, function(err, doc) {
        if (err) throw err;

        if(doc == null) {
            console.log("계정이 존재하지 않습니다 - A001 (" + params.email + ")");

            callbackFail({
                code   : "A001",
                message: "계정이 존재하지 않습니다"
            });
        }
        else {
            crypto.pbkdf2(params.password, doc.salt, 3649, 64, 'sha512', (err, key) => {
                db.collection('account').findOne({ email: params.email, password: key.toString('base64') }, function(err, doc) {
                    if (err) throw err;

                    if(doc == null) {
                        console.log("The password is incorrect");

                        callbackFail({
                            code   : "A001",
                            message: "비밀번호가 일치하지 않습니다"
                        });
                    }
                    else {
                        callbackSuccess({
                            code    : "0000",
                            message : "Success",
                            result  : {
                                _id     : doc._id,
                                email   : doc.email,
                                nickname: doc.nickname
                            }
                        });
                    }
                });
            });
        }
    });
};

exports.insertAccount = function(db, params, callbackSuccess, callbackFail) {
    params.email    = params.email.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    params.password = params.password.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    params.nickname = params.nickname.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    crypto.randomBytes(64, (err, buf) => {
        crypto.pbkdf2(params.password, buf.toString('base64'), 3649, 64, 'sha512', (err, key) => {
            exports.findDupAccount(db, params, function(result) {
                var date  = new Date();
                var hour  = date.getHours();
                var min   = date.getMinutes();
                var sec   = date.getSeconds();
                var year  = date.getFullYear();
                var month = date.getMonth() + 1;
                var day   = date.getDate();

                db.collection('account').insertOne({
                    _id         : (new ObjectID()).toString(),
                    email       : params.email,
                    password    : key.toString('base64'),
                    salt        : buf.toString('base64'),
                    nickname    : params.nickname,
                    date        : year + (month < 10 ? "0" : "") + month + (day < 10 ? "0" : "") + day,
                    time        : (hour < 10 ? "0" : "") + hour + (min < 10 ? "0" : "") + min + (sec < 10 ? "0" : "") + sec
                }, function(err, res) {
                    if (err) throw err;

                    console.log("1 document inserted");
                    callbackSuccess(result);
                });
            }, function(result) {
                callbackFail(result);
            });
        });
    });
};

exports.findDupAccount = function(db, params, callbackSuccess, callbackFail) {
    params.email    = params.email.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    params.nickname = params.nickname.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    db.collection('account').findOne({ email: params.email }, function(err, doc) {
        if (err) throw err;

        if(doc != null) {
            console.log("Duplicated email address");

            callbackFail({
                code   : "A002",
                message: "Duplicated email address"
            });
        }
        else {
            db.collection('account').findOne({ nickname: params.nickname }, function(err, doc) {
                if (err) throw err;

                if(doc != null) {
                    console.log("Duplicated nickname");
                    callbackFail({
                        code   : "A003",
                        message: "Duplicated nickname"
                    });
                }
                else {
                    callbackSuccess({
                        code   : "0000",
                        message: "Success"
                    });
                }
            });
        }
    });
};

exports.findAccountDetail = function(db, params, callbackSuccess, callbackFail) {
    params.user     = params.user.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    params.no       = params.no.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    db.collection('account').findOne({ _id: params.no }, function(err, doc) {
        if (err) throw err;

        if(doc == null) {
            console.log("계정이 존재하지 않습니다 - A001 (" + params.no + ")");

            callbackFail({
                code   : "A001",
                message: "계정이 존재하지 않습니다"
            });

            return;
        }

        db.collection('like').aggregate(
            [{
                $match: {
                    user: params.no
                }
            }, {
                $lookup: {
                    from            : "like",
                    localField      : "artist",
                    foreignField    : "artist",
                    as              : "like"
                }
            }, {
                $lookup: {
                    from            : "artist",
                    localField      : "artist",
                    foreignField    : "_id",
                    as              : "artist"
                }
            }, {
                $project: {
                    item        : 1,
                    _id         : 0,
                    artistId    : { $arrayElemAt: [ "$artist._id", 0 ] },
                    title       : { $arrayElemAt: [ "$artist.title", 0 ] },
                    title_en    : { $arrayElemAt: [ "$artist.title_en", 0 ] },
                    debut       : { $arrayElemAt: [ "$artist.debut", 0 ] },
                    type        : { $arrayElemAt: [ "$artist.type", 0 ] },
                    isLike      : { $indexOfArray: [ "$like.user", params.user ] },
                }
            }]
        ).sort({title: -1}).toArray(function(err, doc2) {
            if (err) throw err;

            db.collection('favorite').aggregate(
                [{
                    $match: {
                        user: params.no
                    }
                }, {
                    $lookup: {
                        from          : "music",
                        localField    : "video",
                        foreignField  : "video",
                        as            : "music"
                    }
                }, {
                    $project: {
                        item        : 1,
                        _id         : 0,
                        date        : "$date",
                        time        : "$time",
                        videoId     : { $arrayElemAt: [ "$music.video", 0 ] },
                        singer      : { $arrayElemAt: [ "$music.singer", 0 ] },
                        title       : { $arrayElemAt: [ "$music.title", 0 ] },
                        debut       : { $arrayElemAt: [ "$music.debut", 0 ] },
                        release     : { $arrayElemAt: [ "$music.release", 0 ] },
                        artistId    : { $arrayElemAt: [ "$music.artist", 0 ] },
                        lyrics      : { $arrayElemAt: [ "$music.lyrics", 0 ] }
                    }
                }, {
                    $lookup: {
                        from          : "artist",
                        localField    : "artistId",
                        foreignField  : "_id",
                        as            : "artist"
                    }
                }, {
                    $lookup: {
                        from          : "favorite",
                        localField    : "videoId",
                        foreignField  : "video",
                        as            : "favorite"
                    }
                }, {
                    $project: {
                        item            : 1,
                        _id             : 0,
                        videoId         : "$videoId",
                        title           : "$title",
                        date            : "$date",
                        time            : "$time",
                        release         : "$release",
                        debut           : "$debut",
                        singer          : "$singer",
                        artistId        : "$artistId",
                        lyrics          : "$lyrics",
                        artistTitle     : { $arrayElemAt: [ "$artist.title", 0 ] },
                        artistTitleEn   : { $arrayElemAt: [ "$artist.title_en", 0 ] },
                        isFavorite      : { $indexOfArray: [ "$favorite.user", params.user ] }
                    }
                }]
            ).sort({date: -1, time: -1}).toArray(function(err, doc3) {
                if (err) throw err;

                db.collection('play').aggregate(
                    [{
                        $match: {
                            user: params.no
                        }
                    }, {
                        $group : {
                            _id : "$video",
                            date: { $last: "$date" },
                            time: { $last: "$time" }
                        }
                    }, {
                        $sort : {
                            date: -1,
                            time: -1
                        }
                    }, {
                        $limit : 8
                    }, {
                        $lookup: {
                            from          : "music",
                            localField    : "_id",
                            foreignField  : "video",
                            as            : "music"
                        }
                    }, {
                        $project: {
                            item        : 1,
                            _id         : 0,
                            videoId     : { $arrayElemAt: [ "$music.video", 0 ] },
                            title       : { $arrayElemAt: [ "$music.title", 0 ] },
                            artistId    : { $arrayElemAt: [ "$music.artist", 0 ] },
                            singer      : { $arrayElemAt: [ "$music.singer", 0 ] },
                            date        : "$date",
                            time        : "$time"
                        }
                    }, {
                        $lookup: {
                            from          : "artist",
                            localField    : "artistId",
                            foreignField  : "_id",
                            as            : "artist"
                        }
                    }, {
                        $lookup: {
                            from          : "favorite",
                            localField    : "videoId",
                            foreignField  : "video",
                            as            : "favorite"
                        }
                    }, {
                        $project: {
                            item            : 1,
                            _id             : 0,
                            videoId         : "$videoId",
                            title           : "$title",
                            artistId        : "$artistId",
                            singer          : "$singer",
                            artistTitle     : { $arrayElemAt: [ "$artist.title", 0 ] },
                            artistTitleEn   : { $arrayElemAt: [ "$artist.title_en", 0 ] },
                            date            : "$date",
                            time            : "$time",
                            isFavorite      : { $indexOfArray: [ "$favorite.user", params.user ] }
                        }
                    }]
                ).toArray(function(err, doc4) {
                    if (err) throw err;

                    db.collection('play').aggregate(
                        [{
                            $match: {
                                user: params.no
                            }
                        }, {
                            $count: "profilePlayCount"
                        }]
                    ).toArray(function(err, doc5) {
                        if (err) throw err;

                        callbackSuccess({
                            code    : "0000",
                            message : "Success",
                            result  : {
                                profileNickname     : doc.nickname,
                                profileEmail        : doc.email,
                                profilePlayCount    : (doc5.length == 0 ? 0 : doc5[0].profilePlayCount),
                                artistList          : doc2,
                                musicList           : doc3,
                                recentList          : doc4
                            }
                        });
                    });
                });
            });
        });
    });
};

exports.changeNickname = function(db, params, callbackSuccess, callbackFail) {
    params.nickname = params.nickname.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    db.collection('account').findOne({ _id: params.id }, function(err, doc) {
        if (err) throw err;

        if(doc == null) {
            console.log("계정이 존재하지 않습니다 - A001 (" + params.id + ")");

            callbackFail({
                code   : "A001",
                message: "계정이 존재하지 않습니다"
            });
        }
        else {
            db.collection('account').updateOne({ _id: params.id }, { $set: { nickname: params.nickname } }, function(err, doc) {
                if (err) throw err;

                callbackSuccess({
                    code    : "0000",
                    message : "Success",
                    result  : {
                        _id     : doc._id,
                        nickname: doc.nickname
                    }
                });
            });
        }
    });
};

exports.insertAccess = function(db, params) {
    params._id = params._id.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    var date = new Date();
    var hour  = date.getHours();
    var min   = date.getMinutes();
    var sec   = date.getSeconds();
    var year  = date.getFullYear();
    var month = date.getMonth() + 1;
    var day   = date.getDate();


    db.collection('access').insertOne({
        _id     : (new ObjectID()).toString(),
        user    : params._id,
        date    : year + (month < 10 ? "0" : "") + month + (day < 10 ? "0" : "") + day,
        time    : (hour < 10 ? "0" : "") + hour + (min < 10 ? "0" : "") + min + (sec < 10 ? "0" : "") + sec
    }, function(err, res) {

    });
};
