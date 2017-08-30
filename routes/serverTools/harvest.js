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