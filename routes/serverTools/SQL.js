/**
 * Created by Rami Khadder on 8/7/2017.
 */
var mysql = require('mysql');
var sqlSecret = require('./secrets/sql_secret.json');
var tools = require('./tools');

const cache = require('./cache').cache;
const inProgressCache = require('./cache').inProgressCache;
const checkCaches = require('./cache').checkCaches;


const uuidv4 = require('uuid/v4');


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
 * DEBUGGING
 */

const displayCacheHits = true;
const displayCacheMisses = true;
const displayCacheSets = false;
const displayCacheClears = false;
const displayInProgressCacheMessages = false;

console.log = tools.conditionalConsoleLog;

/*
 * GET METHODS
 */

exports.get = function (req) {
  connection.query('SELECT * FROM resourceManagement');
};

function getClientId (projectId) {
  const cacheKey = 'CLIENT_ID:' + projectId + ':';

  var result = cache.get(cacheKey);
  if (result != null) {
    return result.id;
  }
  query = 'SELECT * FROM projects WHERE id=' + projectId;
  connection.query(query, function (err, result) {
    if (!err) {
      if (result.length > 0) {
        cache.set(cacheKey, result);
        return result.id;
      }
      else {
        console.log('ERROR: project ID ' + projectId + ' does not have a client ID')
        return false;
      }
    }
    else {
      console.log('QUERY ERROR for ' + cacheKey);
      return false;
    }
  });
}

exports.getClientId = function (projectId) {
  return getClientId(projectId);
};


exports.getEmployees = function (args, callback) {
  const d = new Date();
  const startTime = d.getTime();
  var timeString =
    ("0" + d.getHours()).slice(-2) + ":" +
    ("0" + d.getMinutes()).slice(-2) + ":" +
    ("0" + d.getSeconds()).slice(-2);

  const reqId = uuidv4();
  console.log('SQL.getEmployees: ' + reqId + ' ' + timeString); console.log(args);

  const types = ['all', 'client', 'project'];
  const type = (types.indexOf(args.type) != -1 ? args.type : false);
  const id = (args.id !== undefined ? mysql.escape(args.id) : '');
  const isContractor = (args.iscontractor ? args.iscontractor : '');
  const isActive = (args.active ? args.active : '');
  const clearCache = (args.clearcache && args.clearcache == 'true');

  const cacheKey = tools.createStructuredCacheKey('EMPLOYEES:', args);

  const startWaiting = new Date().getTime();
  const cacheCheckDelay = 100;    // milliseconds
  const cacheCheckRetries = 60; // milliseconds
  const inProgressCacheTTL = (cacheCheckDelay*cacheCheckRetries)/1000 + 1; // seconds
  checkCaches(clearCache, cacheKey, cacheCheckDelay, cacheCheckRetries, reqId, (done, result) => {
    if (result != null) {
      console.log('CACHE HIT for ' + cacheKey, displayCacheHits);
      const waitTime = new Date().getTime() - startWaiting;
      const timeSpent = (new Date().getTime() - startTime - waitTime) / 1000;
      console.log('    SQL.getEmployees ' + reqId + ' COMPLETED IN ' + timeSpent + ' SECONDS AFTER WAITING ' + waitTime / 1000 + ' SECONDS');
      callback(null, result);
    }
    else {
      console.log('CACHE MISS for ' + cacheKey, displayCacheMisses);
      const waitTime = new Date().getTime() - startWaiting;
      inProgressCache.set(cacheKey, reqId, inProgressCacheTTL);
      console.log('IN PROGRESS CACHE SET for ' + cacheKey, displayInProgressCacheMessages);

      const selectAssignments = '(SELECT * FROM assignments UNION ALL SELECT * FROM assignments_fake)';
      const selectEmployees = '(SELECT * FROM employees UNION ALL SELECT * FROM employees_fake)';
      const activeCondition = (isActive === '1' ? ' AND e.is_active=1 AND a.deactivated=0 AND p.active=1 ' : '');
      const contractorCondition = (isContractor === '1' ? ' AND e.is_contractor=1 ' : '');
      const idCondition = (type === 'all' ? ' ' : ' AND ' + type + '_id=' + id + ' ');

      const query =
        'SELECT DISTINCT e.id, e.email, e.created_at, e.is_admin, e.first_name, e.last_name, e.is_contractor, ' +
        'e.telephone, e.is_active, e.default_hourly_rate, e.department, e.updated_at, e.cost_rate, e.capacity ' +
        'FROM clients c ' +
        'LEFT OUTER JOIN projects p ON c.id = p.client_id ' +
        'LEFT OUTER JOIN ' + selectAssignments + ' a ON p.id = a.project_id ' +
        'LEFT OUTER JOIN ' + selectEmployees + ' e ON e.id = a.user_id ' +
        'WHERE e.id = a.user_id ' + activeCondition + contractorCondition + idCondition +
        `ORDER BY CASE last_name <> '' WHEN TRUE THEN e.last_name ELSE e.first_name END, e.id ASC;`;

      connection.query(query, function (err, result) {
        if (!err) {
          //because of Harvest v2, new employees won't have their capacity on SQL so we make it 0 and have manager change it in the front end
          for (const person of result) {
            if (person.capacity == null) {
              person.capacity = 0;
            }
          }
          // console.log('CACHE SET for ' + cacheKey, displayCacheSets);
          cache.set(cacheKey, result);
          inProgressCache.del(cacheKey);
          const timeSpent = (new Date().getTime() - startTime - waitTime) / 1000;
          console.log('    SQL.getEmployees ' + reqId + ' COMPLETED IN ' + timeSpent + ' SECONDS AFTER WAITING ' + waitTime/1000 + ' SECONDS');
          callback(err, result);
        }
        else {
          console.log('QUERY ERROR for ' + cacheKey);
          inProgressCache.del(cacheKey);
          callback(err, result);
        }
      });
    }
  });
};

