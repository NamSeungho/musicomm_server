var ObjectID = require('mongodb').ObjectID;

/* admin insert music API */
exports.insertArtist = function(db, params, callbackSuccess, callbackFail) {
    params.title    = params.title.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    params.title_en = params.title_en.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    params.debut    = params.debut.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    params.type     = params.type.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    db.collection('artist').insertOne({
        _id         : (new ObjectID()).toString(),
        title       : params.title,
        title_en    : params.title_en,
        debut       : params.debut,
        type        : params.type
    }, function(err, res) {
        if (err) throw err;

        callbackSuccess({
            code    : "0000",
            message : "Success",
            result  : {
                id: res.insertedId
            }
        });
    });
};

exports.findArtist = function(db, params, callbackSuccess, callbackFail) {
    params.user = params.user.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    if (params.q === undefined || params.q === '') {
        db.collection('artist').aggregate(
            [{
                $lookup: {
                    from: "like",
                    localField: "_id",
                    foreignField: "artist",
                    as: "like"
                }
            }, {
                $project: {
                    item      : 1,
                    likecount : { $size: "$like" },
                    isLike    : { $indexOfArray: [ "$like.user", params.user ] },
                    title_en  : "$title_en",
                    title     : "$title",
                    type      : "$type",
                    debut     : "$debut",
                    imgUrl    : "$imgUrl"
                }
            }]
        ).sort({likecount: -1, title: 1}).toArray(function(err, doc) {
            if (err) throw err;

            callbackSuccess({
                code    : "0000",
                message : "Success",
                result  : doc
            });
        });
    } else {
        params.q = params.q.replace(/</g, "&lt;").replace(/>/g, "&gt;");

        db.collection('artist').aggregate(
            [{
                $match: {
                    $or: [
                        { title: new RegExp(params.q, 'i') },
                        { title_en: new RegExp(params.q, 'i') }
                    ]
                }
            }, {
                $lookup: {
                    from: "like",
                    localField: "_id",
                    foreignField: "artist",
                    as: "like"
                }
            }, {
                $project: {
                    item      : 1,
                    likecount : { $size: "$like" },
                    isLike    : { $indexOfArray: [ "$like.user", params.user ] },
                    title_en  : "$title_en",
                    title     : "$title",
                    type      : "$type",
                    debut     : "$debut",
                    imgUrl    : "$imgUrl"
                }
            }]
        ).sort({likecount: -1, title: 1}).toArray(function(err, doc) {
            if (err) throw err;

            callbackSuccess({
                code    : "0000",
                message : "Success",
                result  : doc
            });
        });
    }
};

exports.findArtistDetail = function(db, params, callbackSuccess, callbackFail) {
    params.artistId = params.artistId.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    db.collection('artist').aggregate(
        [{
            $match: {
                _id: params.artistId
            }
        }, {
            $lookup: {
                from: "like",
                localField: "_id",
                foreignField: "artist",
                as: "like"
            }
        }, {
            $project: {
                item        : 1,
                _id         : "$_id",
                title       : "$title",
                title_en    : "$title_en",
                debut       : "$debut",
                type        : "$type",
                likecount   : { $size: "$like" },
                isLike      : { $indexOfArray: [ "$like.user", params.user ] },
            }
        }]
    ).toArray(function(err, doc) {
        if (err) throw err;

        if(doc == null || doc.length === 0) {
            callbackFail({
                code   : "C001",
                message: "Invalid Access"
            });
            return;
        }

        doc = doc[0];

        db.collection('music').aggregate(
            [{
                $match: {
                    singer: {
                        $elemMatch: {
                            _id: params.artistId
                        }
                    }
                }
            }, {
                $lookup: {
                    from          : "favorite",
                    localField    : "video",
                    foreignField  : "video",
                    as            : "favorite"
                }
            }, {
                $project: {
                    item        : 1,
                    video       : "$video",
                    release     : "$release",
                    title       : "$title",
                    type        : "$type",
                    singer      : "$singer",
                    lyrics      : "$lyrics",
                    isFavorite  : { $indexOfArray: [ "$favorite.user", params.user ] }
                }
            }]
        ).sort({release: -1}).toArray(function(err, doc2) {
            if (err) throw err;

            callbackSuccess({
                code    : "0000",
                message : "Success",
                result  : {
                    artistId    : doc._id,
                    title       : doc.title,
                    title_en    : doc.title_en,
                    debut       : doc.debut,
                    type        : doc.type,
                    likecount   : doc.likecount,
                    isLike      : doc.isLike,
                    musicList   : doc2
                }
            });
        });
    });
};

exports.findArtistByKeyDown = function(db, params, callbackSuccess, callbackFail) {
    params.q = params.q.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

    db.collection('artist').aggregate(
        [{
            $match: {
                $or: [{ title: new RegExp(params.q, 'i') }, { title_en: new RegExp(params.q, 'i') }, { title_concat: new RegExp(params.q, 'i') }]
            }
        }, {
            $limit : 1
        }, {
            $project: {
                title         : "$title",
                title_en      : "$title_en",
                type          : "$type",
                debut         : "$debut",
                title_concat  : { $concat: [ "$title", "(", "$title_en", ")" ] }
            }
        }]
    ).toArray(function(err, doc) {
        if (err) throw err;

        callbackSuccess({
            code    : "0000",
            message : "Success",
            result  : doc
        });
    });
};

exports.addLikeArtist = function(db, params, callbackSuccess, callbackFail) {
    params.artistId = params.artistId.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    params.userId   = params.userId.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    db.collection('like').findOne({ artist: params.artistId, user: params.userId }, function(err, doc) {
        if (err) throw err;

        if(doc == null) {
            var date  = new Date();
            var hour  = date.getHours();
            var min   = date.getMinutes();
            var sec   = date.getSeconds();
            var year  = date.getFullYear();
            var month = date.getMonth() + 1;
            var day   = date.getDate();

            db.collection('like').insertOne({
                _id       : (new ObjectID()).toString(),
                artist    : params.artistId,
                user      : params.userId,
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
        }
        else {
            callbackFail({
                code   : "C001",
                message: "Invalid Access"
            });

        }
    });
};

exports.removeLikeArtist = function(db, params, callbackSuccess, callbackFail) {
    params.artistId = params.artistId.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    params.userId   = params.userId.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    db.collection('like').findOne({ artist: params.artistId, user: params.userId }, function(err, doc) {
        if (err) throw err;

        if(doc == null) {
            callbackFail({
                code   : "C001",
                message: "Invalid Access"
            });
        }
        else {
            db.collection('like').deleteOne({ artist : params.artistId, user : params.userId }, function(err, res) {
                if (err) throw err;

                callbackSuccess({
                    code    : "0000",
                    message : "Success",
                    result  : {}
                });
            });
        }
    });
};