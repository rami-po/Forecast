/**
 * Created by Rami Khadder on 8/7/2017.
 */
var mysql = require('mysql');
var sqlSecret = require('./secrets/sql_secret.json');

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
    'SELECT c.id AS client_id, c.active AS client_active, c.name AS client_name, ' +
      'p.id AS project_id, p.name AS project_name, p.active AS project_active, ' +
      'a.id AS assignment_id, a.deactivated AS assignment_deactivated, ' +
      'e.id AS employee_id, e.first_name, e.last_name ' +
    'FROM clients c ' +
    'LEFT OUTER JOIN projects p ON c.id = p.client_id ' +
    'LEFT OUTER JOIN assignments a ON a.project_id = p.id ' +
    'LEFT OUTER JOIN employees e ON e.id = a.user_id ' +
    'WHERE a.deactivated = 0 ' +
    'AND p.active = 1', function (err, result) {
      callback(err, result);
  });
};

/*
 * POST METHODS
 */

exports.createEntry = function (req) {
    connection.query('INSERT INTO resourceManagement (client_id, project_id, employee_id, week_of, ' +
        'capacity) VALUES (\'' + req.body.client_id + '\', \'' + req.body.project_id + '\', \'' +
        req.body.employee_id + '\', \'' + req.body.week_of + '\', \'' +
        req.body.capacity + '\') ' +
        '\'ON DUPLICATE KEY UPDATE week_of=\'' + req.body.week_of + '\', capacity=\'' + req.body.capacity + '\'');
};