exports.getPeople = function (args, callback) {
  const employeeId = (args.employee_id ? mysql.escape(args.employee_id) : 'a.user_id');
  const clientId = (args.client_id !== undefined ? mysql.escape(args.client_id) : 'p.client_id');
  const projectId = (args.project_id !== undefined ? mysql.escape(args.project_id) : 'a.project_id');
  const theProjectId = (args.project_id !== undefined ? args.project_id : false);
  const isContractor = (args.iscontractor ? mysql.escape(args.iscontractor) : 'e.is_contractor');
  const isActive = (args.active ? args.active : '');
  const isReal = (args.real ? args.real : '');
  const clearCache = (args.clearcache && args.clearcache == 'true');

  const cacheKey = tools.createStructuredCacheKey('PEOPLE:', args);

  if (clearCache) {
    console.log('CACHE CLEAR for ' + cacheKey, displayCacheClears);
    cache.del(cacheKey);
    if (theProjectId) {
      // clear cache for the project's client
      const projectClientId = getClientId(theProjectId);
      if (projectClientId) {
        const clientEmployeesCacheKey = tools.createStructuredCacheKey('PEOPLE:', {client_id: projectClientId, active: '1'});
        console.log('CACHE CLEAR for ' + clientEmployeesCacheKey, displayCacheClears);
        cache.del(clientEmployeesCacheKey);
      }
    }
  }

  var result = cache.get(cacheKey);
  if (result != null) {
    console.log('CACHE HIT for ' + cacheKey, displayCacheHits);
    callback(null, result);
  }
  else {
    console.log('CACHE MISS for ' + cacheKey, displayCacheMisses);

    let assignments = '(SELECT * FROM assignments UNION ALL SELECT * FROM assignments_fake)';
    let employees = '(SELECT * FROM employees UNION ALL SELECT * FROM employees_fake)';

    if (isReal === '1') {
      assignments = 'assignments';
      employees = 'employees';
    }

    const activeQuery = (isActive === '1' ? ' AND e.is_active = 1 AND a.deactivated = 0 AND p.active = 1 ' : '');

    const query = `
    SELECT DISTINCT e.id, e.email, e.created_at, e.is_admin, e.first_name, e.last_name, e.is_contractor,
    e.telephone, e.is_active, e.default_hourly_rate, e.department, e.updated_at, e.cost_rate, e.capacity
    FROM clients c
    LEFT OUTER JOIN projects p ON c.id = p.client_id
    LEFT OUTER JOIN ` + assignments + ` a ON p.id = a.project_id
    LEFT OUTER JOIN ` + employees + ` e ON e.id = a.user_id
    WHERE e.is_contractor = ` + isContractor + activeQuery + `
    AND p.id = ` + projectId + `
    AND c.id = ` + clientId + `
    AND e.id = ` + employeeId + `
    ORDER BY CASE last_name <> '' WHEN TRUE THEN e.last_name ELSE e.first_name END, e.id ASC;`;

    connection.query(query, function (err, result) {
      if (!err) {
        //because of Harvest v2, new employees won't have their capacity on SQL so we make it 0 and have manager change it in the front end
        for (const person of result) {
          if (person.capacity == null) {
            person.capacity = 0;
          }
        }
        // console.log('CACHE SET for ' + cacheKey, displayCacheSets);
        cache.set(cacheKey, result);
        callback (err, result);
      }
      else {
        console.log('QUERY ERROR for ' + cacheKey);
        callback (err, result);
      }
    });
  }
};

