var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.render('index.html');
});

router.get('/latest_music', function(req, res, next) {
    res.render('index.html');
});

router.get('/artist_list', function(req, res, next) {
    res.render('index.html');
});

router.get('/artist/:no', function(req, res, next) {
    res.render('index.html');
});

router.get('/music/:no', function(req, res, next) {
    res.render('index.html');
});

router.get('/profile/:no', function(req, res, next) {
    res.render('index.html');
});

router.get('/theme', function(req, res, next) {
    res.render('index.html');
});

router.get('/admin', function(req, res, next) {
    if( req.session && req.session.user !== null && req.session.user === '59a7c166eb05726de3832477' ) {
        res.render('index.html');
    }
});

module.exports = router;
