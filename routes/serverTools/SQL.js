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
  let employeeId = (req.params.id ? req.params.id : 'a.user_id');
  const clientId = (req.query.clientid !== undefined ? req.query.clientid : 'p.client_id');
  const projectId = (req.query.projectid !== undefined ? req.query.projectid : 'a.project_id');
  const isContractor = (req.query.iscontractor ? req.query.iscontractor : 'e.is_contractor');
  const isActive = (req.query.active ? req.query.active : 'e.is_active');


  if (isNaN(employeeId) && employeeId !== 'a.user_id') {
    employeeId = '\'' + employeeId + '\'';
  }

  let getFakes =
    'DROP TABLE IF EXISTS all_assignments;' +
    'DROP TABLE IF EXISTS all_employees;' +
    'CREATE TEMPORARY TABLE IF NOT EXISTS all_assignments SELECT * FROM (SELECT * FROM assignments UNION ALL SELECT * FROM assignments_fake) as x; ' +
    'CREATE TEMPORARY TABLE IF NOT EXISTS all_employees SELECT * FROM (SELECT * FROM employees UNION ALL SELECT * FROM employees_fake) as y; ';

  let assignments = 'all_assignments';
  let employees = 'all_employees';

  if (req.query.real === '1') {
    getFakes = '';
    assignments = 'assignments';
    employees = 'employees';
  }

  connection.query(
    getFakes +
    'SELECT DISTINCT e.id, e.email, e.created_at, e.is_admin, e.first_name, e.last_name, e.is_contractor, ' +
    'e.telephone, e.is_active, e.default_hourly_rate, e.department, e.updated_at, e.cost_rate, e.capacity ' +
    'FROM clients c ' +
    'LEFT OUTER JOIN projects p ON c.id = p.client_id ' +
    'LEFT OUTER JOIN ' + assignments + ' a ON p.id = a.project_id ' +
    'LEFT OUTER JOIN ' + employees + ' e ON e.id = a.user_id ' +
    // 'LEFT OUTER JOIN tiers t ON t.id = e.tier_id ' +
    'WHERE a.deactivated = 0 ' +
    'AND p.active = 1 ' +
    'AND e.is_active = ' + isActive + ' ' +
    'AND e.is_contractor = ' + isContractor + ' ' +
    'AND p.id = ' + projectId + ' ' +
    'AND c.id = ' + clientId + ' ' +
    'AND e.id = ' + employeeId + ' ' +
    'ORDER BY CASE last_name <> \'\' WHEN TRUE THEN e.last_name ELSE e.first_name END, e.id ASC;', function (err, result) {
      callback(err, result[result.length-1]);
    });

};

exports.getProjects = function (req, callback) {

  const projectId = (req.params.id !== undefined ? req.params.id : 'a.project_id');
  let employeeId = (req.query.employeeid !== undefined ? req.query.employeeid : 'a.user_id');
  const clientId = (req.query.clientid !== undefined ? req.query.clientid : 'p.client_id');
  const active = (req.query.active !== undefined ? req.query.active : 'p.active');

  let getFakes =
    'DROP TABLE IF EXISTS all_assignments;' +
    'DROP TABLE IF EXISTS all_employees;' +
    'CREATE TEMPORARY TABLE IF NOT EXISTS all_assignments SELECT * FROM (SELECT * FROM assignments UNION ALL SELECT * FROM assignments_fake) as x; ' +
    'CREATE TEMPORARY TABLE IF NOT EXISTS all_employees SELECT * FROM (SELECT * FROM employees UNION ALL SELECT * FROM employees_fake) as y; ';

  let assignments = 'all_assignments';
  let employees = 'all_employees';

  if (req.query.real === '1') {
    getFakes = '';
    assignments = 'assignments';
    employees = 'employees';
  }

  connection.query(
    getFakes +
    'SELECT DISTINCT p.id, p.client_id, p.active, p.name, p.code, p.cost_budget, p.billable, ' +
    'p.budget_by, p.state, p.created_date, p.last_checked_date, p.weekly_hour_budget ' +
    'FROM clients c ' +
    'LEFT OUTER JOIN projects p ON c.id = p.client_id ' +
    'LEFT OUTER JOIN ' + assignments + ' a ON p.id = a.project_id ' +
    'LEFT OUTER JOIN ' + employees + ' e ON e.id = a.user_id ' +
    'WHERE a.deactivated = 0 ' +
    'AND p.active = ' + active + ' ' +
    'AND e.is_active = 1 ' +
    'AND p.id = ' + projectId + ' ' +
    'AND c.id = ' + clientId + ' ' +
    'AND e.id = ' + employeeId + ' ' +
    'ORDER BY p.name', function (err, result) {
      callback(err, result[result.length-1]);
    });
};

