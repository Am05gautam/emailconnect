const express = require('express');
const { body } = require('express-validator');

const user = require('../models/user');
const auth = require('../controller/auth');

const router = express.Router();

router.put('/signup', [
    body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .custom((value, {req}) => {
        return user.findOne({email:value}).then(userDoc => {
            if(userDoc) return Promise.reject('E-mail address already exists!');
        })
    })
    .normalizeEmail(),
    body('password')
        .trim()
        .isLength({min:5}),
    body('name')
        .trim()
        .not()
        .isEmpty()
],
auth.signup
);

router.post('/login', auth.login);

router.post('/email', auth.emailDeliver);

router.post('/sendDT', auth.sendTemplate);

module.exports = router;