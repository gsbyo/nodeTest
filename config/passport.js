const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

module.exports = () => {
    passport.use(new LocalStrategy({
        usernameField: 'id',
        passwordField: 'pwd',
        session: true,
        passReqToCallback: true,
    }, function (req, input_id, input_pw, done) {
        req.app.db.collection('login').findOne({ user: input_id }, (err, res) => {
            //mongodb err
            if(err) return done(err);
            //not find id
            if(!res) return done(null, false, { message: '존재하지않는 아이디입니다' })
            //password check
            if (input_pw == res.password) {
                return done(null, res)
            } else {
                return done(null, false, { message: '비밀번호를 다시 확인해주세요.' })
            }
        })
    }));
    
    passport.serializeUser(function (login, done) {
        done(null, login.user)
    });
    
    passport.deserializeUser(function (req ,input_id, done) {
        req.app.db.collection('login').findOne({ user : input_id }, function (err, res) {
            done(null, res.user );
        })
    });
}
 