// TODO - it doesn't look like we're calling this with a clientID...
exports.getProjects = function (args, callback) {
  const projectId = (args.project_id !== undefined ? mysql.escape(args.project_id) : 'a.project_id');
  let employeeId = (args.employeeid !== undefined ? mysql.escape(args.employeeid) : 'a.user_id');
  const clientId = (args.clientid !== undefined ? mysql.escape(args.clientid) : 'p.client_id');
  const active = (args.active !== undefined ? mysql.escape(args.active) : 'p.active');

  let assignments = '(SELECT * FROM assignments UNION ALL SELECT * FROM assignments_fake)';
  let employees = '(SELECT * FROM employees UNION ALL SELECT * FROM employees_fake)';

  if (args.real === '1') {
    assignments = 'assignments';
    employees = 'employees';
  }

  const cacheKey = tools.createStructuredCacheKey('PROJECTS:', args);
  const clearCache = (args.clearcache && args.clearcache == 'true');
  if (clearCache) {
    console.log('CACHE CLEAR for ' + cacheKey, displayCacheClears);
    cache.del(cacheKey);
  }

  var result = cache.get(cacheKey);
  if (result != null) {
    console.log('CACHE HIT for ' + cacheKey, displayCacheHits);
    callback(null, result);
  }
  else {
    console.log('CACHE MISS for ' + cacheKey, displayCacheMisses);
    const query =
    'SELECT DISTINCT p.id, p.client_id, p.active, p.name, p.code, p.cost_budget, p.billable, ' +
    'p.budget_by, p.state, p.created_date, p.last_checked_date, p.weekly_hour_budget, p.notes ' +
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
    'ORDER BY p.name';

    connection.query(query, function (err, result) {
      if (!err) {
        console.log('CACHE SET for ' + cacheKey, displayCacheSets);
        cache.set(cacheKey, result);
        callback(err, result);
      }
      else {
        console.log('QUERY ERROR for ' + cacheKey); console.log(query);
        callback(err, result);
      }
    });
  }
};

exports.getProjects2 = function (req, callback) {
  const id = (req.params.id !== undefined ? mysql.escape(req.params.id) : 'p.id');
  const clientId = (req.query.clientid !== undefined ? mysql.escape(req.query.clientid) : 'p.client_id');
  const active = (req.query.active !== undefined ? mysql.escape(req.query.active) : 'p.active');

  connection.query('SELECT * FROM projects p ' +
    'WHERE p.id = ' + id + ' ' +
    'AND p.client_id = ' + clientId + ' ' +
    'AND p.active = ' + active + ' ' +
    'ORDER BY p.name', function (err, result) {
    callback(err, result);
  });

};

exports.getProjectAndClient = function (req, callback) {
  connection.query('SELECT p.id, p.client_id, p.active, p.name, p.cost_budget, p.billable, p.budget_by, p.state, ' +
    'p.created_date, p.last_checked_date, p.weekly_hour_budget, p.notes, p.code, c.name as client_name, c.active as client_active ' +
    'FROM projects p RIGHT OUTER JOIN clients c ON p.client_id = c.id WHERE p.id = ' +
    mysql.escape(req.params.id), function (err, result) {
    callback(err, result);
  });
};

exports.getClients = function (query, callback) {
  const id = (query.id !== undefined ? mysql.escape(query.id) : 'c.id');
  const active = (query.active !== undefined ? mysql.escape(query.active) : 'c.active');
  const cacheKey = tools.createStructuredCacheKey('CLIENTS:', query);

  var result = cache.get(cacheKey);
  if (result != null) {
    console.log('CACHE HIT for ' + cacheKey, displayCacheHits);
    callback(false, result);
  }
  else {
    console.log('CACHE MISS for ' + cacheKey, displayCacheMisses);
    connection.query('SELECT * FROM clients c ' +
      'WHERE c.id = ' + id + ' ' +
      'AND c.active = ' + active + ' ' +
      'ORDER BY c.name', function (err, result) {
      if (!err) {
        cache.set(cacheKey, result);
        console.log('CACHE SET for ' + cacheKey, displayCacheSets);
        callback(err, result);
      }
      else {
        callback(err, result);
      }
    });
  }
};

exports.getAssignments = function (req, callback) {
  console.log('SQL.getAssignments'); console.log(req.query); console.log(req.params);
  let id = (req.params.id !== undefined ? mysql.escape(req.params.id) : 'id');
  const employeeId = (req.query.employee_id !== undefined ? mysql.escape(req.query.employee_id) : 'user_id');
  const projectId = (req.query.project_id !== undefined ? mysql.escape(req.query.project_id) : 'project_id');
  const deactivated = (req.query.deactivated ? mysql.escape(req.query.deactivated) : 'deactivated');

  connection.query(
    'SELECT * FROM (SELECT * FROM assignments UNION ALL SELECT * FROM assignments_fake) as all_assignments ' +
    'WHERE deactivated = ' + deactivated + ' ' +
    'AND id = ' + id + ' ' +
    'AND project_id = ' + projectId + ' ' +
    'AND user_id = ' + employeeId, function (err, result) {
      callback(err, result);
    });
};

exports.getDates = function (req) {
  if (req.params.id != null && req.params.length > 0) {
    var query = 'SELECT * FROM resourceManagement WHERE week_of=' + mysql.escape(req.params.id);
    if (req.query.person != null) {
      query += ' AND person_id=' + mysql.escape(req.query.person.id);
    }
  } else {
    connection.query('SELECT week_of FROM resourceManagement');
  }
};

