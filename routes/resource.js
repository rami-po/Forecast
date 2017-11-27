/**
 * Created by Rami Khadder on 8/7/2017.
 */
var express = require('express');
var router = express.Router();

var tools = require('./serverTools/tools');
var SQL = require('./serverTools/SQL');
var harvest = require('./serverTools/harvest');

const uuidv4 = require('uuid/v4');

const cache = require('./serverTools/cache').cache;
const inProgressCache = require('./serverTools/cache').inProgressCache;
const rollUpsCache = require('./serverTools/cache').rollUpsCache;
const checkCaches = require('./serverTools/cache').checkCaches;
const checkOrClearCache = require('./serverTools/cache').checkOrClearCache;

/*
 * DEBUGGING
 */

console.log = tools.conditionalConsoleLog;

const displayClearAdditionalCaches = false;
const displayCacheClear = false;
const displayCacheClearAlso = false;
const displayCacheMisses = false;
const displayInProgressCacheMessages = false;

/*
 * CACHE ROUTES
 */

router.get('/cache/keys', (req, res, next) => {
  return res.status(200).json(cache.keys());
});

router.get('/cache/stats', (req, res, next) => {
  return res.status(200).json(cache.getStats());
});

router.get('/cache/clear', (req, res, next) => {
  return res.status(200).json(cache.flushAll());
});

/*
 * PERSONNEL ROUTES
 */

router.post('/personnel/picture', function (req, res, next) {
  console.log(req.body);
  return res.status(200).json({
    message: 'test',
    result: req.body
  });
});

router.post('/personnel/timeline', function (req, res, next) {
  SQL.addTimelineEvent(req, function (err, result, eventId) {
    if (err) {
      return res.status(500).json({
        message: 'Error!',
        err: err
      });
    } else {
      return res.status(200).json({
        message: 'Success!',
        result: result,
        id: eventId
      });
    }
  })
});

