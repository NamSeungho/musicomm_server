const express       = require('express');
const session       = require('express-session');
const cors          = require('cors');
const bodyParser    = require('body-parser');
const MongoClient   = require('mongodb').MongoClient;
const assert        = require('assert');
const MongoStore    = require('connect-mongo')(session);
const appRoot       = require('app-root-path');
const fs            = require('fs');

const indexRouter       = require('./routes/index');
const adminApiRouter    = require('./routes/api/admin');
const searchApiRouter   = require('./routes/api/search');
const chatApiRouter     = require('./routes/api/chat');
const MainApiRouter     = require('./routes/api/main');
const MusicApiRouter    = require('./routes/api/music');
const ArtistApiRouter   = require('./routes/api/artist');
const ProfileApiRouter  = require('./routes/api/profile');
const ReportApiRouter   = require('./routes/api/report');

import socket from './socket';

import mongoose from 'mongoose';
import scheme from './scheme';
const { graphqlHTTP } = require('express-graphql');

const app           = express();

mongoose.connect('mongodb://localhost/musicomm', { useNewUrlParser: true, useUnifiedTopology: true });

app.use(`/graphql`, graphqlHTTP({
    schema: scheme,
    graphiql: true
}));

let db = null;

function connectDB () {
    return new Promise((resolve, reject) => {
        MongoClient.connect(require('./const').DB_URL, {
            useUnifiedTopology: true
        }, (err, client) => {
            assert.equal(null, err);

            db = client.db(require('./const').DB_NAME);

            console.log('Completely connect MongoDB');
            resolve();
        });
    });
}

function createServer () {
    return new Promise((resolve, reject) => {
        /* Create HTTP server & Apply SSL */
        require('greenlock-express').init({
            packageRoot: __dirname,
            configDir: './greenlock.d',
            maintainerEmail: 'skatmdgh1221@nate.com',
            cluster: false
        }).ready((glx) => {
            /* Socket module dependencies */
            socket(glx.httpsServer(), db);

            /* Create server */
            glx.serveApp(app);
        });

        resolve();
    });
}

function createLocalServer () {
    return new Promise((resolve, reject) => {
        /* Create HTTP server */
        const PORT = require('./const').PORT;
        const server = app.listen(PORT, () => {
            console.log('Open HTTP server on ' + PORT + ' port');
        });

        socket(server, db);

        resolve();
    });
}

async function runApplication () {
    /* Request Parameter Parser */
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended  : true
    }));

    /* Mongo DB 연결 */
    await connectDB();
    // await createServer();
    await createLocalServer();

    /* Session 미들웨어 설정 */
    app.use(session({
        secret: require('./const').SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({
            url : require('./const').DB_URL + require('./const').DB_NAME,
            ttl : 60 * 60  // 1 hour (default: 14days)
        })
    }));

    /* HTML 위치 정의 */
    app.set('views', 'public');

    /* 서버가 HTML 렌더링을 할 때, EJS엔진을 사용하도록 설정 */
    app.set('view engine', 'ejs');
    app.engine('html', require('ejs').renderFile);

    /* resource 경로 지정 */
    app.use(express.static('public'));

    /* CORS 설정 */
    app.use(cors({
        origin:['http://localhost:8080', 'http://localhost:8081', 'http://localhost:2000'],
        methods:['GET','POST'],
        credentials: true // enable set cookie
    }));

    /* 라우팅 설정 */
    app.use('/', indexRouter);
    app.use('/api/admin', adminApiRouter(db));
    app.use('/api/search', searchApiRouter(db));
    app.use('/api/chat', chatApiRouter(db));
    app.use('/api/main', MainApiRouter(db));
    app.use('/api/music', MusicApiRouter(db));
    app.use('/api/artist', ArtistApiRouter(db));
    app.use('/api/profile', ProfileApiRouter(db));
    app.use('/api/report', ReportApiRouter(db));

    app.get('/lyrics/:no', (req, res) => {
        fs.readFile(appRoot + '/files/lyrics/' + req.params.no + '.txt', function(err, data) {
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end(data);
        });
    });
}

runApplication();

module.exports = app;