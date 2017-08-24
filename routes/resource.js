/**
 * Created by Rami Khadder on 8/7/2017.
 */
var express = require('express');
var router = express.Router();

var tools = require('./serverTools/tools');
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

/*
 * MEMBER ROUTES
 */

router.get('/member/:id', function (req, res, next) {
  SQL.getMembers(req, function (err, result) {
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
  })
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

router.get('/client/:id*', function (req, res, next) {
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

router.post('/entry', function(req, res, next) {
  SQL.createEntry(req, function (err, result) {
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
  })
});

/*
 * CAPACITY ROUTES
 */

router.get('/data', function (req, res, next) {
  SQL.getData(req, function (err, result) {
    if (err){
      return res.status(500).json({
        message: 'Error!',
        err: err
      });
    } else {
      var totalCapacities = {};
      for (var i = 0; i < result.length; i++) {
        tools.convertDate(result[i].week_of, function (date) {
          if (totalCapacities[date] == null) {
            totalCapacities[date] = 0;
          }
          totalCapacities[date] += result[i].capacity;

        });
      }

      var JSONArray = [];
      for (week in totalCapacities) {
        var data = {
          week: week,
          capacity: totalCapacities[week]
        };
        JSONArray.push(data);
      }

      JSONArray.sort(function(a, b) {
        return new Date(a.week) - new Date(b.week);
      });

      return res.status(200).json({
        message: 'Success!',
        result: result,
        totalCapacities: JSONArray
      });
    }
  });
});

/*
 * TIME ROUTES
 */

router.get('/time', function (req, res, next) {
  SQL.getTimeEntries(req, function (err, result) {
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

router.get('/time/:id', function (req, res, next) {
  SQL.getTimeEntries(req, function (err, result) {
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

module.exports = router;