exports.getEntries = function (req, callback) {
  const clientId = (req.query.client_id !== undefined ? mysql.escape(req.query.client_id) : 'p.client_id');
  const employeeId = (req.query.employee_id !== undefined ? mysql.escape(req.query.employee_id) : 'a.user_id');
  const projectId = (req.query.project_id !== undefined ? mysql.escape(req.query.project_id) : 'a.project_id');

  const cacheKey = tools.createStructuredCacheKey('ENTRIES:', req.query);
  const clearCache = (req.query.clearcache && req.query.clearcache == 'true');
  if (clearCache) {
    console.log('CACHE CLEAR for ' + cacheKey, displayCacheClears);
    cache.del(cacheKey);
  }

  var result = cache.get(cacheKey);
  if (result != null) {
    // console.log('CACHE HIT for ' + cacheKey, displayCacheHits);
    callback(false, result);
  }
  else {
    // console.log('CACHE MISS for ' + cacheKey, displayCacheMisses);
    const query = `
    SELECT a.id as id, c.id AS client_id, c.name AS client_name, p.id AS project_id, p.name AS project_name, e.id AS employee_id, e.first_name, e.last_name
    FROM clients c
    LEFT OUTER JOIN projects p ON c.id = p.client_id
    LEFT OUTER JOIN (SELECT * FROM assignments UNION ALL SELECT * FROM assignments_fake) a ON p.id = a.project_id
    LEFT OUTER JOIN (SELECT * FROM employees UNION ALL SELECT * FROM employees_fake) e ON e.id = a.user_id
    WHERE a.deactivated = 0
    AND p.active=1
    AND e.is_active=1
    AND p.id=` + projectId + `
    AND c.id=` + clientId + `
    AND e.id=` + employeeId + `
    ORDER BY CASE last_name <> '' WHEN TRUE THEN e.last_name ELSE e.first_name END, c.name, p.name, e.id, c.id, p.id ASC
    `;

    connection.query(query, function (err, result) {
      if (!err) {
        // console.log('CACHE SET for ' + cacheKey, displayCacheSets);
        cache.set(cacheKey, result);
        callback(err, result);
      }
      else {
        console.log('QUERY ERROR for ' + cacheKey);
        callback(err, result);
      }
    });
  }
};

exports.getCapacityHours = function (args, callback) {
  const types = ['overall', 'client', 'project'];
  const type = (types.indexOf(args.type) != -1 ? args.type : false);
  const id = (args.id !== undefined ? mysql.escape(args.id) : '');
  const clearCache = (args.clearcache && args.clearcache == 'true');

  if (!type) {
    callback({ message: 'Invalid type (' + args.type + ')for capacity hours'});
  }
  else {
    const cacheKey = tools.createStructuredCacheKey('CAPACITY_HOURS:', args);

    if (clearCache) {
      console.log('CACHE CLEAR for ' + cacheKey, displayCacheClears);
      cache.del(cacheKey);
    }
    var result = cache.get(cacheKey);
    if (result != null) {
      console.log('CACHE HIT for ' + cacheKey, displayCacheHits);
      callback(null, result);
    }
    else {
      console.log('CACHE MISS for ' + cacheKey, displayCacheMisses);
      const monday = mysql.escape(tools.getMondayFormatted());
      const idClause = (type === 'overall' ? ' ' : ' AND ' + type + '_id=' + id + ' ');
      const query =
        'SELECT SUM(capacity) as hours, week_of FROM resourceManagement ' +
        'WHERE capacity <> \'\' AND week_of >= ' + monday + idClause +
        'GROUP BY week_of ORDER BY week_of ASC;';

      connection.query(query, function (err, result) {
        if (!err) {
          console.log('CACHE SET for ' + cacheKey, displayCacheSets);
          cache.set(cacheKey, result);
          callback(err, result);
        }
        else {
          console.log('QUERY ERROR for ' + cacheKey); console.log(query);
          callback(err, result);
        }
      });
    }
  }
};

exports.getEntry = function (args, callback) {
  const projectId = (args.project_id !== undefined ? mysql.escape(args.project_id) : '');
  const employeeId = (args.employee_id !== undefined ? mysql.escape(args.employee_id) : '');
  const isActive = (args.active === '1');
  const clearCache = (args.clearcache && args.clearcache == 'true');

  const cacheKey = tools.createStructuredCacheKey('ENTRY:', args);

  if (clearCache) {
    console.log('CACHE CLEAR for ' + cacheKey, displayCacheClears);
    cache.del(cacheKey);
  }

  var result = cache.get(cacheKey);
  if (result != null) {
    //console.log('CACHE HIT for ' + cacheKey, displayEntryCacheHits);
    callback(false, result);
  }
  else {
    //console.log('CACHE MISS for ' + cacheKey, displayEntryCacheMisses);
    let cost = '';
    let costJoin = '';
    if (args.cost === '1') {
      cost = ', t.cost';
      costJoin =
        'LEFT OUTER JOIN employees e ON r.employee_id = e.id ' +
        'LEFT OUTER JOIN tiers t on t.id = e.tier_id ';
    }
    let monday = tools.getMondayFormatted();
    const active = (isActive ? 'AND r.week_of >= \'' + monday + '\' ' : '');

    let entryQuery = 'SELECT r.client_id, r.project_id, r.employee_id, r.week_of, r.capacity' + cost + ' FROM resourceManagement r ' +
      costJoin +
      'WHERE r.project_id = ' + projectId + ' ' +
      'AND r.employee_id = ' + employeeId + ' ' +
      'AND r.capacity <> \'\' ' +
      active +
      'ORDER BY r.week_of ASC;';

    let totalsQuery =
      'SELECT SUM(r.capacity) as hours, r.week_of FROM resourceManagement r ' +
      'WHERE r.employee_id = ' + employeeId + ' ' +
      'AND r.capacity <> \'\' ' +
      active +
      'GROUP BY r.week_of ' +
      'ORDER BY r.week_of ASC;';

    let query = entryQuery + totalsQuery;

    connection.query(query, function (err, result) {
      if (!err) {
        // console.log('CACHE SET for ' + cacheKey);
        cache.set(cacheKey, result);
        callback(err, result);
      }
      else {
        console.log('QUERY ERROR for ' + cacheKey);
        console.log('QUERY'); console.log(query);
        callback(err, result);
      }
    });
  }
};

