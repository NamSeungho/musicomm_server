const express       = require('express');
const session       = require('express-session');
const MongoStore    = require('connect-mongo')(session);

const indexRouter   = require('./routes/index');
const app           = express();

/* Mongo DB 연결 */
require('./mongo')();

/* Session 미들웨어 설정 */
app.use(session({
    secret: require('./const').SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
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

/* 라우팅 설정 */
app.use('/', indexRouter);

module.exports = app;
