const MongoClient   = require('mongodb').MongoClient;
const assert        = require('assert');

module.exports = function() {
    let db = null;

    MongoClient.connect(require('./const').DB_URL, {
        useUnifiedTopology: true
    }, function (err, client) {
        assert.equal(null, err);

        db = client.db(require('./const').DB_NAME);

        console.log('Completely connect MongoDB');

        // db.collection('account').insertOne({a: 'b', c: 2});
    });
};