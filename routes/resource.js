/**
 * Created by Rami Khadder on 8/7/2017.
 */
var express = require('express');
var router = express.Router();

var SQL = require('./serverTools/SQL');

/*
 * PERSON ROUTES
 */

router.get('/person', function (req, res, next) {
  SQL.getPeople(req, function (err, result) {
    if (err){
      return res.status(500).json({
        message: 'Error!',
        err: err
      });
    } else {
      return res.status(200).json({
        message: 'Success!',
        result: result
      });
    }
  });
});

router.get('/person/:id', function (req, res, next) {
    //console.log(req);
    console.log(req.params.id);
});

/*
 * PROJECT ROUTES
 */

router.get('/project', function (req, res, next) {
  SQL.getProjects(req, function (err, result) {
    if (err){
      return res.status(500).json({
        message: 'Error!',
        err: err
      });
    } else {
      return res.status(200).json({
        message: 'Success!',
        result: result
      });
    }
  });
});

router.get('/project/:id*', function (req, res, next) {
    console.log(req.params.id + ' ' + req.query.person);
    console.log(req.query);
});

router.get('/project/:id/entries*', function (req, res, next) {
    console.log(req.params.id + ' ' + req.query.person);
    console.log(req.query);
});

/*
 * CLIENT ROUTES
 */

router.get('/client', function (req, res, next) {
  SQL.getClients(req, function (err, result) {
    if (err){
      return res.status(500).json({
        message: 'Error!',
        err: err
      });
    } else {
      return res.status(200).json({
        message: 'Success!',
        result: result
      });
    }
  });
});

/*
 * ASSIGNMENT ROUTES
 */

router.get('/assignment', function (req, res, next) {
  SQL.getAssignments(req, function (err, result) {
    if (err){
      return res.status(500).json({
        message: 'Error!',
        err: err
      });
    } else {
      return res.status(200).json({
        message: 'Success!',
        result: result
      });
    }
  });
});

/*
 * WEEK ROUTES
 */

router.get('/week/:date*', function (req, res, next) {
    console.log(req.params.id + ' ' + req.query.person);
});

module.exports = router;

/*
 * ENTRY ROUTES
 */

router.get('/entry', function (req, res, next) {
  SQL.getEntries(req, function (err, result) {
    if (err){
      return res.status(500).json({
        message: 'Error!',
        err: err
      });
    } else {
      return res.status(200).json({
        message: 'Success!',
        result: result
      });
    }
  });
});