exports.getProjects2 = function (req, callback) {

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

  let id = (req.params.id !== undefined ? req.params.id : 'id');
  const employeeId = (req.query.employeeid !== undefined ? req.query.employeeid : 'user_id');
  const projectId = (req.query.projectid !== undefined ? req.query.projectid : 'project_id');
  const deactivated = (req.query.deactivated ? req.query.deactivated : 'deactivated');

  if (isNaN(id) && id !== 'id') {
    id = '\'' + id + '\'';
  }

  connection.query(
    'DROP TABLE IF EXISTS all_assignments;' +
    'CREATE TEMPORARY TABLE IF NOT EXISTS all_assignments SELECT * FROM (SELECT * FROM assignments UNION ALL SELECT * FROM assignments_fake) as x; ' +
    'SELECT * FROM all_assignments ' +
    'WHERE deactivated = ' + deactivated + ' ' +
    'AND id = ' + id + ' ' +
    'AND project_id = ' + projectId + ' ' +
    'AND user_id = ' + employeeId, function (err, result) {
      if (result != null) {
        result = result[2];
      }
      callback(err, result);
    });
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
    'ORDER BY CASE last_name <> \'\' WHEN TRUE THEN e.last_name ELSE e.first_name END, e.id, c.id, p.id ASC;', function (err, result) {
      callback(err, result[result.length-1]);
    });
};

