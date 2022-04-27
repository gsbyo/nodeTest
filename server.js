const express = require('express');
const app = express();

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

// -- DB connect -- // 
const dbConnection = require('./config/db');

dbConnection.connect((err) => {
    if (err)  return console.log(err);

    app.db = dbConnection.getDB();
    console.log("db connect success");
});

/////////////////////////

const passportConfig = require('./config/passport');
passportConfig();


app.listen(3000, () => {
    console.log("port 3000 connect");
});



const loginRouter = require('./router/login');

app.use("/login", loginRouter);


app.get('/', (req, res) => {

   dbConnection.getDB().collection('login').findOne({ user : "test" }, function (err, res) {
        console.log(res);
    })

   res.render('board.ejs');
})