exports.getData = function (args, cacheKey, callback) {
  const projectId = (args.project_id !== undefined ? mysql.escape(args.project_id) : 'r.project_id');
  const employeeId = (args.employee_id !== undefined ? mysql.escape(args.employee_id) : 'r.employee_id');
  const clientId = (args.client_id !== undefined ? mysql.escape(args.client_id) : 'r.client_id');
  const isActive = (args.active === '1');
  const slim = (args.slim === '1');

  const clearCache = (args.clearcache && args.clearcache == 'true');
  if (clearCache) {
    console.log('CACHE CLEAR for ' + cacheKey, displayCacheClears);
    cache.del(cacheKey);
  }

  var result = cache.get(cacheKey);
  if (result != null) {
    //console.log('CACHE HIT for ' + cacheKey, displayCacheHits);
    callback(false, result);
  }
  else {
    if (cacheKey.indexOf('ENTRY:') == -1) {
      //console.log('CACHE MISS for ' + cacheKey, displayCacheMisses);
    }
    let cost = '';
    let costJoin = '';
    if (args.cost === '1') {
      cost = ', t.cost';
      costJoin =
        'LEFT OUTER JOIN employees e ON r.employee_id = e.id ' +
        'LEFT OUTER JOIN tiers t on t.id = e.tier_id ';
    }
    let monday = tools.getMondayFormatted();
    const active = (isActive ? 'AND r.week_of >= \'' + monday + '\' ' : '');

    let entryQuery = 'SELECT r.client_id, r.project_id, r.employee_id, r.week_of, r.capacity' + cost + ' FROM resourceManagement r ' +
      costJoin +
      'WHERE r.project_id = ' + projectId + ' ' +
      'AND r.client_id = ' + clientId + ' ' +
      'AND r.employee_id = ' + employeeId + ' ' +
      'AND r.capacity <> \'\' ' +
      active +
        // 'ORDER BY r.box_number, r.employee_id, r.client_id, r.project_id ASC;' +
      'ORDER BY r.week_of ASC;';
    let sumFilter = '';
    if (slim) {
      entryQuery = '';
      sumFilter = 'AND r.project_id = ' + projectId + ' AND r.client_id = ' + clientId + ' ';
    }


    let query = entryQuery +
      'SELECT SUM(r.capacity) as hours, r.week_of FROM resourceManagement r ' +
      'WHERE r.employee_id = ' + employeeId + ' ' +
      sumFilter +
      'AND r.capacity <> \'\' ' +
      active +
      'GROUP BY r.week_of ' +
      'ORDER BY r.week_of ASC;';

    connection.query(query, function (err, result) {
      if (!err) {
        // console.log('CACHE SET for ' + cacheKey);
        cache.set(cacheKey, result);
        callback(err, result);
      }
      else {
        console.log('QUERY ERROR for ' + cacheKey);
        console.log('QUERY'); console.log(query);
        callback(err, result);
      }
    });
  }
};

exports.getGraphData = function (req, callback) {
  let whereStatement = 'WHERE (';
  let whereStatement2 = 'WHERE (';

  for (let i = 0; i < req.body.employees.length; i++) {
    const employee = req.body.employees[i];
    if (i === 0) {
      whereStatement += 't.user_id = ' + mysql.escape(employee.id);
      whereStatement2 += 'r.employee_id = ' + mysql.escape(employee.id);
    } else {
      whereStatement += ' OR t.user_id = ' + mysql.escape(employee.id);
      whereStatement2 += ' OR r.employee_id = ' + mysql.escape(employee.id);
    }
  }
  whereStatement += ') ';
  whereStatement2 += ') ';

  let havingStatement = 'HAVING (case when (MAX(case when project_id = ' + mysql.escape(req.body.projectId) + ' then 1 else 0 end) = 1) then 1 end) ';
  let projectFilter = 'AND project_id = ' + mysql.escape(req.body.projectId) + ' ';

  if (req.query.all === '1') {
    projectFilter = '';
  } else {
    havingStatement = '';
  }

  let monday;
  tools.getMonday(function (date) {
    tools.convertDate(date, function (convertedDate) {
      monday = convertedDate;
      connection.query(`SELECT t.user_id, e.capacity / 3600 AS capacity, date_format(t.spent_at, "%x-%v") AS week_of, SUM(t.hours) AS hours FROM
  (SELECT user_id, project_id, spent_at, hours FROM timeEntries WHERE spent_at < '` + monday + `'
  UNION ALL
  SELECT employee_id AS user_id, project_id, week_of AS spent_at, capacity AS hours FROM resourceManagement WHERE week_of >= '` + monday + `') as t
  RIGHT OUTER JOIN employees e ON t.user_id = e.id ` + whereStatement + projectFilter + `
  GROUP BY date_format(t.spent_at, "%x-%v"), t.user_id ` + havingStatement + `
  ORDER BY t.spent_at ASC;
  SELECT r.employee_id AS user_id, e.capacity / 3600 AS capacity, date_format(r.week_of, "%x-%v") AS week_of, SUM(r.capacity) AS hours
  FROM resourceManagement r
  RIGHT OUTER JOIN employees e ON r.employee_id = e.id ` + whereStatement2 + projectFilter + `
  GROUP BY date_format(r.week_of, "%x-%v"), r.employee_id ` + havingStatement + `
  ORDER BY r.week_of ASC`, function (err, result) {
        callback(err, result);
      });
    });
  });
};

