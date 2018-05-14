var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    photo: {
        type: String,
        trim: true,
        required: true,
        default: '/uploads/images/pp.png'
    },
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    passwordConf: {
        type: String,
        required: true
    },
    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    }],
    ownTasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    }],
    projects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    }],
    ownProjects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    }],
    conversations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation'
    }],
    contacts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    sentFriendRequests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    gotFriendRequests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
});

//authenticate input against database
UserSchema.statics.authenticate = function (email, password, callback) {
    User.findOne({ email: email })
        .exec(function (err, user) {
            if (err) {
                return callback(err)
            } else if (!user) {
                var err = new Error('User not found.');
                err.status = 401;
                return callback(err);
            }
            bcrypt.compare(password, user.password, function (err, result) {
                if (result === true) {
                    return callback(null, user);
                } else {
                    return callback();
                }
            })
        });
};

//hashing a password before saving it to the database
UserSchema.pre('save', function (next) {
    var user = this;
    if(user.__v === undefined) {
        bcrypt.hash(user.password, 10, function (err, hash) {
            if (err) {
                return next(err);
            }
            user.password = hash;
            user.passwordConf = hash;
            next();
        })
    }else {
        next();
    }
});


var User = mongoose.model('User', UserSchema);
module.exports = User;