exports.getData = function (req, callback) {
  const projectId = (req.query.projectid !== undefined ? req.query.projectid : 'r.project_id');
  const employeeId = (req.query.employeeid !== undefined ? req.query.employeeid : 'r.employee_id');
  const clientId = (req.query.clientid !== undefined ? req.query.clientid : 'r.client_id');
  let cost = '';
  let costJoin = '';
  if (req.query.cost === '1') {
    cost = ', t.cost';
    costJoin =
      'LEFT OUTER JOIN employees e ON r.employee_id = e.id ' +
      'LEFT OUTER JOIN tiers t on t.id = e.tier_id ';
  }

  let monday;
  tools.getMonday(function (date) {
    tools.convertDate(date, function (convertedDate) {
      monday = convertedDate;
    });
  });

  const active = (req.query.active === '1' ? 'AND r.week_of >= \'' + monday + '\' ' : '');

  connection.query(
    'SELECT r.client_id, r.project_id, r.employee_id, r.week_of, r.capacity, r.box_number' + cost + ' FROM resourceManagement r ' +
    costJoin +
    'WHERE r.project_id = ' + projectId + ' ' +
    'AND r.client_id = ' + clientId + ' ' +
    'AND r.employee_id = ' + employeeId + ' ' +
    'AND r.capacity <> \'\' ' +
    active +
    'ORDER BY r.box_number, r.employee_id, r.client_id, r.project_id ASC;', function (err, result) {
      callback(err, result);
    }
  );

  // connection.query(
  //   'DROP TABLE IF EXISTS all_assignments;' +
  //   'DROP TABLE IF EXISTS all_employees;' +
  //   'CREATE TEMPORARY TABLE IF NOT EXISTS all_assignments SELECT * FROM (SELECT * FROM assignments UNION ALL SELECT * FROM assignments_fake) as x; ' +
  //   'CREATE TEMPORARY TABLE IF NOT EXISTS all_employees SELECT * FROM (SELECT * FROM employees UNION ALL SELECT * FROM employees_fake) as y; ' +
  //   'SELECT c.id AS client_id, ' +
  //   'p.id AS project_id, ' +
  //   'e.id AS employee_id, ' +
  //   'r.week_of, r.capacity ' +
  //   'FROM clients c ' +
  //   'LEFT OUTER JOIN projects p ON c.id = p.client_id ' +
  //   'LEFT OUTER JOIN all_assignments a ON a.project_id = p.id ' +
  //   'LEFT OUTER JOIN all_employees e ON e.id = a.user_id ' +
  //   'LEFT OUTER JOIN resourceManagement r ON  r.client_id = c.id AND r.project_id = p.id AND r.employee_id = e.id ' +
  //   'WHERE p.id = ' + projectId + ' ' +
  //   'AND c.id = ' + clientId + ' ' +
  //   'AND e.id = ' + employeeId + ' ' +
  //   'AND a.deactivated = 0 ' +
  //   'AND e.is_active = 1 ' +
  //   'AND p.active = 1 ' +
  //   'AND r.capacity <> \'\' ' +
  //   active +
  //   'ORDER BY r.box_number ASC;', function (err, result) {
  //     if (result != null) {
  //       result = result[4];
  //     }
  //     callback(err, result);
  //   });
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
  let userId = (req.query.userid !== undefined ? req.query.userid : 't.user_id');

  if (isNaN(userId) && userId !== 't.user_id') {
    userId = '\'' + userId + '\'';
  }

  connection.query('SELECT t.id, t.user_id, t.project_id, t.task_id, t.notes, t.spent_at, t.hours, ti.cost, e.capacity FROM timeEntries t ' +
    'LEFT OUTER JOIN employees e ON t.user_id = e.id ' +
    'LEFT OUTER JOIN tiers ti on ti.id = e.tier_id ' +
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
 * PUT METHODS
 */

exports.updateCapacity = function (req, callback) {
  connection.query('UPDATE employees SET capacity = ' + req.body.capacity + ' WHERE id = ' + req.body.id, function (err, result) {
    callback(err, result);
  });
};

exports.updateData = function (req, callback) {
  if (isNaN(req.body.employee_id)) {
    req.body.employee_id = '\'' + req.body.employee_id + '\'';
  }

  if (isNaN(req.body.fake_employee_id)) {
    req.body.fake_employee_id = '\'' + req.body.fake_employee_id + '\'';
  }

  connection.query('DELETE FROM resourceManagement WHERE employee_id = ' + req.body.employee_id +
    ' AND project_id = ' + req.body.project_id + ';UPDATE resourceManagement SET employee_id = ' + req.body.employee_id +
    ' WHERE employee_id = ' + req.body.fake_employee_id + ' AND project_id = ' + req.body.project_id,
    function (err, result) {
      callback(err, result);
    })
};

exports.deactivateAssignment = function (req, callback) {
  connection.query('UPDATE assignments SET deactivated = 1 WHERE id = ' + req.params.assignment_id + ' AND project_id = ' + req.params.project_id, function (err, result) {
    callback(err, result);
  });
};

/*
 * DELETE METHODS
 */

exports.deleteFakeAssignment = function (req, callback) {
  if (isNaN(req.params.id)) {
    req.params.id = '\'' + req.params.id + '\'';
  }

  connection.query('DELETE FROM assignments_fake WHERE id = ' + req.params.id, function (err, result) {
    callback(err, result);
  });
};

exports.deleteFakeEmployee = function (req, callback) {
  if (isNaN(req.params.id)) {
    req.params.id = '\'' + req.params.id + '\'';
  }

  connection.query('DELETE FROM employees_fake WHERE id = ' + req.params.id, function (err, result) {
    callback(err, result);
  });
};

exports.custom = function (req, callback) {
  connection.query('ALTER TABLE tiers ALTER COLUMN cost varchar(255) COLLATE utf8_general_ci', function (err, result) {
    callback(err, result);
  });
};
// CREATE TABLE tiers (id varchar(255), cost int(11));
