var express = require('express');
var userRouter = express.Router();
var User = require('../models/User.js');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var config = require('../config');


//POST route for registration
userRouter.post('/registration', function (req, res, next) {
    // confirm that user typed same password twice
    if (req.body.password !== req.body.passwordConf) {
        return res.json({flag: 0, message: 'Passwords don\'t match.'});
    }

    if (req.body.email &&
        req.body.username &&
        req.body.password &&
        req.body.passwordConf) {

        var userData = {
            email: req.body.email,
            username: req.body.username,
            password: req.body.password,
            passwordConf: req.body.passwordConf
        };

        User.create(userData, function (error, user) {
            if (error) {
                if(error.code == 11000 && error.name == 'MongoError')
                    return res.json({flag: 0, message: 'Already exist with this email or username.'});
            } else {
                // create a token
                var token = jwt.sign({id: user._id}, config.secret, {
                    expiresIn: 86400 // expires in 24 hours
                });
                return res.json({flag: 1, auth: true, token: token});
            }
        });

    }else {
        return res.json({flag: 0, message: 'All fields required.'});
    }
});

// POST route for Login
userRouter.post('/login', function (req, res, next) {

    if (req.body.username && req.body.password) {
        User.findOne({
                $or: [
                    {"username": req.body.username},
                    {"email": req.body.username}]
            }
        ).exec(function (error, user) {
            if (error) {
                return next(error);
            } else {
                if (user) {
                    bcrypt.compare(req.body.password, user.password, function (err, response) {
                        if (response) {
                            // Passwords match
                            var token = jwt.sign({id: user._id}, config.secret, {
                                expiresIn: 86400 // expires in 24 hours
                            });
                            return res.json({flag: 1, auth: true, token: token});
                        } else {
                            // Passwords don't match
                            return res.json({flag: 0, message: 'Incorrect password.'});
                        }
                    });
                } else {
                    return res.json({flag: 0, message: 'Incorrect email or username.'});
                }
                // return res.redirect('/profile');
            }
        });

    } else {
        return res.json({flag: 0, message: 'All fields are required.'});
    }
});

// GET route after registering
userRouter.get('/profile', function (req, res, next) {
    var token = req.headers['x-access-token'];
    if (!token) return res.status(401).send({auth: false, message: 'No token provided.'});

    jwt.verify(token, config.secret, function (err, decoded) {
        if (err) return res.status(500).send({auth: false, message: 'Failed to authenticate token.'});

        User.findById(decoded.id, {password: 0, passwordConf: 0}, function (err, user) {
            if (err) return res.status(500).send("There was a problem finding the user.");
            if (!user) return res.status(404).send("No user found.");

            return res.json(user);
        });
    });
});

// GET for logout logout
userRouter.post('/logout', function (req, res, next) {
    return res.json({flag: 1, auth: false, token: null });
});

module.exports = userRouter;