exports.getTier = function (req, callback) {
  let id = (req.params.id !== undefined ? mysql.escape(req.params.id) : 'e.id');

  connection.query(
    'SELECT t.id, t.cost, e.id AS user_id FROM (SELECT * FROM employees UNION ALL SELECT * FROM employees_fake) as e ' +
    'RIGHT OUTER JOIN tiers t ON e.tier_id = t.id ' +
    'WHERE e.id = ' + id, function (err, result) {
      callback(err, result);
    }
  );

};

exports.getMembers = function (req, callback) {
  connection.query("SELECT e.id, e.first_name, e.last_name, e.capacity, a.is_project_manager " +
    "FROM employees e " +
    "RIGHT OUTER JOIN assignments a ON a.project_id = " + mysql.escape(req.params.id) + " AND e.id = a.user_id " +
    "WHERE a.deactivated = 0 " +
    "AND e.is_active = 1", function (err, result) {
    callback(err, result);
  })
};

exports.getTimeEntries = function (req, callback) {
  const id = (req.params.id !== undefined ? mysql.escape(req.params.id) : 't.id');
  const projectId = (req.query.projectid !== undefined ? mysql.escape(req.query.projectid) : 't.project_id');
  let userId = (req.query.userid !== undefined ? mysql.escape(req.query.userid) : 't.user_id');
  let since = (req.query.since ? 'and t.spent_at >= ' + mysql.escape(req.query.since) + ' ' : '');

  const from = (req.query.from ? mysql.escape(req.query.from) : null);
  const to = (req.query.to ? mysql.escape(req.query.to) : null);

  let between = (from !== null && to !== null ? 'AND t.spent_at BETWEEN ' + from + ' AND ' + to : '');

  if (between !== '' && since !== '') {
    between = '';
    since = '';
  }

  connection.query('SELECT t.id, t.user_id, t.project_id, t.task_id, t.notes, t.spent_at, t.hours, ti.cost, e.capacity FROM timeEntries t ' +
    'LEFT OUTER JOIN employees e ON t.user_id = e.id ' +
    'LEFT OUTER JOIN tiers ti on ti.id = e.tier_id ' +
    'WHERE t.id = ' + id + ' ' +
    'AND t.project_id = ' + projectId + ' ' +
    'AND t.user_id = ' + userId + ' ' +
    since + between +
    'ORDER BY t.spent_at ASC', function (err, result) {
    callback(err, result);
  })
};

exports.getAllTimeEntries = function (req, callback) {
  const projectId = (req.query.projectid !== undefined ? mysql.escape(req.query.projectid) : 't.project_id');
  let userId = (req.query.userid !== undefined ? mysql.escape(req.query.userid) : 't.user_id');
  let since = (req.query.since ? 'and t.spent_at >= ' + mysql.escape(req.query.since) + ' ' : '');

  const from = (req.query.from ? mysql.escape(req.query.from) : null);
  const to = (req.query.to ? mysql.escape(req.query.to) : null);

  let between = (from !== null && to !== null ? 'AND t.spent_at BETWEEN ' + from + ' AND ' + to + ' ' : '');

  if (between !== '' && since !== '') {
    between = '';
    since = '';
  }

  let monday;
  tools.getMonday(function (date) {
    tools.convertDate(date, function (convertedDate) {
      monday = convertedDate;
      connection.query(
        'SELECT * FROM ' +
        '(SELECT user_id, project_id, spent_at, hours FROM timeEntries UNION ALL ' +
        'SELECT employee_id AS user_id, project_id, week_of AS spent_at, capacity AS hours FROM resourceManagement WHERE week_of > \'' + monday + '\') as t ' +
        'WHERE t.project_id = ' + projectId + ' ' +
        'AND t.user_id = ' + userId + ' ' +
        since + between +
        'ORDER BY t.spent_at ASC', function (err, result) {
          callback(err, result);
        })
    });
  });
};