router.delete('/personnel/timeline/:id', function (req, res, next) {
  SQL.removeTimelineEvent(req, function (err, result) {
    if (err) {
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

router.post('/personnel/notes', function (req, res, next) {
  SQL.addNotes(req, function (err, result, noteId) {
    if (err) {
      return res.status(500).json({
        message: 'Error!',
        err: err
      });
    } else {
      return res.status(200).json({
        message: 'Success!',
        result: result,
        id: noteId
      });
    }
  })
});

router.delete('/personnel/notes/:id', function (req, res, next) {
  SQL.removeNote(req, function (err, result) {
    if (err) {
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

router.post('/personnel/skills', function (req, res, next) {
  SQL.addSkills(req, function (err, result, skillId) {
    if (err) {
      return res.status(500).json({
        message: 'Error!',
        err: err
      });
    } else {
      return res.status(200).json({
        message: 'Success!',
        result: result,
        id: skillId
      });
    }
  })
});

router.delete('/personnel/skills/:id', function (req, res, next) {
  SQL.removeSkill(req, function (err, result) {
    if (err) {
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
 * PERSON ROUTES
 */


router.get('/employees/:type/:id?', function (req, res, next) {
  const args = {};
  Object.assign(args, req.query, req.params);
  SQL.getEmployees(args, function (err, result) {
    if (err) {
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


router.get('/person', function (req, res, next) {
  SQL.getPeople(req.query, function (err, result) {
    if (err) {
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
  SQL.getPerson(req, function (err, result) {
    if (err) {
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

// TODO - this should probably have a more descriptive path
// update an employee's capacity
router.put('/person', function (req, res, next) {
  const employeeId = req.body.id;
  const pageId = req.query.page_id;

  harvest.updateCapacity(req, function (status, result) {
    if (status === 200) {
      SQL.updateCapacity(req, function (err, result) {
        if (err) {
          return res.status(500).json({
            message: 'Error!',
            err: err
          });
        } else {
          console.log('CLEAR ADDITIONAL CACHES: updated employee capactiy', displayClearAdditionalCaches);

          for (const key of cache.keys()) {
            if (key.indexOf(':' + employeeId + ':') != -1) {
              console.log('CLEAR CACHE for ' + key, displayCacheClear);
              cache.del(key);
            }
            if (key.indexOf(':' + pageId + ':') != -1) {
              console.log('CLEAR CACHE for ' + key, displayCacheClear);
              cache.del(key);
            }
          }

          return res.status(200).json({
            message: 'Success!',
            result: result
          });
        }
      });
    } else {
      return res.status(status).json({
        message: 'Error!',
        err: result
      });
    }
  });
});

// TODO - is this every used? creating a new fake employee from the "+ Add Employee" link uses the post call below
router.put('/person/fake', function (req, res, next) {
  console.log('PUT /person/fake');
  console.log(req.query);
  console.log(req.params);
  SQL.addFakeEmployee(req.body, function (err, result) {
    if (err) {
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
 * need to bust these caches:
 * all employees
 * all rollups
 * project employees
 * parent client employees
 * project graph data
 */
router.post('/person/fake', function (req, res, next) {
  const employee = {
    id: uuidv4(),
    first_name: req.body.name,
    last_name: '',
    capacity: 144000,
    is_active: 1,
    is_contractor: 0,
    tier_id: 1
  };
  const projectId = req.body.project_id;
  const clientId = SQL.getProjectClientId(projectId);
  const assignment = {id: uuidv4(), user_id: employee.id, project_id: projectId, deactivated: 0};

  console.log('CLEAR CACHES before adding fake user');

  rollUpsCache.flushAll();
  console.log('CACHE FLUSH for rollUpsCache');

  const allEmployeesQuery = {type: 'all', active: '1', clearcache: 'true'};
  const allEmployeesCacheKey = tools.createStructuredCacheKey('EMPLOYEES:', allEmployeesQuery);
  cache.del(allEmployeesCacheKey);
  console.log('CACHE CLEAR for ' + allEmployeesCacheKey);

  const projectEmployeesQuery = {type: 'project', id: projectId, active: '1'};
  const projectEmployeesCacheKey = tools.createStructuredCacheKey('EMPLOYEES:', projectEmployeesQuery);
  cache.del(projectEmployeesCacheKey);
  console.log('CACHE CLEAR for ' + projectEmployeesCacheKey);

  const clientEmployeesQuery = {type: 'client', id: clientId, active: '1'};
  const clientEmployeesCacheKey = tools.createStructuredCacheKey('EMPLOYEES:', clientEmployeesQuery);
  cache.del(clientEmployeesCacheKey);
  console.log('CACHE CLEAR for ' + clientEmployeesCacheKey);

  for (const key of cache.keys()) {
    // TODO - shouldn't have to loop through keys to find graph data key
    // but for now, we'll delete any cache key with project or client ID which will also catch the graph data
    if (key.indexOf(':' + projectId + ':') != -1) {
      console.log('CACHE CLEAR for ' + key);
      cache.del(key);
    }
    if (key.indexOf(':' + clientId + ':') != -1) {
      console.log('CACHE CLEAR for ' + key);
      cache.del(key);
    }
  }

  SQL.addFakeEmployee(employee, function (err, result) {
    if (err) {
      return res.status(500).json({
        message: 'Error!',
        err: err
      });
    }
    else {
      SQL.addFakeAssignment(assignment, function (err, result) {
        if (err) {
          return res.status(500).json({
            message: 'Error!',
            err: err
          });
        }
        else {
          console.log('CACHE REFRESH for ALL_EMPLOYEES');
          SQL.getEmployees({type: 'all', active: '1', clearcache: 'true'}, function (err, allEmployees) {
            if (err) {
              console.log('ERROR REFRESHING ALL_EMPLOYEES cache');
              cache.del('ALL_EMPLOYEES:');
              return res.status(500).json({
                message: 'Error!',
                err: err
              });
            }
            else {
              console.log('CACHE REFRESH for project ID ' + projectId + 'employees');
              SQL.getEmployees(projectEmployeesQuery, (err, employees) => {
                if (err) {
                  console.log('SQL.getEmployees returned an error: ' + err);
                  cache.del(projectEmployeesCacheKey);
                }
                else {
                  return res.status(200).json({
                    message: 'Success!',
                    result: result,
                    allEmployees: allEmployees
                  });
                }
              });
            }
          });
        }
      });
    }
  });
});

/*
 * need to bust these caches:
 * all employees
 * all rollups
 * project employees - DONE ELSEWHERE
 * parent client employees - DONE ELSEWHERE
 * project graph data - DONE ELSEWHERE
 * ANY cache with the employee_id
 */
router.delete('/person/fake/:employee_id', function (req, res, next) {
  const employeeId = req.params.employee_id;
  const params = {employee_id: employeeId};

  rollUpsCache.flushAll();
  console.log('CACHE FLUSH for rollUpsCache');

  const allEmployeesQuery = {type: 'all', active: '1', clearcache: 'true'};
  const allEmployeesCacheKey = tools.createStructuredCacheKey('EMPLOYEES:', allEmployeesQuery);
  cache.del(allEmployeesCacheKey);
  console.log('CACHE CLEAR for ' + allEmployeesCacheKey);

  for (const key of cache.keys()) {
    // clear all caches with the employeeID
    if (key.indexOf(':' + employeeId + ':') != -1) {
      console.log('CACHE CLEAR for ' + key);
      cache.del(key);
    }
    if (key.indexOf('\'' + employeeId + '\'') != -1) {
      console.log('CACHE CLEAR for ' + key);
      cache.del(key);
    }
  }

  SQL.deleteFakeEmployee(params, function (err, result) {
    if (err) {
      return res.status(500).json({
        message: 'Error!',
        err: err
      });
    }
    else {
      console.log('CACHE REFRESH for allEmployees');
      SQL.getEmployees({type: 'all', active: '1', clearcache: 'true'}, function (err, result) {
        if (err) {
          console.log('ERROR refreshing all employees cache');
          cache.del('ALL_EMPLOYEES:');
        }
        else {
          return res.status(200).json({
            message: 'Success!',
            result: result
          });
        }
      });
    }
  });
});

/*
 * MEMBER ROUTES
 */

router.get('/member/:id', function (req, res, next) {
  SQL.getMembers(req, function (err, result) {
    if (err) {
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
  SQL.getProjects(req.query, function (err, result) {
    if (err) {
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

router.get('/project/:id', function (req, res, next) {
  req.query.project_id = req.params.id;
  SQL.getProjects(req.query, function (err, result) {
    if (err) {
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

router.get('/project/:id/start', function (req, res, next) {
  SQL.getStartTime(req, function (err, result) {
    if (err) {
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

router.get('/project/:id/client', function (req, res, next) {
  SQL.getProjectAndClient(req, function (err, result) {
    if (err) {
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

// delete employee from project
/*
 * need to bust these caches:
 * all rollUps
 * project employees
 * parent client employees
 * project graph data
 * ANY cache with the employee_id
 */
router.delete('/project/:project_id/assignments/:assignment_id', function (req, res, next) {
  const projectId = req.params.project_id;
  const clientId = SQL.getProjectClientId(projectId);

  console.log('CLEAR ADDITIONAL CACHES BEFORE removing employee from project', displayClearAdditionalCaches);

  rollUpsCache.flushAll();
  console.log('CACHE FLUSH for rollUpsCache', displayClearAdditionalCaches);

  const projectEmployeesQuery = {type: 'project', id: projectId, active: '1'};
  const projectEmployeesCacheKey = tools.createStructuredCacheKey('EMPLOYEES:', projectEmployeesQuery);
  cache.del(projectEmployeesCacheKey);
  console.log('CACHE CLEAR for ' + projectEmployeesCacheKey, displayClearAdditionalCaches);

  const clientEmployeesQuery = {type: 'client', id: clientId, active: '1'};
  const clientEmployeesCacheKey = tools.createStructuredCacheKey('EMPLOYEES:', clientEmployeesQuery);
  cache.del(clientEmployeesCacheKey);
  console.log('CACHE CLEAR for ' + clientEmployeesCacheKey, displayClearAdditionalCaches);

  for (const key of cache.keys()) {
    // TODO - shouldn't have to loop through keys to find graph data key
    // but for now, we'll delete any cache key with project or client ID which will also catch the graph data
    if (key.indexOf(':' + projectId + ':') != -1) {
      console.log('CACHE CLEAR for ' + key, displayClearAdditionalCaches);
      cache.del(key);
    }
    if (key.indexOf(':' + clientId + ':') != -1) {
      console.log('CACHE CLEAR for ' + key, displayClearAdditionalCaches);
      cache.del(key);
    }
  }

  harvest.removeEmployeeFromProject(req, function (status, result) {
    console.log('harvest returned: ' + JSON.stringify(result));
    if (status === 200 || status === 404) {
      SQL.deactivateAssignment(req, function (err, result) {
        if (err) {
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
    } else {
      return res.status(status).json({
        message: 'Error!',
        err: result
      });
    }
  })
});

// TODO - not in use. Delete this?
/*
 router.delete('/project/:project_id/assignments_fake/:assignment_id', function (req, res, next) {
 console.log('ROUTER.DELETE /project/:project+id/assignments_fake/:assignment_id');
 SQL.deleteFakeAssignment(req, function (err, result) {
 if (err) {
 return res.status(500).json({
 message: 'Error!',
 err: err
 });
 } else {
 const employeeId = req.query.employee_id;
 const params = { employee_id: employeeId };
 SQL.deleteFakeEmployee(params, function (err, result) {
 if (err) {
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
 }
 });
 });
 */

// add employee to a project
/*
 * need to bust these caches:
 * all rollUps
 * project employees
 * parent client employees
 * project graph data
 * ANY cache with the employee_id
 */
router.post('/project/:project_id/assignments', function (req, res, next) {
  const employeeId = req.body.user.id;
  const projectId = req.params.project_id;
  const clientId = SQL.getProjectClientId(projectId);
  console.log('CLEAR ADDITIONAL CACHES BEFORE adding employee to a project', displayClearAdditionalCaches);

  rollUpsCache.flushAll();
  console.log('CACHE FLUSH for rollUpsCache', displayClearAdditionalCaches);

  const projectEmployeesQuery = {type: 'project', id: projectId, active: '1'};
  const projectEmployeesCacheKey = tools.createStructuredCacheKey('EMPLOYEES:', projectEmployeesQuery);
  cache.del(projectEmployeesCacheKey);
  console.log('CACHE CLEAR for ' + projectEmployeesCacheKey, displayClearAdditionalCaches);

  const clientEmployeesQuery = {type: 'client', id: clientId, active: '1'};
  const clientEmployeesCacheKey = tools.createStructuredCacheKey('EMPLOYEES:', clientEmployeesQuery);
  cache.del(clientEmployeesCacheKey);
  console.log('CACHE CLEAR for ' + clientEmployeesCacheKey, displayClearAdditionalCaches);

  for (const key of cache.keys()) {
    // TODO - shouldn't have to loop through keys to find graph data key
    // but for now, we'll delete any cache key with project or client ID which will also catch the graph data
    if (key.indexOf(':' + projectId + ':') != -1) {
      console.log('CACHE CLEAR for ' + key, displayClearAdditionalCaches);
      cache.del(key);
    }
    if (key.indexOf(':' + clientId + ':') != -1) {
      console.log('CACHE CLEAR for ' + key, displayClearAdditionalCaches);
      cache.del(key);
    }
    if (key.indexOf(':' + employeeId + ':') != -1) {
      console.log('CACHE CLEAR for ' + key, displayClearAdditionalCaches);
      cache.del(key);
    }
    if (key.indexOf('\'' + employeeId + '\'') != -1) {
      console.log('CACHE CLEAR for ' + key, displayClearAdditionalCaches);
      cache.del(key);
    }
  }

  harvest.addEmployeeToProject(req, function (status, result) {
    if (status === 201 || status === 404) {
      req.params['assignment_id'] = result.id;
      harvest.getAssignment(req, function (status, result) {
        if (status === 200) {
          SQL.addAssignment(result.user_assignment, function (err, result) {
            if (err) {
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
        } else if (status === 404) {
          const assignment = {
            id: uuidv4(),
            user_id: req.body.user.id,
            project_id: req.params.project_id,
            deactivated: 0
          };
          SQL.addFakeAssignment(assignment, function (err, result) {
            if (err) {
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
        } else {
          return res.status(status).json({
            message: 'Error!',
            err: result
          });
        }
      })
    } else {
      return res.status(status).json({
        message: 'Error!',
        err: result
      });
    }
  })
});

/*
 * CLIENT ROUTES
 */

router.get('/client', function (req, res, next) {
  const clientQuery = req.query;
  SQL.getClients(clientQuery, function (err, result) {
    if (err) {
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

router.get('/client/:id', function (req, res, next) {
  let clientQuery = req.query;
  clientQuery.id = req.params.id;
  SQL.getClients(clientQuery, function (err, result) {
    if (err) {
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

router.get('/clients/projects', function (req, res, next) {
  req.query = {};
  req.query['active'] = '1';
  const clientQuery = {active: '1'};
  const filterList = [];
  SQL.getClients(clientQuery, (err, clients) => {
    if (err) {
      return res.status(500).json({
        message: 'Error!',
        err: err
      });
    }
    let count = 0;
    for (const client of clients) {
      req.query['clientid'] = client.id;
      SQL.getProjects(req.query, (err, projects) => {
        if (err) {
          return res.status(500).json({
            message: 'Error!',
            err: err
          });
        }
        if (projects.length > 1) {
          projects.splice(0, 0, {id: client.id, name: 'All Projects'});
        }
        if (projects.length > 0) {
          filterList.push({name: client.name, id: client.id, projects: projects});
        }
        count++;
        if (count > clients.length - 1) {
          return res.status(200).json({
            message: 'Success!',
            result: filterList
          });
        }
      })
    }
  });
});


/*
 * ASSIGNMENT ROUTES
 */

router.get('/assignment', function (req, res, next) {
  SQL.getAssignments(req, function (err, result) {
    if (err) {
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

router.get('/assignment/:id', function (req, res, next) {
  SQL.getAssignments(req, function (err, result) {
    if (err) {
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
 * need to bust these caches:
 * all rollUps
 * project employees
 * parent client employees
 * project graph data
 * ANY cache with the employee_id
 */
router.delete('/assignment/fake/:assignment_id', function (req, res, next) {
  const employeeId = req.query.employee_id;
  const projectId = req.query.project_id;
  const clientId = SQL.getProjectClientId(projectId);

  console.log('CLEAR ADDITIONAL CACHES BEFORE deleting fake employees from a project', displayClearAdditionalCaches);

  rollUpsCache.flushAll();
  console.log('CACHE FLUSH for rollUpsCache', displayClearAdditionalCaches);

  const projectEmployeesQuery = {type: 'project', id: projectId, active: '1'};
  const projectEmployeesCacheKey = tools.createStructuredCacheKey('EMPLOYEES:', projectEmployeesQuery);
  cache.del(projectEmployeesCacheKey);
  console.log('CACHE CLEAR for ' + projectEmployeesCacheKey, displayClearAdditionalCaches);

  const clientEmployeesQuery = {type: 'client', id: clientId, active: '1'};
  const clientEmployeesCacheKey = tools.createStructuredCacheKey('EMPLOYEES:', clientEmployeesQuery);
  cache.del(clientEmployeesCacheKey);
  console.log('CACHE CLEAR for ' + clientEmployeesCacheKey, displayClearAdditionalCaches);

  for (const key of cache.keys()) {
    // TODO - shouldn't have to loop through keys to find graph data key
    // but for now, we'll delete any cache key with project or client ID which will also catch the graph data
    if (key.indexOf(':' + projectId + ':') != -1) {
      console.log('CACHE CLEAR for ' + key, displayClearAdditionalCaches);
      cache.del(key);
    }
    if (key.indexOf(':' + clientId + ':') != -1) {
      console.log('CACHE CLEAR for ' + key, displayClearAdditionalCaches);
      cache.del(key);
    }
    if (key.indexOf(':' + employeeId + ':') != -1) {
      console.log('CACHE CLEAR for ' + key, displayClearAdditionalCaches);
      cache.del(key);
    }
    if (key.indexOf('\'' + employeeId + '\'') != -1) {
      console.log('CACHE CLEAR for ' + key, displayClearAdditionalCaches);
      cache.del(key);
    }
  }

  SQL.deleteFakeAssignment(req, function (err, result) {
    if (err) {
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
  SQL.getEntries(req.query, function (err, result) {
    if (err) {
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
 * body.entry {
 * firstName: 'Tony',
 * lastName: 'Herr',
 * employeeId: '938567',
 * clientName: 'productOps',
 * clientId: 81299,
 * projectName: 'Scala',
 * projectId: 2848755,
 * weekOf: '2017-10-09',
 * capacity: 0 }
 *
 * body.params {
 * path: string,
 *
 */
router.post('/entry', function (req, res, next) {
  const entry = req.body.entry;
  const params = req.body.params;
  const employeeId = entry.employeeId;
  const projectId = entry.projectId;
  const clientId = entry.clientId;

  rollUpsCache.flushAll();
  console.log('CACHE FLUSH for rollUpsCache', displayClearAdditionalCaches);

  for (const key of cache.keys()) {
    // TODO - shouldn't have to loop through keys to find graph data key
    if (key.indexOf(':GRAPH_DATA:') != -1 && key.indexOf(':' + projectId + ':') != -1) {
      console.log('CACHE CLEAR for ' + key, displayClearAdditionalCaches);
      cache.del(key);
    }
  }

  SQL.createEntry(entry, function (err, createEntryResult) {
    if (err) {
      return res.status(500).json({
        message: 'Error!',
        err: err
      });
    }
    else {
      // refresh overall hours capacity cache
      console.log('REFRESH CACHE: overall capacity hours');
      SQL.getCapacityHours({type: 'overall', clearcache: 'true'}, function (err, overallHoursResult) {
        if (err) {
          return res.status(500).json({
            message: 'Error!',
            err: err
          });
        }
        else {
          // refresh client hours
          console.log('REFRESH CACHE: client capacity hours');
          SQL.getCapacityHours({type: 'client', id: clientId, clearcache: 'true'}, function (err, clientHoursResult) {
            if (err) {
              return res.status(500).json({
                message: 'Error!',
                err: err
              });
            }
            else {
              // refresh project hours
              console.log('REFRESH CACHE: project capacity hours');
              SQL.getCapacityHours({
                type: 'project',
                id: projectId,
                clearcache: 'true'
              }, function (err, projectHoursResult) {
                if (err) {
                  return res.status(500).json({
                    message: 'Error!',
                    err: err
                  });
                }
                else {
                  const employeeDataQuery = {employee_id: employeeId, active: '1', slim: '1', clearcache: 'true'};
                  SQL.getData(employeeDataQuery, function (err, employeeDataResult) {
                    if (err) {
                      return res.status(500).json({
                        message: 'Error!',
                        err: err
                      });
                    }
                    else {
                      return res.status(200).json({
                        message: 'Success!',
                        result: createEntryResult,
                        overallHoursData: overallHoursResult,
                        clientHoursData: clientHoursResult,
                        projectHoursData: projectHoursResult,
                        employeeData: employeeDataResult
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
  });
});

/*
 * CAPACITY ROUTES
 */

router.get('/capacity/project', function (req, res, next) {
  SQL.getProjectRowData(req.query, (err, result) => {
    if (err) {
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

router.get('/capacity/hours/:type/:id?', function (req, res, next) {
  SQL.getCapacityHours(req.params, (err, result) => {
    if (err) {
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

router.get('/capacity/total', function (req, res, next) {
  SQL.getTotalCapacities(req, (err, result) => {
    if (err) {
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


router.get('/data', function (req, res, next) {
  const clientId = (req.query.client_id !== undefined ? 'clientId:' + req.query.client_id + ':' : '' );
  const projectId = (req.query.project_id !== undefined ? 'projectId:' + req.query.project_id + ':' : '');
  const employeeId = (req.query.employee_id !== undefined ? 'employeeId:' + req.query.employee_id : '');
  const isActive = (req.query.active ? 'isActive' + req.query.active + ':' : '' );

  console.log('/DATA');
  console.log(req.query);

  if (!req.query.client_id && (req.query.clientid || req.query.clientId)) {
    console.log('BAD QUERY ARGUMENTS, PLEASE USE "client_id" instead of "clientid"');
    console.log(req.query);
    console.log(req);
    req.query.client_id = (req.query.clientid ? req.query.clientid : req.query.clientId);
    req.query.clientid = null;
    req.query.clientId = null;
  }

  SQL.getData(req.query, function (err, result) {
    if (err) {
      return res.status(500).json({
        message: 'Error!',
        err: err
      });
    } else {
      // const totalCapacities = {};
      // const totalCost = {};
      // for (let i = 0; i < result.length; i++) {
      //   tools.convertDate(result[i].week_of, function (date) {
      //     if (totalCapacities[date] == null) {
      //       totalCapacities[date] = 0;
      //     }
      //     totalCapacities[date] += result[i].capacity;
      //     if (req.query.cost === '1') {
      //       if (totalCost[date] == null) {
      //         totalCost[date] = 0;
      //       }
      //       totalCost[date] += result[i].capacity * result[i].cost;
      //     }
      //
      //   });
      // }
      //
      // const JSONArray = [];
      // for (const week in totalCapacities) {
      //   const data = {
      //     week: week,
      //     capacity: totalCapacities[week],
      //     cost: (req.query.cost === '1' ? totalCost[week] : 0)
      //   };
      //   JSONArray.push(data);
      // }
      //
      // JSONArray.sort(function (a, b) {
      //   return new Date(a.week) - new Date(b.week);
      // });

      return res.status(200).json({
        message: 'Success!',
        result: result
        // totalCapacities: JSONArray
      });
    }
  });
});

router.post('/graph/data', function (req, res, next) {
  SQL.getGraphData(req, (err, result) => {
    if (err) {
      return res.status(500).json({
        message: 'Error!',
        err: err
      });
    } else {
      return res.status(200).json({
        message: 'Success!',
        result: result[0],
        forecast: result[1]
      });
    }
  })
});

// router.get('/data/graph', function (req, res, next) {
//   req.params['projectid'] = req.query['projectid'];
//   SQL.getStartTime(req, function (err, date) {
//     if (!err) {
//       tools.getNearestMonday(new Date(date[0].start), function (monday) {
//         SQL.getPeople(req, function (err, employees) {
//           if (!err) {
//             array = [];
//             let numberOfWeeks = 0;
//             const mondayTemp = new Date(monday);
//             while (mondayTemp.getTime() <= new Date(req.query.endweek).getTime()) {
//               numberOfWeeks++;
//               mondayTemp.setDate(mondayTemp.getDate() + 7);
//             }
//             asyncLoop(numberOfWeeks, function (loop) {
//               let projectCost = 0;
//               asyncLoop(employees.length, function (loop) {
//                 console.log('!');
//                 getProjectCost(req, monday, projectCost, employees[loop.iteration()], function (cost) {
//                   projectCost += cost;
//                   loop.next();
//                 });
//               }, function () {
//                 console.log('YO');
//                 array.push({week: monday.toISOString().slice(0, 10), cost: projectCost});
//                 if (monday.getTime() < new Date(req.query.endweek).getTime()) {
//                   monday.setDate(monday.getDate() + 7);
//                 }
//                 loop.next();
//               });
//             }, function () {
//               return res.status(200).json({
//                 message: 'Success!',
//                 result: array
//               });
//             });
//           }
//         });
//       });
//     }
//   });
// });

const async = require('async');

function getProjectCost(req, monday, projectCost, employee, callback) {
  async.parallel({
    projectHours: function (callback) {
      req.query['userid'] = employee.id;
      const weekAfterMonday = new Date(monday);
      weekAfterMonday.setDate(weekAfterMonday.getDate() + 6)
      req.query['from'] = monday.toISOString().slice(0, 10);
      req.query['to'] = weekAfterMonday.toISOString().slice(0, 10);
      SQL.getHours(req, function (err, projectHours) {
        if (!err) {
          callback(null, projectHours);
        } else {
          console.log('project hours');
          console.log(err);
        }
      });
    },
    totalHours: function (callback) {
      const projectId = req.query['projectid'];
      delete req.query['projectid'];
      SQL.getHours(req, function (err, totalHours) {
        if (!err) {
          callback(null, totalHours);
        } else {
          console.log('total hours');
          console.log(err);
        }
      });
    }
  }, function (err, results) {
    if (err) {
      console.log(err);
    } else {
      const totalHours = results.totalHours[0].hours;
      const projectHours = results.projectHours[0].hours;
      if (totalHours >= employee.capacity / 3600) {
        projectCost += (projectHours / totalHours) * employee.cost;
      } else {
        projectCost += (projectHours / (employee.capacity / 3600)) * employee.cost;
      }
      callback(projectHours);
    }
  });

  // let projectCost = 0;
  // let i = 0;
  // for (const employee of employees) {
  //   console.log(employees.length);
  //   console.log(i);
  //   req.params['id'] = employee.id;
  //   SQL.getTier(req, function (err, tier) {
  //     if (!err) {
  //       req.query['userid'] = employee.id;
  //       req.query['from'] = monday.toISOString().slice(0, 10);
  //       req.query['to'] = req.query.endweek;
  //       SQL.getHours(req, function (err, projectHours) {
  //         if (!err) {
  //           const projectId = req.query['projectid'];
  //           delete req.query['projectid'];
  //           SQL.getHours(req, function (err, totalHours) {
  //             if (!err) {
  //               if (totalHours.hours >= employee.capacity / 3600) {
  //                 projectCost += (projectHours.hours / totalHours.hours) * tier.cost;
  //               } else {
  //                 projectCost += (projectHours.hours / (employee.capacity / 3600)) * tier.cost;
  //               }
  //               i++;
  //               if (i === employees.length) {
  //                 console.log('hm');
  //                 callback(projectCost);
  //               }
  //             }
  //           });
  //         }
  //       });
  //     }
  //   });
  // }
}

function asyncLoop(iterations, func, callback) {
  let index = 0;
  let done = false;
  const loop = {
    next: function () {
      if (done) {
        return;
      }

      if (index < iterations) {
        index++;
        func(loop);

      } else {
        done = true;
        callback();
      }
    },

    iteration: function () {
      return index - 1;
    },

    break: function () {
      done = true;
      callback();
    }
  };
  loop.next();
  return loop;
}

// TODO - this should probably have a more descriptive path, as well as a description
router.put('/data', function (req, res, next) {
  const employeeId = req.body.employee_id;
  const projectId = req.body.project_id;
  const fakeEmployeeId = req.body.fake_employee_id;

  console.log('CLEAR ADDITIONAL CACHES after updating entry', displayClearAdditionalCaches);
  for (const key of cache.keys()) {
    // for now, we'll bust all rollup caches.
    if (key.indexOf('ROLLUPS:') != -1) {
      console.log('CACHE CLEAR ALSO for ' + key, displayCacheClearAlso);
      cache.del(key);
    }
    // bust all caches for this employee
    if (key.indexOf(':' + employeeId + ':') != -1) {
      console.log('CACHE CLEAR ALSO for ' + key);
      cache.del(key);
    }
    // bust all caches for the fake employee
    if (key.indexOf(':' + fakeEmployeeId + ':') != -1) {
      console.log('CACHE CLEAR ALSO for ' + key);
      cache.del(key);
    }
    // bust all caches for the fake employee
    if (key.indexOf(':' + projectId + ':') != -1) {
      console.log('CACHE CLEAR ALSO for ' + key);
      cache.del(key);
    }
  }

  SQL.updateData(req, function (err, result) {
    if (err) {
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
 * TIME ROUTES
 */

router.get('/time', function (req, res, next) {
  SQL.getTimeEntries(req, function (err, result) {
    if (err) {
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

router.get('/time/all', function (req, res, next) {
  SQL.getAllTimeEntries(req, function (err, result) {
    if (err) {
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

router.get('/time/hours', function (req, res, next) {
  SQL.getHours(req, function (err, result) {
    if (err) {
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
    if (err) {
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
 * TIER ROUTES
 */

router.get('/tier/:id', function (req, res, next) {
  SQL.getTier(req, function (err, result) {
    if (err) {
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
 * ROLLUP ROUTES
 */

router.get('/rollups', function (req, res, next) {
  const d = new Date();
  const startTime = d.getTime();
  var timeString =
    ("0" + d.getHours()).slice(-2) + ":" +
    ("0" + d.getMinutes()).slice(-2) + ":" +
    ("0" + d.getSeconds()).slice(-2);

  const reqId = uuidv4();
  console.log('ROLLUPS: ' + reqId + ' ' + timeString);
  console.log(req.query);

  if (typeof req.query.opened === 'undefined') {
    console.log('opened is undefined:');
  }
  const openEmployees = (typeof req.query.opened != 'undefined' ? req.query.opened : []);
  const clientId = (req.query.client_id !== undefined ? req.query.client_id : '');
  const projectId = (req.query.project_id !== undefined ? req.query.project_id : '');

  const cachePrefix = 'ROLLUPS:';
  const cacheKey = tools.createStructuredCacheKey(cachePrefix, req.query);

  const clearCache = (req.query.clearcache && req.query.clearcache == 'true');

  var result = checkOrClearCache(clearCache, cacheKey, rollUpsCache);
  // all and projects view produce the same cachekey, so we check if employees is null or not
  if (result != null && result.employees != null) {
    console.log('result!! ' + result);

    console.log('CACHE HIT for ' + cacheKey);
    if (openEmployees.length > 0) {
      for (const employee of result.employees) {
        employee.opened = (openEmployees.indexOf(employee.id) > -1);
      }
    }
    const timeSpent = (new Date().getTime() - startTime) / 1000;
    console.log('    ROLLUPS ' + reqId + ' COMPLETED IN ' + timeSpent + ' SECONDS');
    return res.status(200).json({
      message: 'Success!',
      employees: result.employees,
      rollUps: result.rollUps
    });
  }
  else {
    console.log('CACHE MISS for ' + cacheKey);
    let viewType = 'all';
    let viewId = undefined;
    if (clientId !== '') {
      viewType = 'client';
      viewId = clientId;
    }
    else if (projectId !== '') {
      viewType = 'project';
      viewId = projectId;
    }

    //SQL.getPeople(req.query, (err, employees) => {
    SQL.getEmployees({type: viewType, id: viewId, active: '1', clearcache: clearCache}, (err, employees) => {
      if (err) {
        return res.status(500).json({
          message: 'Error!',
          err: err
        });
      }
      else {
        let employeeIds = [];
        let keyedEmployees = {};
        for (const employee of employees) {
          employeeIds.push(employee.id);
          employee.opened = (openEmployees.indexOf(employee.id) > -1);
          employee.entries = [];
          employee.assignments = {};
          employee.assignmentIds = {};
          employee.projects = {};
          employee.total_capacities = [];
          employee.total = [];
          keyedEmployees[employee.id] = employee;
        }
        const assignmentsAndTotalCapacityQuery = {
          employee_ids: employeeIds,
          client_id: clientId,
          project_id: projectId
        };
        SQL.getAssignmentsAndTotalCapacity(assignmentsAndTotalCapacityQuery, (err, results) => {
          if (err) {
            inProgressCache.del(cacheKey);
            return res.status(500).json({
              message: 'Error!',
              err: err
            });
          }
          else {
            for (const totalCapacity of results[1]) {
              const employee = keyedEmployees[totalCapacity.employee_id];
              employee.total_capacities.push(totalCapacity);
            }
            for (const total of results[2]) {
              const employee = keyedEmployees[total.employee_id];
              employee.total.push(total);
            }
            let projectIds = [];
            let keyedAssignments = {};

            for (const assignment of results[0]) {
              const employee = keyedEmployees[assignment.employee_id];

              assignment.forecast = {'data': [], 'totals': employee.total_capacities, 'total': employee.total};
              employee.entries.push(assignment);
              employee.assignments[assignment.id] = assignment;
              employee.projects[assignment.project_id] = assignment;
              employee.assignmentIds[assignment.project_id] = assignment.id;
              keyedAssignments[assignment.id] = assignment;
              // need a list of project IDs for the entry capacity query
              projectIds.push(assignment.project_id);
              /*
               if (! projectIds.indexOf(assignment.project_id) === -1) {
               console.log('PUSH');
               projectIds.push(assignment.project_id);
               }
               */
            }
            SQL.getEntriesCapacityHours({
              project_ids: projectIds,
              employee_ids: employeeIds,
              active: '1'
            }, (err, results) => {
              if (err) {
                inProgressCache.del(cacheKey);
                return res.status(500).json({
                  message: 'Error!',
                  err: err
                });
              }
              else {
                for (const entry of results) {
                  const employee = keyedEmployees[entry.employee_id];
                  const entryAssignmentId = employee.assignmentIds[entry.project_id];
                  const assignment = employee.assignments[entryAssignmentId];
                  if (typeof assignment !== 'undefined') {
                    assignment.forecast.data.push(entry);
                    //assignment.forecast.totals = employee.total_capacities;
                  }
                  else {
                    // console.log('UNDEFINED ASSIGNMENT:');
                    // console.log(' ENTRY:');
                    // console.log(entry);
                    // console.log('  ASSIGNMENT IDS:');
                    // console.log(employee.assignmentIds);
                    // console.log('  ASSIGNMENTS:');
                    // console.log(employee.assignments);
                  }
                }
                let rollUps = [];
                for (const employee of employees) {
                  rollUps.push(keyedEmployees[employee.id].entries);
                  // clean up employees array to reduce size of JSON returned
                  // assignment to null is potentially quicker than delete an object's property
                  employee.assignmentIds = null;
                  employee.assignments = null;
                  employee.projects = null;
                  employee.total_capacities = null;
                  employee.total = null;

                }

                // sort rollups
                //1) combine the arrays:
                const list = [];
                for (let j = 0; j < employees.length; j++) {
                  list.push({'employees': employees[j], 'rollUps': rollUps[j]});
                }

                //2) sort:
                list.sort(function (a, b) {
                  const hoursA = (a.rollUps[0].forecast.total[0] != null ? a.rollUps[0].forecast.total[0].hours : 0);
                  const hoursB = (b.rollUps[0].forecast.total[0] != null ? b.rollUps[0].forecast.total[0].hours : 0);
                  const amountOfTotalsA = a.rollUps[0].forecast.totals.length;
                  const amountOfTotalsB = b.rollUps[0].forecast.totals.length;

                  return ((amountOfTotalsA < amountOfTotalsB) ? -1 : ((amountOfTotalsA == amountOfTotalsB) ? 0 : 1));
                });

                //3) separate them back out:
                for (let k = 0; k < list.length; k++) {
                  employees[k] = list[k].employees;
                  rollUps[k] = list[k].rollUps;
                }

                rollUpsCache.set(cacheKey, {'employees': employees, 'rollUps': rollUps});
                console.log('CACHE SET for ' + cacheKey);
                const timeSpent = (new Date().getTime() - startTime) / 1000;
                console.log('    ROLLUPS ' + reqId + ' COMPLETED IN ' + timeSpent + ' SECONDS');




                return res.status(200).json({
                  message: 'Success!',
                  employees: employees,
                  rollUps: rollUps
                });
              }
            });
          }
        });
      }
    });
  }
});

router.get('/rollups/projects', function (req, res, next) {
  const d = new Date();
  const startTime = d.getTime();
  var timeString =
    ("0" + d.getHours()).slice(-2) + ":" +
    ("0" + d.getMinutes()).slice(-2) + ":" +
    ("0" + d.getSeconds()).slice(-2);

  const reqId = uuidv4();
  console.log('ROLLUPS: ' + reqId + ' ' + timeString);
  console.log(req.query);

  if (typeof req.query.opened === 'undefined') {
    console.log('opened is undefined:');
  }
  const openProjects = (typeof req.query.opened != 'undefined' ? req.query.opened : []);

  const cachePrefix = 'ROLLUPS:';
  const cacheKey = tools.createStructuredCacheKey(cachePrefix, req.query);

  const clearCache = (req.query.clearcache && req.query.clearcache == 'true');

  var result = checkOrClearCache(clearCache, cacheKey, rollUpsCache);
  // all and projects view produce the same cachekey, so we check if projects is null or not
  if (result != null && result.projects != null) {
    console.log('result!! ' + result);

    console.log('CACHE HIT for ' + cacheKey);
    if (openProjects.length > 0) {
      for (const project of result.projects) {
        project.opened = (openProjects.indexOf(project.id) > -1);
      }
    }
    const timeSpent = (new Date().getTime() - startTime) / 1000;
    console.log('    ROLLUPS ' + reqId + ' COMPLETED IN ' + timeSpent + ' SECONDS');
    return res.status(200).json({
      message: 'Success!',
      projects: result.projects,
      rollUps: result.rollUps
    });
  }
  else {
    console.log('CACHE MISS for ' + cacheKey);
    SQL.getProjects({active: '1', clearcache: clearCache, orderByClient: '1'}, (err, projects) => {
      if (err) {
        return res.status(500).json({
          message: 'Error!',
          err: err
        });
      }
      else {
        let projectIds = [];
        let keyedProjects = {};
        for (const project of projects) {
          projectIds.push(project.id);
          project.opened = (openProjects.indexOf(project.id) > -1);
          project.entries = [];
          project.assignments = {};
          project.assignmentIds = {};
          project.employees = {};
          project.total_capacities = [];
          keyedProjects[project.id] = project;
        }
        const assignmentsAndTotalCapacityQueryForProjects = {project_ids: projectIds};
        SQL.getAssignmentsAndTotalCapacityForProjects(assignmentsAndTotalCapacityQueryForProjects, (err, results) => {
          if (err) {
            console.log('ERR!!!!!');
            inProgressCache.del(cacheKey);
            return res.status(500).json({
              message: 'Error!',
              err: err
            });
          }
          else {
            for (const totalCapacity of results[1]) {
              const project = keyedProjects[totalCapacity.project_id];
              project.total_capacities.push(totalCapacity);
            }
            let employeeIds = [];
            let keyedAssignments = {};
            for (const assignment of results[0]) {
              const project = keyedProjects[assignment.project_id];
              assignment.forecast = {'data': [], 'totals': project.total_capacities};
              project.entries.push(assignment);
              project.assignments[assignment.id] = assignment;
              project.employees[assignment.employeeId] = assignment;
              project.assignmentIds[assignment.employee_id] = assignment.id;
              keyedAssignments[assignment.id] = assignment;
              employeeIds.push(assignment.employee_id);
            }
            SQL.getEntriesCapacityHours({
              project_ids: projectIds,
              employee_ids: employeeIds,
              active: '1'
            }, (err, results) => {
              if (err) {
                inProgressCache.del(cacheKey);
                return res.status(500).json({
                  message: 'Error!',
                  err: err
                });
              }
              else {
                for (const entry of results) {
                  const project = keyedProjects[entry.project_id];
                  const entryAssignmentId = project.assignmentIds[entry.employee_id];
                  const assignment = project.assignments[entryAssignmentId];
                  if (typeof assignment !== 'undefined') {
                    assignment.forecast.data.push(entry);
                  }
                  else {
                    // console.log('UNDEFINED ASSIGNMENT:');
                    // console.log(' ENTRY:');
                    // console.log(entry);
                    // console.log('  ASSIGNMENT IDS:');
                    // console.log(project.assignmentIds);
                    // console.log('  ASSIGNMENTS:');
                    // console.log(project.assignments);
                  }
                }
                let rollUps = [];
                for (const project of projects) {
                  rollUps.push(keyedProjects[project.id].entries);
                  // clean up employees array to reduce size of JSON returned
                  // assignment to null is potentially quicker than delete an object's property
                  project.assignmentIds = null;
                  project.assignments = null;
                  project.employees = null;
                  project.total_capacities = null;

                }

                rollUpsCache.set(cacheKey, {'projects': projects, 'rollUps': rollUps});
                console.log('CACHE SET for ' + cacheKey);
                const timeSpent = (new Date().getTime() - startTime) / 1000;
                console.log('    ROLLUPS ' + reqId + ' COMPLETED IN ' + timeSpent + ' SECONDS');

                return res.status(200).json({
                  message: 'Success!',
                  projects: projects,
                  rollUps: rollUps
                });
              }
            });
          }
        })
      }
    });
  }
});

/*
 * FUNNEL ROUTES
 */

router.get('/funnel', function (req, res, next) {
  SQL.getFunnelItems(req, function (err, result) {
    if (err) {
      return res.status(500).json({
        message: 'ERROR!',
        result: err
      });
    } else {
      return res.status(200).json({
        message: 'Success!',
        result: result
      });
    }
  });
});

router.post('/funnel', function (req, res, next) {
  req.body['id'] = uuidv4();
  SQL.addFunnelItem(req, function (err, result) {
    if (err) {
      return res.status(500).json({
        message: 'ERROR!',
        result: err
      });
    } else {
      return res.status(200).json({
        message: 'Success!',
        result: result
      });
    }
  });
});

router.put('/funnel', function (req, res, next) {
  SQL.updateFunnelItem(req, function (err, result) {
    if (err) {
      return res.status(500).json({
        message: 'ERROR!',
        result: err
      });
    } else {
      return res.status(200).json({
        message: 'Success!',
        result: result
      });
    }
  });
});

router.delete('/funnel', function (req, res, next) {
  SQL.deleteFunnelItem(req, function (err, result) {
    if (err) {
      return res.status(500).json({
        message: 'ERROR!',
        result: err
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
