const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../config/keys').secretOrKey;
const passport = require('passport');
const _ = require('lodash');
const shortid = require("shortid");
const router = express.Router();

//Load user model
const User = require('../models/User');

//Load input validation
const validateRegisterInput = require('../validation/register');
const validateLoginInput = require('../validation/login');

router.get('/test', (req, res) => {
    res.json({ message:'Test users route worked'})
});

router.post('/register', (req, res) => {
    const { errors, isValid } = validateRegisterInput(req.body);

    //Check validation
    if (!isValid) {
        return res.status(400).json(errors);
    }

    User.findOne({'email':req.body.email})
        .then(user => {
            //CHECK IF EMAIL ALREADY EXISTS OR NOT
            if (user) {
                errors.email = 'Email already exists.';
                return res.status(400).json(errors);
                console.log("Email already exist");    
            } else {
                //CHECK IF USERNAME ALREADY EXISTS OR NOT
                User.findOne({username:req.body.username})
                    .then(user1 => {
                        if (user1) {
                            errors.username = 'Username already exists.';
                            return res.status(400).json(errors);
                            console.log("Username already exist");   
                        } else {
                            console.log("New user");   
                            //CREATE NEW USER
                            var today = Date.now();
                            var id = shortid.generate();

                            const newUser = new User({
                                userId : id,
                                username:req.body.username,
                                email:req.body.email,
                                password:req.body.password
                            });
            
                            bcrypt.genSalt(10, (err, salt) => {
                                bcrypt.hash(newUser.password, salt, (err, hash) => {
                                    if(err) throw err;
                                    newUser.password = hash;
                                    newUser.save()
                                        .then(user => res.json(user))
                                        .catch(err => console.log(err));
                                })
                            })
                        }
                    })
            }
        }).catch(err => {
            console.log(err);
        });
});

router.post('/login', (req, res) => {

    const { errors, isValid } = validateLoginInput(req.body);

    //Check validation
    if (!isValid) {
        return res.status(400).json(errors);
    }

    const email = req.body.email;
    const password = req.body.password;

    //Find user by email
    User.findOne({ email })
        .then(user => {
            console.log(user);
            //Check for user
            if (!user) {
                errors.email = 'User not found';
                return res.status(404).json(errors);
            }

            //Check password
            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if (isMatch) {
                        //User matched
                        const payload = { _id:user._id, username:user.username, usersChannels:user.usersChannels } //Create jwt payload
                        //Sign token
                        jwt.sign(payload, keys, { expiresIn:3600 }, (err, token) => {
                            res.json({
                                user:{
                                    _id: user._id,
                                    username:user.username,
                                    usersChannels:user.usersChannels
                                },
                                token: 'Bearer ' + token
                            })
                        });
                    } else {
                        errors.password = 'Incorrect password'
                        return res.status(400).json(errors);
                    }
                });
        })
});

router.get('/all', passport.authenticate('jwt', { session: false }), (req, res) => {
    User.find({username: { $ne: req.user.username }}, { username:1, _id:1})
        .select('') 
        .then(users => {
            res.status(200).json({
                users: users
            })
        }).catch(error => res.status(400).json(error))
});

module.exports = router;