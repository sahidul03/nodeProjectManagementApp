var express = require('express');
var taskRouter = express.Router();
var Task = require('../models/Task.js');
/* GET ALL tasks */
taskRouter.get('/tasks', function (req, res, next) {
    Task.find().populate(['parentTask', 'subTasks', 'assignee', 'project', 'members', 'comments', 'creator']).exec(function (err, tasks) {
        if (err) return next(err);
        return res.json(tasks);
    });
});

/* GET SINGLE task BY ID */
taskRouter.get('/tasks/:id', function (req, res, next) {
    Task.findById(req.params.id).populate(['parentTask', 'subTasks', 'assignee', 'project', 'members', 'comments', 'creator']).exec(function (err, task) {
        if (err) return next(err);
        res.json(task);
    });
});

/* SAVE task */
taskRouter.post('/tasks', function (req, res, next) {
    req.body.creator = req.headers.user_id;
    Task.create(req.body, function (err, task) {
        if (err) return next(err);
        if(task.parentTask){
            Task.findById(task.parentTask, function (err, parent_task) {
                if (err) return next(err);
                console.log('parent_task', parent_task);
                if(parent_task.subTasks){
                    if(parent_task.subTasks.indexOf(task._id) === -1)
                        parent_task.subTasks.push(task._id);
                }
                else {
                    parent_task.subTasks = [];
                    parent_task.subTasks.push(task._id);
                }
                parent_task.save();
            });
        }
        res.json(task);
    });
});

/* UPDATE task */
taskRouter.put('/tasks/:id', function (req, res, next) {
    Task.findByIdAndUpdate(req.params.id, req.body, function (err, task) {
        if (err) return next(err);
        res.json(task);
    });
});

/* DELETE task */
taskRouter.delete('/tasks/:id', function (req, res, next) {
    Task.findByIdAndRemove(req.params.id, req.body, function (err, task) {
        if (err) return next(err);
        res.json(task);
    });
});

module.exports = taskRouter;