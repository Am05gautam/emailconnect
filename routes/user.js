const express = require('express');
const userRouter = express.Router();

const {create_user, get_users} = require('../controller/user.js');

// create_user
userRouter.post('/create_user', create_user);

//get_users
userRouter.get('/get_users', get_users);

module.exports = userRouter;