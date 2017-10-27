/**
 * Created by Rami Khadder on 8/14/2017.
 */

const standardConsoleLog = console.log;
exports.conditionalConsoleLog = function(message, display = true) {
  if (display) {
    standardConsoleLog(message);
  }
};

exports.createStructuredCacheKey = function (prefix, requestKeyValues) {
  // parameters are being passed around in various styles. need to normalize them to use as a cache key
  // only the parameter keys below will be used as part of the cache key
  const normalizedKeys = {
    clientId: 'client_id',
    clientid: 'client_id',
    client_id: 'client_id',
    projectId: 'project_id',
    projectid: 'project_id',
    project_id: 'project_id',
    employeeId: 'employee_id',
    employeeid: 'employee_id',
    employee_id: 'employee_id',
    employee_ids: 'employee_ids',
    iscontractor: 'iscontractor',
    active: 'active',
    real: 'real',
    weekOf: 'week_of',
    week_of: 'week_of',
    slim: 'slim',
    id: 'id',
    type: 'type',
    inProgress: 'in_progress',
    in_progress: 'in_progress',
    all: 'all'
  };

  let keyValues = {};

  Object.keys(requestKeyValues).forEach(key => {
    if (typeof normalizedKeys[key] !== 'undefined' && typeof requestKeyValues[key] !== 'undefined') {
      const normalizedKey = normalizedKeys[key];
      keyValues[normalizedKey] = requestKeyValues[key];
    }
  });

  cacheKey = prefix;
  Object.keys(keyValues).sort().forEach(key => {
    cacheKey += key + ':' + keyValues[key] + ':';
  });

  return cacheKey;
};


exports.wait = function (milliseconds) {
  console.log('WAITING/BLOCKING for ' + milliseconds + ' milliseconds');
  const start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
};



exports.getMondayFormatted = function() {
  const date = new Date();
  while (date.getDay() !== 1) {
    date.setDate(date.getDate() - 1);
  }
  // format - i.e. 2017-09-09
  const mm = date.getMonth() + 1; // getMonth() is zero-based
  const dd = date.getDate();

  return [date.getFullYear(),
    (mm > 9 ? '' : '0') + mm,
    (dd > 9 ? '' : '0') + dd
  ].join('-');
};

exports.convertDateSync = function(date) {
  const mm = date.getMonth() + 1; // getMonth() is zero-based
  const dd = date.getDate();

  return [date.getFullYear(),
    (mm > 9 ? '' : '0') + mm,
    (dd > 9 ? '' : '0') + dd
  ].join('-');
};

exports.getMonday = function(callback) {
  const date = new Date();
  while (date.getDay() !== 1) {
    date.setDate(date.getDate() - 1);
  }
  callback(date);
};

exports.getNearestMonday = function(date, callback) {
  while (date.getDay() !== 0) {
    date.setDate(date.getDate() - 1);
  }
  callback(date);
};

exports.convertDate = function(date, callback) {
  const mm = date.getMonth() + 1; // getMonth() is zero-based
  const dd = date.getDate();

  callback([date.getFullYear(),
    (mm > 9 ? '' : '0') + mm,
    (dd > 9 ? '' : '0') + dd
  ].join('-'));
};