exports.getHours = function (req, callback) {
  const projectId = (req.query.projectid !== undefined ? mysql.escape(req.query.projectid) : 't.project_id');
  let userId = (req.query.userid !== undefined ? mysql.escape(req.query.userid) : 't.user_id');
  const from = (req.query.from ? mysql.escape(req.query.from) : null);
  const to = (req.query.to ? mysql.escape(req.query.to) : null);

  const between = (from !== null && to !== null ? 'AND t.spent_at BETWEEN ' + from + ' AND ' + to : '');

  connection.query('SELECT COALESCE(SUM(t.hours), 0) AS hours FROM ' +
    '(SELECT user_id, project_id, spent_at, hours FROM timeEntries UNION ALL ' +
    'SELECT employee_id AS user_id, project_id, week_of AS spent_at, capacity AS hours FROM resourceManagement) as t ' +
    'WHERE t.project_id = ' + projectId + ' ' +
    'AND t.user_id = ' + userId + ' ' +
    between, function (err, result) {
    callback(err, result);
  })
};

exports.getStartTime = function (req, callback) {
  const projectId = (req.params.id !== undefined ? mysql.escape(req.params.id) : 't.project_id');

  connection.query('SELECT MIN(t.spent_at) AS start FROM ' +
    '(SELECT user_id, project_id, spent_at, hours FROM timeEntries UNION ALL ' +
    'SELECT employee_id AS user_id, project_id, week_of AS spent_at, capacity AS hours FROM resourceManagement) as t ' +
    'WHERE t.project_id = ' + projectId, function (err, result) {
    callback(err, result);
  });

};

/*
 * POST METHODS
 */

exports.createEntry = function (entry, callback) {
  connection.query(
    'INSERT INTO resourceManagement (client_id, project_id, employee_id, week_of, capacity) ' +
    'VALUES (' +
    mysql.escape(entry.clientId) + ', ' +
    mysql.escape(entry.projectId) + ', ' +
    mysql.escape(entry.employeeId) + ', ' +
    mysql.escape(entry.weekOf) + ', ' +
    mysql.escape(entry.capacity) + ') ' +
    'ON DUPLICATE KEY UPDATE capacity=' + mysql.escape(entry.capacity),
    function (err, result) {
      callback(err, result);
    });
};

// TODO - not in use?
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
  connection.query(
    "INSERT INTO employees_fake (id, first_name, last_name, is_contractor, is_active, capacity, tier_id) " +
    "VALUES (" +
    mysql.escape(employee.id) + ', ' +
    mysql.escape(employee.first_name) + ', ' +
    mysql.escape(employee.last_name) + ', ' +
    mysql.escape(employee.is_contractor) + ', ' +
    mysql.escape(employee.is_active) + ', ' +
    mysql.escape(employee.capacity) + ', ' +
    mysql.escape(employee.tier_id) + ") " +
    "ON DUPLICATE KEY UPDATE " +
    "first_name=" + mysql.escape(employee.first_name) + ", " +
    "last_name=" + mysql.escape(employee.last_name) + ", " +
    "is_contractor=" + mysql.escape(employee.is_contractor) + ", " +
    "is_active=" + mysql.escape(employee.is_active) + ", " +
    "capacity=" + mysql.escape(employee.capacity) + ", " +
    "tier_id=" + mysql.escape(employee.tier_id) + "; ", function (err, result) {
      callback(err, result);
  });
};

exports.addAssignment = function (assignment, callback) {
  // TODO - if the properties of assignment match up 1-1 to the columns in the assignment table, we could do this
  // let columns = ['id', 'user_id', 'project_id', 'is_project_manager', 'deactived', 'hourly_rate', 'budget', 'created_at', 'update_at', 'estimate', 'expected_weekly_hours'];
  // Object.values(assignment).forEach(function(key) { if (!columns.indexOf(key)) { delete assignment.key; }}); // do this if the properties don't exactly match up with the columns
  // connection.query('INSERT INTO assignments SET ? ON DUPLICATE KEY UPDATE ?', [assignment, assignment], function (err, result) { callback(err, result); });

  connection.query(
    "INSERT INTO assignments (id, user_id, project_id, is_project_manager, deactivated, hourly_rate, budget, created_at, updated_at, estimate, expected_weekly_hours) " +
    "VALUES (" +
    mysql.escape(assignment.id) + ", " +
    mysql.escape(assignment.user_id) + ", " +
    mysql.escape(assignment.project_id) + ", " +
    mysql.escape(assignment.is_project_manager) + ", " +
    mysql.escape(assignment.deactivated) + ", " +
    mysql.escape(assignment.hourly_rate) + ", " +
    mysql.escape(assignment.budget) + ", " +
    mysql.escape(assignment.created_at) + ", " +
    mysql.escape(assignment.updated_at) + ", " +
    mysql.escape(assignment.estimate) + ", " +
    mysql.escape(assignment.expected_weekly_hours) + ") " +
    "ON DUPLICATE KEY UPDATE " +
    "user_id=" + mysql.escape(assignment.user_id) + ", " +
    "project_id=" + mysql.escape(assignment.project_id) + ", " +
    "is_project_manager=" + mysql.escape(assignment.is_project_manager) + ", " +
    "deactivated=" + mysql.escape(assignment.deactivated) + ", " +
    "hourly_rate=" + mysql.escape(assignment.default_hourly_rate) + ", " +
    "budget=" + mysql.escape(assignment.budget) + ", " +
    "created_at=" + mysql.escape(assignment.created_at) + ", " +
    "updated_at=" + mysql.escape(assignment.updated_at) + ", " +
    "estimate=" + mysql.escape(assignment.estimate) + ", " +
    "expected_weekly_hours=" + mysql.escape(assignment.expected_weekly_hours) + "; ",
    function (err, result) {
      callback(err, result);
    });
};

