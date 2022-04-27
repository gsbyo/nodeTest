const express = require('express');
const app = express();
var router = require('express').Router();

const passport = require('passport');

router.get('/', (req, res) => {
    res.render('login.ejs');
});


router.post('/', passport.authenticate('local', {failureRedirect : '/fail'}), (req, res) => {
    res.redirect('/');
});
   

module.exports = router;
