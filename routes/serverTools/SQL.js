/**
 * Created by Rami Khadder on 8/7/2017.
 */
var mysql = require('mysql');
var sqlSecret = require('./secrets/sql_secret.json');
var tools = require('./tools');

var connection = mysql.createConnection({
  host: sqlSecret.HOST,
  port: sqlSecret.PORT,
  user: sqlSecret.MYSQL_USER,
  password: sqlSecret.MYSQL_PASS,
  database: sqlSecret.DATABASE
});

/*
 * GET METHODS
 */

exports.get = function(req) {
  connection.query('SELECT * FROM resourceManagement');
};

exports.getPeople = function (req, callback) {
  if (req.params.id != null && req.params.length > 0){
    connection.query('SELECT * FROM employees WHERE employee_id=' + req.params.id);
  } else {
    connection.query('SELECT * FROM employees WHERE is_active=1', function (err, result) {
      callback(err, result)
    });
  }
};

exports.getProjects = function (req, callback) {
  if (req.params != null && req.params.length > 0){
    var query = 'SELECT * FROM projects WHERE project_id=\'' + req.params.id + '\'';
    if (req.query != null && req.query.length > 0) {
      if (req.query.person != null) {
        query += ' AND person_id=\'' + req.query.person.id + '\'';
      }

      if (req.query.updated_since != null) {
        query += ' AND week_of > \'' + req.query.updated_since + '\'';
      }

      if (JSON.stringify(req.route.path).indexOf('entries') > -1 && req.query.from != null && req.query.to != null) {
        query += 'AND week_of BETWEEN \'' + req.query.from + '\' AND \'' + req.query.to + '\'';
      }
    }
    connection.query(query, function (err, result) {
      callback(err, result);
    })
  } else {
    connection.query('SELECT * FROM projects WHERE active=1', function (err, result) {
      callback(err, result);
    });
  }
};

exports.getClients = function (req, callback) {
  if (req.params != null && req.params.length > 0) {
  } else {
    connection.query('SELECT * FROM clients WHERE active=1', function (err, result) {
      callback(err, result);
    });
  }
};

exports.getAssignments = function(req, callback) {
  if (req.params != null && req.params.length > 0) {
  } else {
    connection.query('SELECT * FROM assignments WHERE deactivated=0', function (err, result) {
      callback(err, result);
    });
  }
};

exports.getDates = function (req) {
  if (req.params.id != null && req.params.length > 0){
    var query = 'SELECT * FROM resourceManagement WHERE week_of=\'' + req.params.id + '\'';
    if (req.query.person != null){
      query += ' AND person_id=\'' + req.query.person.id + '\'';
    }
  } else {
    connection.query('SELECT week_of FROM resourceManagement');
  }
};

exports.getEntries = function(req, callback) {
  connection.query(
    'SELECT c.id AS client_id, c.name AS client_name, ' +
    'p.id AS project_id, p.name AS project_name, ' +
    'e.id AS employee_id, e.first_name, e.last_name ' +
    'FROM clients c ' +
    'LEFT OUTER JOIN projects p ON c.id = p.client_id ' +
    'LEFT OUTER JOIN assignments a ON a.project_id = p.id ' +
    'LEFT OUTER JOIN employees e ON e.id = a.user_id ' +
    'WHERE a.deactivated = 0 ' +
    'AND p.active = 1 ' +
    'ORDER BY p.id, e.id, c.id ASC', function (err, result) {
      callback(err, result);
    });
};

exports.getCapacities = function(req, callback) {

  var monday;
  tools.getMonday(function (date) {
    tools.convertDate(date, function(convertedDate) {
      monday = convertedDate;
    });
  });

  connection.query(
    'SELECT c.id AS client_id, ' +
    'p.id AS project_id, ' +
    'e.id AS employee_id, ' +
    'r.week_of, r.capacity ' +
    'FROM clients c ' +
    'LEFT OUTER JOIN projects p ON c.id = p.client_id ' +
    'LEFT OUTER JOIN assignments a ON a.project_id = p.id ' +
    'LEFT OUTER JOIN employees e ON e.id = a.user_id ' +
    'LEFT OUTER JOIN resourceManagement r ON r.client_id = c.id AND r.project_id = p.id AND r.employee_id = e.id ' +
    'WHERE a.deactivated = 0 ' +
    'AND p.active = 1 ' +
    'AND r.capacity IS NOT NULL ' +
    'AND r.week_of >= \'' + monday + '\' ' +
    'ORDER BY p.id, e.id, c.id, r.week_of ASC', function (err, result) {
      callback(err, result);
    });
};

/*
 * POST METHODS
 */

exports.createEntry = function (req, callback) {
  connection.query('INSERT INTO resourceManagement (client_id, project_id, employee_id, week_of, ' +
    'capacity) VALUES (\'' + req.body.clientId + '\', \'' + req.body.projectId + '\', \'' +
    req.body.employeeId + '\', \'' + req.body.weekOf + '\', \'' +
    req.body.capacity + '\') ' +
    'ON DUPLICATE KEY UPDATE capacity=\'' + req.body.capacity + '\'', function (err, result) {
    callback(err, result);
  });
};
