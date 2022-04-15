const User = require('../models/user.js');
const mongoose = require('mongoose');

const create_user = (req, res, next) => {
    // 1. try finding if the user email exists already
    // return console.log(req.body);
    User.find({email:req.body.email})
    .exec()
    .then(user => {
        // console.log("this is the user");
        // console.log(user);
        // console.log("user ends");
        // 2. if user email found then user exists then we have to return a conflict
        if(user.length >= 1 ){
            return res.status(409).json({
                message: "Email already exists"
            })
        }
        else{
            // 3. user not found then we have to create new user
            const user = new User({
                _id: new mongoose.Types.ObjectId(),
                // first_name: req.body.first_name,
                // last_name: req.body.last_name,
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                accessLevel: req.body.accessLevel
            })

            user.save().then(result => {
                res.status(201).json({
                    message: "User created successfully",
                    user: result
                })
            }).catch(err => {
                res.status(500).json({
                    message:"Error in creating user",
                    error: err
                })
            });
        }
    })
    .catch(err => {
        res.status(500).json({
            error: err
        })
    });
}

const get_users = (req, res, next) => {
    User.find().exec().then(allUsers=>{
        // console.log(allUsers);
        res.status(200).json({users: allUsers});
    })
    .catch(err=>{
        // console.log(err);
        res.status(500).json({error: err});
    });
}

module.exports = {
    create_user,
    get_users
}