var express = require('express');
var projectRouter = express.Router();
var Project = require('../models/Project.js');
var User = require('../models/User.js');

/* GET ALL projects */
projectRouter.get('/projects', function(req, res, next) {
    Project.find().populate(['tasks','members', 'comments', 'creator']).exec(function (err, projects) {
        if (err) return next(err);
        return res.json(projects);
    });
});

/* GET only id and title of project BY ID */
projectRouter.get('/projects/:id', function(req, res, next) {
    Project.findById(req.params.id).populate(['tasks','members', 'comments', 'creator']).exec(function (err, project) {
        if (err) return next(err);
        res.json(project);
    });
});

/* GET SINGLE project BY ID */
projectRouter.get('/min-projects/:id', function(req, res, next) {
    Project.findById(req.params.id, {title: 1}).exec(function (err, project) {
        if (err) return next(err);
        res.json(project);
    });
});

/* SAVE project */
projectRouter.post('/projects', function(req, res, next) {
    req.body.creator = req.headers.user_id;
    req.body.members = [req.headers.user_id];
    Project.create(req.body, function (err, project) {
        if (err) return next(err);
        res.json(project);
    });
});

/* UPDATE project */
projectRouter.put('/projects/:id', function(req, res, next) {
    Project.findByIdAndUpdate(req.params.id, req.body, function (err, project) {
        if (err) return next(err);
        res.json(project);
    });
});

/* DELETE project */
projectRouter.delete('/projects/:id', function(req, res, next) {
    Project.findByIdAndRemove(req.params.id, req.body, function (err, project) {
        if (err) return next(err);
        res.json(project);
    });
});

/* Add member to project */
projectRouter.post('/add-member', function(req, res, next) {
    var member_id = req.body.member_id;
    var project_id = req.body.project_id;
    Project.findById(project_id, function (err, project) {
        if (project) {
            if (project.members) {
                if (project.members.indexOf(member_id) === -1)
                    project.members.push(member_id);
            }
            else {
                project.members = [];
                project.members.push(member_id);
            }
            project.save();
        }
    });
    User.findById(member_id, function (err, user) {
        if (user) {
            if (user.projects) {
                if (user.projects.indexOf(project_id) === -1) {
                    user.projects.push(project_id);
                }
            }
            else {
                user.projects = [];
                user.projects.push(project_id);
            }
            user.save();
            return res.json(user);
        }
    });

});

module.exports = projectRouter;