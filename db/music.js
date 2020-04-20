var ObjectID = require('mongodb').ObjectID;

/* admin insert music API */
exports.insertMusic = function(db, params, callbackSuccess, callbackFail) {
    params.artist   = params.artist.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    params.video    = params.video.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    params.title    = params.title.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    params.type     = params.type.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    params.release  = params.release.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    db.collection('artist').findOne({
        _id: params.artist
    }, function(err, res) {
        if (err) throw err;

        params.singer.splice(0, 0, {
            _id       : params.artist,
            title     : res.title,
            title_en  : res.title_en
        });

        db.collection('music').insertOne({
            _id     : (new ObjectID()).toString(),
            artist  : params.artist,
            video   : params.video,
            title   : params.title,
            type    : params.type.toString(),
            release : params.release.toString(),
            lyrics  : "N",
            singer  : params.singer
        }, function(err, res) {
            if (err) throw err;

            callbackSuccess({});
        });
    });
};

/* search header music API */
exports.findMusicByKeyDown = function(db, params, callbackSuccess, callbackFail) {
    params.q = params.q.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    db.collection('music').aggregate(
        [{
            $match: {
                title: new RegExp('^'+params.q, 'i')
            }
        }, {
            $limit : 10
        }, {
            $lookup: {
                from          : "play",
                localField    : "video",
                foreignField  : "video",
                as            : "play"
            }
        }, {
            $project: {
                item        : 1,
                _id         : "$_id",
                title       : "$title",
                video       : "$video",
                singer      : "$singer",
                release     : "$release",
                artist      : "$artist",
                playCount   : { $size: "$play" }
            }
        }]
    ).sort({playCount: -1}).toArray(function(err, doc) {
        if (err) throw err;

        callbackSuccess({
            code    : "0000",
            message : "Success",
            result  : doc
        });
    });
};

/* find latest music API */
exports.findLatestMusic = function(db, params, callbackSuccess, callbackFail) {
    params.user   = params.user.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    if( params.limitCount === null || params.limitCount === undefined )
        params.limitCount = 8;

    db.collection('music').aggregate(
        [{
            $match: {
                type          : "2"
            }
        }, {
            $lookup: {
                from          : "artist",
                localField    : "artist",
                foreignField  : "_id",
                as            : "artist"
            }
        }, {
            $lookup: {
                from          : "favorite",
                localField    : "video",
                foreignField  : "video",
                as            : "favorite"
            }
        }, {
            $unwind   : "$artist"
        }, {
            $project: {
                item        : 1,
                video       : "$video",
                release     : "$release",
                title       : "$title",
                lyrics      : "$lyrics",
                artistId    : "$artist._id",
                artist      : "$artist.title",
                artist_en   : "$artist.title_en",
                isFavorite  : { $indexOfArray: [ "$favorite.user", params.user ] },
                singer: "$singer"
            }
        }]
    ).sort({release: -1, title: -1}).limit(params.limitCount).toArray(function(err, doc) {
        if (err) throw err;

        callbackSuccess({
            code    : "0000",
            message : "Success",
            result  : doc
        });
    });
};

exports.findRankedMusic = function(db, params, callbackSuccess, callbackFail) {
    db.collection('play').aggregate(
        [{
            $sort: {
                date: -1,
                time: -1
            }
        }, {
            $limit: 200
        }, {
            $group: {
                _id: {
                    video     : "$video",
                    artist    : "$artist"
                },
                viewCount     : { $sum: 1 }
            }
        }, {
            $lookup: {
                from          : "music",
                localField    : "_id.video",
                foreignField  : "video",
                as            : "music"
            }
        }, {
            $lookup: {
                from          : "artist",
                localField    : "_id.artist",
                foreignField  : "_id",
                as            : "artist"
            }
        }, {
            $lookup: {
                from          : "favorite",
                localField    : "_id.video",
                foreignField  : "video",
                as            : "favorite"
            }
        }, {
            $unwind   : "$music"
        }, {
            $unwind   : "$artist"
        }, {
            $project: {
                item        : 1,
                video       : "$music.video",
                release     : "$music.release",
                title       : "$music.title",
                singer      : "$music.singer",
                viewCount   : "$viewCount",
                artistId    : "$artist._id",
                artist      : "$artist.title",
                artist_en   : "$artist.title_en",
                isFavorite  : { $indexOfArray: [ "$favorite.user", params.user ] }
            }
        }]
    ).sort({viewCount: -1, title: 1}).limit(20).toArray(function(err, doc) {
        if (err) throw err;

        callbackSuccess({
            code    : "0000",
            message : "Success",
            result  : doc
        });
    });
};

exports.findMusicDetail = function(db, params, callbackSuccess, callbackFail) {
    params.no = params.no.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    db.collection('music').aggregate(
        [{
            $match: {
                video: params.no
            }
        }, {
            $lookup: {
                from          : "favorite",
                localField    : "video",
                foreignField  : "video",
                as            : "favorite"
            }
        }, {
            $lookup: {
                from          : "play",
                localField    : "video",
                foreignField  : "video",
                as            : "play"
            }
        }, {
            $project: {
                item        : 1,
                _id         : "$_id",
                title       : "$title",
                video       : "$video",
                singer      : "$singer",
                release     : "$release",
                artist      : "$artist",
                playCount   : { $size: "$play" },
                favCount    : { $size: "$favorite" },
                isFavorite  : { $indexOfArray: [ "$favorite.user", params.user ] }
            }
        }]
    ).toArray(function(err, doc) {
        if (err) throw err;

        if(doc === null || doc.length === 0) {
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
                    artist  : doc.singer[0]._id,
                    video   : {$nin: [params.no]}
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
                    lyrics      : "$lyrics",
                    singer      : "$singer",
                    isFavorite  : { $indexOfArray: [ "$favorite.user", params.user ] }
                }
            }]
        ).sort({release: -1}).toArray(function(err, doc2) {
            if (err) throw err;

            callbackSuccess({
                code    : "0000",
                message : "Success",
                result  : {
                    musicInfo       : doc,
                    musicList       : doc2
                }
            });
        });
    });
};

