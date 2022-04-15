const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const dotenv = require('dotenv');
dotenv.config();

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(`${process.env.SENDGRID_API_KEY}`);

// const fs = require("fs");

// pathToAttachment = `${__dirname}/attachment.pdf`;
// attachment = fs.readFileSync(pathToAttachment).toString("base64");

const User = require('../models/user');

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: `${process.env.SENDGRID_API_KEY}`
    }
}));

exports.signup = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    bcrypt.hash(password, 12)
        .then(hashedPass => {
            const user = new User({
                _id: new mongoose.Types.ObjectId(),
                email: email,
                password: hashedPass,
                name: name
            });
            return user.save();
        }).then(result => {
            res.status(201).json({ message: 'User created', userId: result._id });
            transporter.sendMail({
                to: email,
                from: 'am05gautam@gmail.com',
                subject: 'Signup succeded!',
                html: '<h1>You successfully signed up!</h1>',
                text: 'Thanks for connecting with us..'
            }).then(res => console.log(res.message)).catch(err => console.log(err))
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.login = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                const error = new Error('A user with this email could not be found.');
                error.statusCode = 401;
                throw error;
            }
            loadedUser = user;
            return bcrypt.compare(password, user.password);
        }).then(isEqual => {
            if (!isEqual) {
                const error = new Error('Wrong password');
                error.statusCode = 401;
                throw error;
            }
            const token = jwt.sign({
                email: loadedUser.email,
                userId: loadedUser._id
            }, 'somesupersecretsecret',
                { expiresIn: '1h' }
            );
            res.status(200).json({ token: token, userId: loadedUser._id });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.emailDeliver = (req, res) => {
    transporter.sendMail({
        to: req.body.email,
        from: 'am05gautam@gmail.com',
        subject: req.body.subject,
        text: req.body.text,
        // attachments: [{}]
    }).then(result => {
        console.log(result);
        res.json({ message: "Mail sent successfully!" });
    })
        .catch(err => console.log(err));
};

exports.sendTemplate = (req, res) => {
    const { to, template_id, dynamic_template_data } = req.body
    const msg = {
        personalizations: [
            {
                to: [
                    {
                        email: to.email,
                        name: to.name
                    }
                ],
                dynamic_template_data: {
                    subject: dynamic_template_data.subject,
                    text: dynamic_template_data.text,
                    img_logo: dynamic_template_data.img_logo,
                    title: dynamic_template_data.title,
                    text_01: dynamic_template_data.text_01,
                    text_02: dynamic_template_data.text_02,
                    text_03: dynamic_template_data.text_03,
                    btn_href: dynamic_template_data.btn_href,
                    btn_name: dynamic_template_data.btn_name,
                    gallery_img: dynamic_template_data.gallery_img,
                    social: {
                        facebook: dynamic_template_data.social.facebook,
                        twitter: dynamic_template_data.social.twitter,
                        instagram: dynamic_template_data.social.instagram,
                        pinterest: dynamic_template_data.social.pinterest,
                        support: dynamic_template_data.social.support,
                        website: dynamic_template_data.social.website
                    }
                }
            }
        ],
        from: {
            email: "am05gautam@gmail.com",
            name: "Aman Gautam"
        },
        reply_to: {
            email: "amangautam31@rediffmail.com",
            name: "Aman Gautam"
        },
        template_id: template_id
    }
    console.log(msg);
    sgMail.send(msg)
        .then((response) => {
            console.log('mail-sent-successfully', response);
            // console.log('response', response.body);
            res.json({ message: "Mail sent successfully!" });
        })
        .catch((error) => {
            console.error('send-grid-error: ', error.toString());
        });
};
