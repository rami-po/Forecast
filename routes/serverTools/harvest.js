/**
 * Created by Rami Khadder on 7/24/2017.
 */
var server = require('./server');
var secret = require('./secrets/harvest_secret.json');

var harvestHeaders = {
  'Content-Type' : 'application/json',
  'Accept' : 'application/json',
  'Authorization': 'Basic ' + new Buffer(secret.user + ":" + secret.password).toString('base64')
};

var harvestOptions = {
  host: 'productops.harvestapp.com',
  port: 443,
  path: '',
  method: 'POST',
  headers: harvestHeaders
};

exports.updateCapacity = function (req, callback) {
  harvestOptions.path = '/people/' + req.body.id;
  harvestOptions.method = 'PUT';
  var body = {
    "user": {
      "weekly_capacity": req.body.capacity
    }
  };
  server.makeHTTPCall(harvestOptions, JSON.stringify(body), function (status, result) {
    callback(status, result);
  })

};

exports.removeEmployeeFromProject = function (req, callback) {
  harvestOptions.path = '/projects/' + req.params.project_id + '/user_assignments/' + req.params.assignment_id;
  harvestOptions.method = 'DELETE';
  server.makeHTTPCall(harvestOptions, null, function (status, result) {
    callback(status, result);
  });
};

exports.addEmployeeToProject = function (req, callback) {
  harvestOptions.path = '/projects/' + req.params.project_id + '/user_assignments';
  harvestOptions.method = 'POST';
  server.makeHTTPCall(harvestOptions, JSON.stringify(req.body), function (status, result) {
    callback(status, result);
  });
};

exports.getAssignment = function (req, callback) {
  harvestOptions.path = '/projects/' + req.params.project_id + '/user_assignments/' + req.params.assignment_id;
  harvestOptions.method = 'GET';
  server.makeHTTPCall(harvestOptions, null, function (status, result) {
    callback(status, result);
  });
};