exports.addFakeAssignment = function (assignment, callback) {
  console.log('SQL.addFakeAssignment'); console.log(assignment);
  let query = '' +
    "INSERT INTO assignments_fake (id, user_id, project_id, deactivated) " +
    "VALUES (" +
    mysql.escape(assignment.id) + ", " +
    mysql.escape(assignment.user_id) + ", " +
    mysql.escape(assignment.project_id) + ", " +
    mysql.escape(assignment.deactivated) + ") " +
    "ON DUPLICATE KEY UPDATE " +
    "user_id=" + mysql.escape(assignment.user_id) + ", " +
    "project_id=" + mysql.escape(assignment.project_id) + ", " +
    "deactivated=" + mysql.escape(assignment.deactivated);

  connection.query(query, function (err, result) {
    callback(err, result);
  });
};

/*
 * PUT METHODS
 */

exports.updateCapacity = function (req, callback) {
  connection.query('UPDATE employees SET capacity = ' + mysql.escape(req.body.capacity) + ' WHERE id = ' + mysql.escape(req.body.id),
    function (err, result) {
    callback(err, result);
  });
};

exports.updateData = function (req, callback) {
  //adds rows together
  connection.query('REPLACE INTO resourceManagement ' +
    '(SELECT client_id, project_id, employee_id, week_of, SUM(capacity) FROM resourceManagement ' +
    'WHERE (employee_id = ' + mysql.escape(req.body.employee_id) + ' ' +
    'OR employee_id = ' + mysql.escape(req.body.fake_employee_id) + ') AND project_id = ' + mysql.escape(req.body.project_id) + ' ' +
    'GROUP BY week_of ORDER BY employee_id); DELETE FROM resourceManagement WHERE employee_id = ' + mysql.escape(req.body.fake_employee_id) + ' ' +
    'AND project_id = ' + mysql.escape(req.body.project_id), function (err, result) {
    callback(err, result);
    // if (!err) {
    //   connection.query('DELETE FROM resourceManagement WHERE employee_id = ' + mysql.escape(req.body.fake_employee_id) + ' ' +
    //     'AND project_id = ' + mysql.escape(req.body.project_id), function (err, result) {
    //     callback(err, result);
    //   })
    // }
  });
  //replaces real row data with fake row data
  // connection.query('DELETE FROM resourceManagement WHERE employee_id = ' + mysql.escape(req.body.employee_id) +
  //   ' AND project_id = ' + mysql.escape(req.body.project_id) + ';UPDATE resourceManagement SET employee_id = ' + mysql.escape(req.body.employee_id) +
  //   ' WHERE employee_id = ' + mysql.escape(req.body.fake_employee_id) + ' AND project_id = ' + mysql.escape(req.body.project_id),
  //   function (err, result) {
  //     callback(err, result);
  //   })
};

exports.deactivateAssignment = function (req, callback) {
  connection.query('UPDATE assignments SET deactivated = 1 WHERE id = ' + mysql.escape(req.params.assignment_id) + ' AND project_id = ' + mysql.escape(req.params.project_id),
    function (err, result) {
    callback(err, result);
  });
};

/*
 * DELETE METHODS
 */

exports.deleteFakeAssignment = function (req, callback) {
  connection.query('DELETE FROM assignments_fake WHERE id = ' + mysql.escape(req.params.assignment_id),
    function (err, result) {
    callback(err, result);
  });
};

/*
 * deleteFakeEmployee
 * params: object
 * { employee_id: string }
 *
 * deletes a fake employee and removes all of their capacity entries
 */
exports.deleteFakeEmployee = function (args, callback) {
  const employeeId = (args.employee_id !== undefined ? mysql.escape(args.employee_id) : false);
  if (!employeeId) {
    const errorMessage = 'employee_id missing from arguments. Args =' + JSON.stringify(args);
    console.log(errorMessage);
    callback({message: errorMessage});
  }
  else {
    const deleteEmployeeQuery = 'DELETE FROM employees_fake WHERE id=' + employeeId + ';';
    const deleteEmployeeCapacityQuery = 'DELETE FROM resourceManagement WHERE employee_id=' + employeeId + ';';
    const query = deleteEmployeeQuery + deleteEmployeeCapacityQuery;
    connection.query(query, function (err, result) {
      callback(err, result);
    });
  }
};

exports.custom = function (req, callback) {
  connection.query('ALTER TABLE tiers ALTER COLUMN cost varchar(255) COLLATE utf8_general_ci',
    function (err, result) {
    callback(err, result);
  });
};
// CREATE TABLE tiers (id varchar(255), cost int(11));
