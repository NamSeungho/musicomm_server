const express       = require('express');
const session       = require('express-session');
const MongoStore    = require('connect-mongo')(session);
const socket        = require('socket.io');
const MongoClient   = require('mongodb').MongoClient;
const assert        = require('assert');

const PORT = 3000;
const mongoUrl = 'mongodb://localhost:27017/';
const mongoDatabaseName = 'musicomm';
const app = express();

let db = null;

MongoClient.connect(mongoUrl, {
    useUnifiedTopology : true
}, function(err, client) {
    assert.equal(null, err);

    db = client.db(mongoDatabaseName);

    // db.collection('account').insertOne({a: 'b', c: 2});
});

const server = app.listen(PORT, () => {
    console.log('listening on port ' + PORT);
});

/* Session */
app.use(session({
    secret: 'vue musicomm secret',
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({
        url : mongoUrl + mongoDatabaseName,
        ttl : 60 * 60  // 1 hour (default: 14days)
    })
}));

/* 서버가 읽을 수 있도록 HTML 의 위치를 정의해줍니다. */
app.set('views', 'public');

/* 서버가 HTML 렌더링을 할 때, EJS엔진을 사용하도록 설정합니다. */
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

/* resource 경로 지정 */
app.use(express.static('public'));

/* Router */
app.get('/', (req, res) => {
    // res.send('Hello World!');
    res.render('index.html');
});

/* Socket IO */
const io = socket(server);
io.on('connection', function(socket){
    socket.on('chat', function(data){
        // insert chatting message in DB

        socket.emit('chat', data);
    });
});