const express = require('express');
const app = express();

const helmet = require('helmet');
app.use(
    helmet({
        contentSecurityPolicy : false
    })
);


require('dotenv').config();

const bodyParser= require('body-parser')
app.use(bodyParser.urlencoded({extended: true})) 

app.use('/public', express.static(__dirname + '/public'))

app.set('view engine', 'ejs');

const passport = require('passport');
const session = require('express-session');
app.use(session({secret : process.env.SESSION_SECRET, resave : true, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session()); 

const cookieParser = require('cookie-parser');
app.use(cookieParser());

// -- DB connect -- // 
const dbcon = require('./config/db');
dbcon();


app.locals.isAuthenticated = false;
app.locals.currentUser = null;
app.locals.auth = null;

app.use( (req, res, next) => {
    res.locals.isAuthenticated = req.isAuthenticated();
    res.locals.currentUser = req.user;
    next();
});

const passportConfig = require('./config/passport');
passportConfig();

app.listen(3000, () => {
    console.log("port 3000 connect");
});

const loginRouter = require('./router/login');

app.use("/auth", loginRouter);

const boardRouter = require('./router/board');
const req = require('express/lib/request');
const { contentSecurityPolicy } = require('helmet');

app.use("/board", boardRouter);




