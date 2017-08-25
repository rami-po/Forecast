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

exports.get = function (req) {
  connection.query('SELECT * FROM resourceManagement');
};

exports.getPeople = function (req, callback) {
  const id = (req.params.id !== undefined ? req.params.id : 'e.id');
  const isContractor = (req.query.iscontractor ? req.query.iscontractor : 'e.is_contractor');
  const isActive = (req.query.active ? req.query.active : 'e.is_active');

  connection.query('SELECT * FROM employees e ' +
    'WHERE e.id = ' + id + ' ' +
    'AND e.is_contractor = ' + isContractor + ' ' +
    'AND e.is_active = ' + isActive, function (err, result) {
    callback(err, result);
  })
};

exports.getProjects = function (req, callback) {

  const id = (req.params.id !== undefined ? req.params.id : 'p.id');
  const clientId = (req.query.clientid !== undefined ? req.query.clientid : 'p.client_id');
  const active = (req.query.active !== undefined ? req.query.active : 'p.active');

  connection.query('SELECT * FROM projects p ' +
    'WHERE p.id = ' + id + ' ' +
    'AND p.client_id = ' + clientId + ' ' +
    'AND p.active = ' + active, function (err, result) {
    callback(err, result);
  });

};

exports.getClients = function (req, callback) {
  const id = (req.params.id !== undefined ? req.params.id : 'c.id');
  const active = (req.query.active !== undefined ? req.query.active : 'c.active');

  connection.query('SELECT * FROM clients c ' +
    'WHERE c.id = ' + id + ' ' +
    'AND c.active = ' + active, function (err, result) {
    callback(err, result);
  });

};

exports.getAssignments = function (req, callback) {
  if (req.params != null && req.params.length > 0) {
  } else {
    connection.query('SELECT * FROM assignments WHERE deactivated=0', function (err, result) {
      callback(err, result);
    });
  }
};

exports.getDates = function (req) {
  if (req.params.id != null && req.params.length > 0) {
    var query = 'SELECT * FROM resourceManagement WHERE week_of=\'' + req.params.id + '\'';
    if (req.query.person != null) {
      query += ' AND person_id=\'' + req.query.person.id + '\'';
    }
  } else {
    connection.query('SELECT week_of FROM resourceManagement');
  }
};

exports.getEntries = function (req, callback) {
  const clientId = (req.query.clientid !== undefined ? req.query.clientid : 'p.client_id');
  const employeeId = (req.query.employeeid !== undefined ? req.query.employeeid : 'a.user_id');
  const projectId = (req.query.projectid !== undefined ? req.query.projectid : 'a.project_id');

  connection.query(
    'SELECT c.id AS client_id, c.name AS client_name, ' +
    'p.id AS project_id, p.name AS project_name, ' +
    'e.id AS employee_id, e.first_name, e.last_name ' +
    'FROM clients c ' +
    'LEFT OUTER JOIN projects p ON c.id = p.client_id ' +
    'LEFT OUTER JOIN assignments a ON p.id = a.project_id ' +
    'LEFT OUTER JOIN employees e ON e.id = a.user_id ' +
    'WHERE a.deactivated = 0 ' +
    'AND p.active = 1 ' +
    'AND p.id = ' + projectId + ' ' +
    'AND c.id = ' + clientId + ' ' +
    'AND e.id = ' + employeeId + ' ' +
    'ORDER BY p.id, e.id, c.id ASC', function (err, result) {
      callback(err, result);
    });
};

exports.getData = function (req, callback) {
  const projectId = (req.query.projectid !== undefined ? req.query.projectid : 'p.id');
  const employeeId = (req.query.employeeid !== undefined ? req.query.employeeid : 'e.id');
  const clientId = (req.query.clientid !== undefined ? req.query.clientid : 'c.id');

  var monday;
  tools.getMonday(function (date) {
    tools.convertDate(date, function (convertedDate) {
      monday = convertedDate;
    });
  });

  const active = (req.query.active === '1' ? 'AND r.week_of >= \'' + monday + '\' ' : '');

  connection.query(
    'SELECT c.id AS client_id, ' +
    'p.id AS project_id, ' +
    'e.id AS employee_id, ' +
    'r.week_of, r.capacity ' +
    'FROM clients c ' +
    'LEFT OUTER JOIN projects p ON c.id = p.client_id ' +
    'LEFT OUTER JOIN assignments a ON a.project_id = p.id ' +
    'LEFT OUTER JOIN employees e ON e.id = a.user_id ' +
    'LEFT OUTER JOIN resourceManagement r ON  r.client_id = c.id AND r.project_id = p.id AND r.employee_id = e.id ' +
    'WHERE a.deactivated = 0 ' +
    'AND p.id = ' + projectId + ' ' +
    'AND c.id = ' + clientId + ' ' +
    'AND e.id = ' + employeeId + ' ' +
    'AND e.is_active = 1 ' +
    'AND p.active = 1 ' +
    'AND r.capacity IS NOT NULL ' +
    active +
    'ORDER BY p.id, e.id, c.id, r.week_of ASC', function (err, result) {
      console.log(result);
      callback(err, result);
    });
};

exports.getMembers = function (req, callback) {
  connection.query("SELECT e.id, e.first_name, e.last_name, a.is_project_manager " +
    "FROM employees e " +
    "RIGHT OUTER JOIN assignments a ON a.project_id = " + req.params.id + " AND e.id = a.user_id " +
    "WHERE a.deactivated = 0 " +
    "AND e.is_active = 1", function (err, result) {
    callback(err, result);
  })
};

exports.getTimeEntries = function (req, callback) {
  const id = (req.params.id !== undefined ? req.params.id : 't.id');
  const projectId = (req.query.projectid !== undefined ? req.query.projectid : 't.project_id');
  const userId = (req.query.userid !== undefined ? req.query.userid : 't.user_id');

  connection.query('SELECT * FROM timeEntries t ' +
    'WHERE t.id = ' + id + ' ' +
    'AND t.project_id = ' + projectId + ' ' +
    'AND t.user_id = ' + userId + ' ' +
    'ORDER BY t.spent_at ASC', function (err, result) {
    callback(err, result);
  })
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
