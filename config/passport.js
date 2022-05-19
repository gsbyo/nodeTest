const req = require('express/lib/request');
const passport = require('passport');
const users = require('../schema/user');

var LocalStrategy = require('passport-local').Strategy;
var NaverStrategy = require('passport-naver').Strategy;

module.exports = () => {
    passport.use(new LocalStrategy({
        usernameField: 'id',
        passwordField: 'pwd',
        session: true,
    }, function (input_id, input_pw, done) {
        users.findOne({ id : input_id }, (err, res) => {
            //mongodb err
            if(err) return done(err);
            //not find id
            if(!res) return done(null, false, { message: '존재하지않는 아이디입니다' })
            //password check
            if (input_pw == res.pwd) {
                return done(null, res)
            } else {
                return done(null, false, { message: '비밀번호를 다시 확인해주세요.' })
            }
        })
    }));
    
    passport.use(new NaverStrategy({
        clientID: process.env.NAVER_ID,
        clientSecret: process.env.NAVER_KEY,
        callbackURL: "http://localhost:3000/login/naver/callback"
    },
        function (accessToken, refreshToken, profile, done) {
            process.nextTick(function () {
                var user = {
                    name: profile.displayName,
                    provider: 'naver', 
                    id: profile._json.id
                };
                console.log("profile");
                console.log(user.id);
                return done(null, user);
            });
    }));


    passport.serializeUser(function (user, done) {
        done(null, user.id)
    });

    passport.deserializeUser(function (user, done) {
            done(null, user);
    });

   

}
 


