var router = require('express').Router();

const User = require('../schema/user');

const passport = require('passport');


router.get('/login', (req, res) => {
    if(req.isAuthenticated()) return res.redirect('/');

    res.render('login.ejs');
});

router.get('/naver', passport.authenticate('naver', null));

router.get('/naver/callback',
  passport.authenticate('naver', {
    successRedirect: '/board',
    failureRedirect: '/auth/login'
  })
);

router.post('/login', passport.authenticate('local', {failureRedirect : '/auth/fail'}), (req, res) => {
    res.redirect('/board');
});

router.get('/fail', (req, res) => {
  res.send("<script charset='UTF-8'>alert('아이디 혹은 비밀번호를 잘못 입력하였습니다.'); location.href='/auth/login';</script>");
});

router.get('/logout', (req, res) => {
    req.logout();

    res.redirect('/board');
})

module.exports = router;
