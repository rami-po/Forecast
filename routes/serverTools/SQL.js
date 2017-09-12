/**
 * Created by Rami Khadder on 8/7/2017.
 */
var mysql = require('mysql');
var sqlSecret = require('./secrets/sql_secret.json');
var tools = require('./tools');

var sql_config = {
  host: sqlSecret.HOST,
  port: sqlSecret.PORT,
  user: sqlSecret.MYSQL_USER,
  password: sqlSecret.MYSQL_PASS,
  database: sqlSecret.DATABASE,
  multipleStatements: true
};

let connection;

function handleDisconnect() {
  connection = mysql.createConnection(sql_config);

  connection.connect(function (err) {              // The server is either down
    if (err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }                                     // to avoid a hot loop, and to allow our node script to
  });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
  connection.on('error', function (err) {
    console.log('db error', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });
}

handleDisconnect();

/*
 * GET METHODS
 */

exports.get = function (req) {
  connection.query('SELECT * FROM resourceManagement');
};

exports.getPeople = function (req, callback) {
  let employeeId = (req.params.id !== undefined ? req.params.id : 'a.user_id');
  const clientId = (req.query.clientid !== undefined ? req.query.clientid : 'p.client_id');
  const projectId = (req.query.projectid !== undefined ? req.query.projectid : 'a.project_id');
  const isContractor = (req.query.iscontractor ? req.query.iscontractor : 'e.is_contractor');
  const isActive = (req.query.active ? req.query.active : 'e.is_active');

  if (isNaN(employeeId) && employeeId !== 'a.user_id') {
    employeeId = '\'' + employeeId + '\'';
  }

  connection.query(
    'DROP TABLE IF EXISTS all_assignments;' +
    'DROP TABLE IF EXISTS all_employees;' +
    'CREATE TEMPORARY TABLE IF NOT EXISTS all_assignments SELECT * FROM (SELECT * FROM assignments UNION ALL SELECT * FROM assignments_fake) as x; ' +
    'CREATE TEMPORARY TABLE IF NOT EXISTS all_employees SELECT * FROM (SELECT * FROM employees UNION ALL SELECT * FROM employees_fake) as y; ' +
    'SELECT DISTINCT e.id, e.email, e.created_at, e.is_admin, e.first_name, e.last_name, e.is_contractor, ' +
    'e.telephone, e.is_active, e.default_hourly_rate, ' + 'e.department, e.updated_at, e.cost_rate, e.capacity ' +
    'FROM clients c ' +
    'LEFT OUTER JOIN projects p ON c.id = p.client_id ' +
    'LEFT OUTER JOIN all_assignments a ON p.id = a.project_id ' +
    'LEFT OUTER JOIN all_employees e ON e.id = a.user_id ' +
    'WHERE a.deactivated = 0 ' +
    'AND p.active = 1 ' +
    'AND e.is_active = ' + isActive + ' ' +
    'AND e.is_contractor = ' + isContractor + ' ' +
    'AND p.id = ' + projectId + ' ' +
    'AND c.id = ' + clientId + ' ' +
    'AND e.id = ' + employeeId + ' ' +
    'ORDER BY e.last_name ASC;', function (err, result) {
      console.log(result);
      if (result != null) {
        result = result[4];
      }
      callback(err, result);

    });

};

exports.getProjects = function (req, callback) {

  const id = (req.params.id !== undefined ? req.params.id : 'p.id');
  const clientId = (req.query.clientid !== undefined ? req.query.clientid : 'p.client_id');
  const active = (req.query.active !== undefined ? req.query.active : 'p.active');

  connection.query('SELECT * FROM projects p ' +
    'WHERE p.id = ' + id + ' ' +
    'AND p.client_id = ' + clientId + ' ' +
    'AND p.active = ' + active + ' ' +
    'ORDER BY p.name', function (err, result) {
    callback(err, result);
  });

};

exports.getClients = function (req, callback) {
  const id = (req.params.id !== undefined ? req.params.id : 'c.id');
  const active = (req.query.active !== undefined ? req.query.active : 'c.active');

  connection.query('SELECT * FROM clients c ' +
    'WHERE c.id = ' + id + ' ' +
    'AND c.active = ' + active + ' ' +
    'ORDER BY c.name', function (err, result) {
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
    'DROP TABLE IF EXISTS all_assignments;' +
    'DROP TABLE IF EXISTS all_employees;' +
    'CREATE TEMPORARY TABLE IF NOT EXISTS all_assignments SELECT * FROM (SELECT * FROM assignments UNION ALL SELECT * FROM assignments_fake) as x; ' +
    'CREATE TEMPORARY TABLE IF NOT EXISTS all_employees SELECT * FROM (SELECT * FROM employees UNION ALL SELECT * FROM employees_fake) as y; ' +
    'SELECT a.id as id, c.id AS client_id, c.name AS client_name, ' +
    'p.id AS project_id, p.name AS project_name, ' +
    'e.id AS employee_id, e.first_name, e.last_name ' +
    'FROM clients c ' +
    'LEFT OUTER JOIN projects p ON c.id = p.client_id ' +
    'LEFT OUTER JOIN all_assignments a ON p.id = a.project_id ' +
    'LEFT OUTER JOIN all_employees e ON e.id = a.user_id ' +
    'WHERE a.deactivated = 0 ' +
    'AND p.active = 1 ' +
    'AND e.is_active = 1 ' +
    'AND p.id = ' + projectId + ' ' +
    'AND c.id = ' + clientId + ' ' +
    'AND e.id = ' + employeeId + ' ' +
    'ORDER BY e.last_name, c.name, p.name ASC;', function (err, result) {
      if (result != null) {
        result = result[4];
      }
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
    'DROP TABLE IF EXISTS all_assignments;' +
    'DROP TABLE IF EXISTS all_employees;' +
    'CREATE TEMPORARY TABLE IF NOT EXISTS all_assignments SELECT * FROM (SELECT * FROM assignments UNION ALL SELECT * FROM assignments_fake) as x; ' +
    'CREATE TEMPORARY TABLE IF NOT EXISTS all_employees SELECT * FROM (SELECT * FROM employees UNION ALL SELECT * FROM employees_fake) as y; ' +
    'SELECT c.id AS client_id, ' +
    'p.id AS project_id, ' +
    'e.id AS employee_id, ' +
    'r.week_of, r.capacity ' +
    'FROM clients c ' +
    'LEFT OUTER JOIN projects p ON c.id = p.client_id ' +
    'LEFT OUTER JOIN all_assignments a ON a.project_id = p.id ' +
    'LEFT OUTER JOIN all_employees e ON e.id = a.user_id ' +
    'LEFT OUTER JOIN resourceManagement r ON  r.client_id = c.id AND r.project_id = p.id AND r.employee_id = e.id ' +
    'WHERE p.id = ' + projectId + ' ' +
    'AND c.id = ' + clientId + ' ' +
    'AND e.id = ' + employeeId + ' ' +
    'AND a.deactivated = 0 ' +
    'AND e.is_active = 1 ' +
    'AND p.active = 1 ' +
    'AND r.capacity <> \'\' ' +
    active +
    'ORDER BY r.box_number ASC;', function (err, result) {
      if (result != null) {
        result = result[4];
      }
      callback(err, result);
    });
};

exports.getMembers = function (req, callback) {
  connection.query("SELECT e.id, e.first_name, e.last_name, e.capacity, a.is_project_manager " +
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
  console.log(req.body.employeeId);
  connection.query('INSERT INTO resourceManagement (client_id, project_id, employee_id, week_of, ' +
    'capacity, box_number) VALUES (\'' + req.body.clientId + '\', \'' + req.body.projectId + '\', \'' +
    req.body.employeeId + '\', \'' + req.body.weekOf + '\', \'' +
    req.body.capacity + '\', \'' + req.body.boxNumber + '\') ' +
    'ON DUPLICATE KEY UPDATE capacity=\'' + req.body.capacity + '\', box_number=\'' + req.body.boxNumber + '\'',
    function (err, result) {
      callback(err, result);
    });
};

exports.updateCapacity = function (req, callback) {
  connection.query('UPDATE employees SET capacity = ' + req.body.capacity + ' WHERE id = ' + req.body.id, function (err, result) {
    callback(err, result);
  });
};

exports.addEmployee = function (employee, callback) {
  connection.query("INSERT INTO employees (id, email, created_at, is_admin, first_name, last_name, is_contractor, " +
    "telephone, is_active, default_hourly_rate, department, updated_at, cost_rate, capacity) " + "VALUES ('" +
    employee.id + "', '" + employee.email + "', '" + employee.created_at + "', '" + +employee.is_admin + "', '" +
    employee.first_name + "', '" + employee.last_name + "', '" + +employee.is_contractor + "', '" +
    employee.telephone + "', '" + +employee.is_active + "', '" + employee.default_hourly_rate + "', '" +
    employee.department + "', '" + employee.updated_at + "', '" + employee.cost_rate + "', '" +
    employee.weekly_capacity + "') ON DUPLICATE KEY UPDATE email='" + employee.email + "', created_at='" +
    employee.created_at + "', first_name='" + employee.first_name + "', last_name='" + employee.last_name +
    "', is_contractor='" + +employee.is_contractor + "', telephone='" + employee.telephone + "', is_active='" +
    +employee.is_active + "', default_hourly_rate='" + employee.default_hourly_rate + "', department='" +
    employee.department + "', updated_at='" + employee.updated_at + "', cost_rate='" + employee.cost_rate +
    "', capacity='" + employee.weekly_capacity + "'; " /*+

    "UPDATE all_employees SET id = '" + employee.id + "', first_name='" + employee.first_name + "', last_name='" +
    employee.last_name + "', is_contractor='" + employee.is_contractor + "', is_active='" + employee.is_active + "', " +
    "capacity='" + employee.capacity + "'"*/, function (err, result) {
    callback(err, result);
  });
};

exports.addFakeEmployee = function (employee, callback) {
  console.log("INSERT INTO employees_fake (id, first_name, last_name, is_contractor, is_active, capacity) " + "VALUES ('" +
    employee.id + "', '" + employee.first_name + "', '" + employee.last_name + "', '" + employee.is_contractor + "', '" +
    employee.is_active + "', '" + employee.capacity + "') " +
    "ON DUPLICATE KEY UPDATE first_name='" + employee.first_name + "', last_name='" +
    employee.last_name + "', is_contractor='" + employee.is_contractor + "', is_active='" + employee.is_active + "', " +
    "capacity='" + employee.capacity + "'; " +
    "UPDATE all_employees SET id = '" + employee.id + "', first_name='" + employee.first_name + "', last_name='" +
    employee.last_name + "', is_contractor='" + employee.is_contractor + "', is_active='" + employee.is_active + "', " +
    "capacity='" + employee.capacity + "'");

  connection.query("INSERT INTO employees_fake (id, first_name, last_name, is_contractor, is_active, capacity) " + "VALUES ('" +
    employee.id + "', '" + employee.first_name + "', '" + employee.last_name + "', '" + employee.is_contractor + "', '" +
    employee.is_active + "', '" + employee.capacity + "') " +
    "ON DUPLICATE KEY UPDATE first_name='" + employee.first_name + "', last_name='" +
    employee.last_name + "', is_contractor='" + employee.is_contractor + "', is_active='" + employee.is_active + "', " +
    "capacity='" + employee.capacity + "'; " /*+

    "UPDATE all_employees SET id = '" + employee.id + "', first_name='" + employee.first_name + "', last_name='" +
    employee.last_name + "', is_contractor='" + employee.is_contractor + "', is_active='" + employee.is_active + "', " +
    "capacity='" + employee.capacity + "'"*/, function (err, result) {
    callback(err, result);
  });
};

exports.addAssignment = function (assignment, callback) {
  connection.query("INSERT INTO assignments (id, user_id, project_id, is_project_manager, deactivated, hourly_rate, " +
    "budget, created_at, updated_at, estimate, expected_weekly_hours) VALUES ('" + assignment.id + "', '" +
    assignment.user_id + "', '" + assignment.project_id + "', '" + +assignment.is_project_manager + "', '" +
    +assignment.deactivated + "', '" + assignment.hourly_rate + "', '" + assignment.budget + "', '" +
    assignment.created_at + "', '" + assignment.updated_at + "', '" + assignment.estimate + "', '" +
    assignment.expected_weekly_hours + "') ON DUPLICATE KEY UPDATE user_id='" + assignment.user_id + "', project_id='" +
    assignment.project_id + "', is_project_manager='" + +assignment.is_project_manager + "', deactivated='" +
    +assignment.deactivated + "', hourly_rate='" + assignment.default_hourly_rate + "', budget='" + assignment.budget +
    "', created_at='" + assignment.created_at + "', updated_at='" + assignment.updated_at + "', estimate='" +
    assignment.estimate + "', expected_weekly_hours='" + assignment.expected_weekly_hours + "'; " /*+

    "UPDATE all_assignments SET id = '" + assignment.id + "', user_id='" + assignment.user_id + "', project_id='" +
    assignment.project_id + "', is_project_manager='" + +assignment.is_project_manager + "', deactivated='" +
    +assignment.deactivated + "', hourly_rate='" + assignment.default_hourly_rate + "', budget='" + assignment.budget +
    "', created_at='" + assignment.created_at + "', updated_at='" + assignment.updated_at + "', estimate='" +
    assignment.estimate + "', expected_weekly_hours='" + assignment.expected_weekly_hours + "'"*/, function (err, result) {
    callback(err, result);
  });
};

exports.addFakeAssignment = function (assignment, callback) {
  connection.query("INSERT INTO assignments_fake (id, user_id, project_id, deactivated) VALUES ('" +
    assignment.id + "', '" + assignment.user_id + "', '" + assignment.project_id + "', '" + assignment.deactivated + "') " +
    "ON DUPLICATE KEY UPDATE user_id='" +
    assignment.user_id + "', project_id='" + assignment.project_id + "', deactivated='" + assignment.deactivated + "'; " /*+

    "UPDATE all_assignments SET id = '" + assignment.id + "', user_id='" +
    assignment.user_id + "', project_id='" + assignment.project_id + "', deactivated='" + assignment.deactivated + "'"*/,
    function (err, result) {
      callback(err, result);
    });
};

/*
 * DELETE METHODS
 */

exports.deleteAssignment = function (req, callback) {
  connection.query('UPDATE assignments SET deactivated = 1 WHERE id = ' + req.params.assignment_id + ' AND project_id = ' + req.params.project_id, function (err, result) {
    callback(err, result);
  });
};