exports.addFavoriteMusic = function(db, params, callbackSuccess, callbackFail) {
    params.videoId  = params.videoId.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    params.userId   = params.userId.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    db.collection('favorite').findOne({ video: params.videoId, user: params.userId }, function(err, doc) {
        if (err) throw err;

        if(doc == null) {
            var date  = new Date();
            var hour  = date.getHours();
            var min   = date.getMinutes();
            var sec   = date.getSeconds();
            var year  = date.getFullYear();
            var month = date.getMonth() + 1;
            var day   = date.getDate();

            db.collection('favorite').insertOne({
                _id       : (new ObjectID()).toString(),
                video     : params.videoId,
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

exports.removeFavoriteMusic = function(db, params, callbackSuccess, callbackFail) {
    params.videoId  = params.videoId.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    params.userId   = params.userId.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    db.collection('favorite').findOne({ video: params.videoId, user: params.userId }, function(err, doc) {
        if (err) throw err;

        if(doc == null) {
            callbackFail({
                code   : "C001",
                message: "Invalid Access"
            });
        }
        else {
            db.collection('favorite').deleteOne({ video : params.videoId, user : params.userId }, function(err, res) {
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

exports.insertMusicPlay = function(db, params, callbackSuccess) {
    params.user   = params.user.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    params.video  = params.video.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    params.artist = params.artist.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    var date  = new Date();
    var hour  = date.getHours();
    var min   = date.getMinutes();
    var sec   = date.getSeconds();
    var year  = date.getFullYear();
    var month = date.getMonth() + 1;
    var day   = date.getDate();

    db.collection('play').insertOne({
        _id     : (new ObjectID()).toString(),
        user    : params.user,
        video   : params.video,
        artist  : params.artist,
        date    : year + (month < 10 ? "0" : "") + month + (day < 10 ? "0" : "") + day,
        time    : (hour < 10 ? "0" : "") + hour + (min < 10 ? "0" : "") + min + (sec < 10 ? "0" : "") + sec
    }, function(err, res) {
        if (err) throw err;

        callbackSuccess({});
    });
};

exports.findRadioMusicByYear = function(db, params, callbackSuccess) {
    var resultObject = {};

    function getMusicInfoByYearLocal (year) {
        getMusicInfoByYear(db, year, 100, function(doc) {
            resultObject[year] = doc;

            year--;
            if (year >= 2016) {
                getMusicInfoByYearLocal(year);
            } else {
                callbackSuccess({
                    code    : "0000",
                    message : "Success",
                    result  : resultObject
                });
            }
        });
    }

    getMusicInfoByYearLocal(2020);
};

exports.findRadioMusicByArtistType = function(db, params, callbackSuccess) {
    var resultObject = {};

    function getMusicInfoByArtistTypeLocal (type) {
        getMusicInfoByArtistType(db, type, 100, function(doc) {
            resultObject[type] = doc;

            type--;
            if (type >= 1) {
                getMusicInfoByArtistTypeLocal(type);
            } else {
                callbackSuccess({
                    code    : "0000",
                    message : "Success",
                    result  : resultObject
                });
            }
        });
    }

    getMusicInfoByArtistTypeLocal(5);
};

function getMusicInfoByYear(db, year, limit, callback) {
    db.collection('music').aggregate(
        [{
            $match: {
                release       : { $gt: year+"0000", $lt: year+"9999" }
            }
        }, {
            $sample           : { size: limit }
        }, {
            $lookup: {
                from          : "artist",
                localField    : "artist",
                foreignField  : "_id",
                as            : "artist"
            }
        }, {
            $unwind   : "$artist"
        }, {
            $project: {
                item        : 1,
                video       : "$video",
                release     : "$release",
                title       : "$title",
                lyrics      : "$lyrics",
                artistId    : "$artist._id",
                artist      : "$artist.title",
                artist_en   : "$artist.title_en",
                singer      : "$singer"
            }
        }]
    ).toArray(function(err, doc) {
        if (err) throw err;

        callback(doc);
    });
}

function getMusicInfoByArtistType(db, type, limit, callback) {
    db.collection('artist').aggregate(
        [{
            $match: {
                type          : type+''
            }
        }, {
            $lookup: {
                from          : "music",
                localField    : "_id",
                foreignField  : "artist",
                as            : "music"
            }
        }, {
            $unwind           : "$music"
        }, {
            $sample           : { size: limit }
        }, {
            $project: {
                item          : 1,
                video         : "$music.video",
                release       : "$music.release",
                title         : "$music.title",
                lyrics        : "$music.lyrics",
                singer        : "$music.singer",
                artistId      : "$_id",
                artist        : "$title",
                artist_en     : "$title_en"
            }
        }]
    ).toArray(function(err, doc) {
        if (err) throw err;

        callback(doc);
    });
}


exports.getMusic = function(db, params, callbackSuccess, callbackFail) {
    db.collection('music').aggregate(
        [{
            $project: {
                item        : 1,
                _id         : "$_id",
                video       : "$video"
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

exports.getArtist = function(db, params, callbackSuccess, callbackFail) {
    db.collection('artist').aggregate(
        [{
            $project: {
                item        : 1,
                _id         : "$_id"
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