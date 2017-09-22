/**
 * Created by Rami Khadder on 8/7/2017.
 */
var express = require('express');
var router = express.Router();

var tools = require('./serverTools/tools');
var SQL = require('./serverTools/SQL');
var harvest = require('./serverTools/harvest');

const uuidv4 = require('uuid/v4');

/*
 * PERSON ROUTES
 */

router.get('/person', function (req, res, next) {
  SQL.getPeople(req, function (err, result) {
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
  SQL.getPeople(req, function (err, result) {
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

router.put('/person', function (req, res, next) {
  harvest.updateCapacity(req, function (status, result) {
    if (status === 200) {
      SQL.updateCapacity(req, function (err, result) {
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
  });
});

router.put('/person/fake', function (req, res, next) {
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
  const assignment = {id: uuidv4(), user_id: employee.id, project_id: req.body.project_id, deactivated: 0};
  SQL.addFakeEmployee(employee, function (err, result) {
    if (err) {
      return res.status(500).json({
        message: 'Error!',
        err: err
      });
    } else {
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
    }
  });
});

router.delete('/person/fake/:employee_id', function (req, res, next) {
  SQL.deleteFakeEmployee(req, function (err, result) {
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
  SQL.getProjects(req, function (err, result) {
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
  SQL.getProjects(req, function (err, result) {
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

router.delete('/project/:project_id/assignments/:assignment_id', function (req, res, next) {
  harvest.removeEmployeeFromProject(req, function (status, result) {
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

router.delete('/project/:project_id/assignments_fake/:assignment_id', function (req, res, next) {
  SQL.deleteFakeAssignment(req, function (err, result) {
    if (err) {
      return res.status(500).json({
        message: 'Error!',
        err: err
      });
    } else {
      SQL.deleteFakeEmployee(req, function (err, result) {
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

router.post('/project/:project_id/assignments', function (req, res, next) {
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
          const assignment = {id: uuidv4(), user_id: req.body.user.id, project_id: req.params.project_id};
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
  SQL.getClients(req, function (err, result) {
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
  SQL.getClients(req, function (err, result) {
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
  req.query['active'] = 1;
  const filterList = [];
  SQL.getClients(req, (err, clients) => {
    if (err) {
      return res.status(500).json({
        message: 'Error!',
        err: err
      });
    }
    let count = 0;
    for (const client of clients) {
      req.query['clientid'] = client.id;
      SQL.getProjects(req, (err, projects) => {
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

router.delete('/assignment/fake/:assignment_id', function (req, res, next) {
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
  SQL.getEntries(req, function (err, result) {
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

router.post('/entry', function (req, res, next) {
  console.log(req.body);
  console.log('.....');
  SQL.createEntry(req, function (err, result) {
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
 * CAPACITY ROUTES
 */

router.get('/data', function (req, res, next) {
  SQL.getData(req, function (err, result) {
    if (err) {
      return res.status(500).json({
        message: 'Error!',
        err: err
      });
    } else {
      const totalCapacities = {};
      const totalCost = {};
      for (let i = 0; i < result.length; i++) {
        tools.convertDate(result[i].week_of, function (date) {
          if (totalCapacities[date] == null) {
            totalCapacities[date] = 0;
          }
          totalCapacities[date] += result[i].capacity;
          if (req.query.cost === '1') {
            if (totalCost[date] == null) {
              totalCost[date] = 0;
            }
            totalCost[date] += result[i].capacity * result[i].cost;
          }

        });
      }

      const JSONArray = [];
      for (const week in totalCapacities) {
        const data = {
          week: week,
          capacity: totalCapacities[week],
          cost: (req.query.cost === '1' ? totalCost[week] : 0)
        };
        JSONArray.push(data);
      }

      JSONArray.sort(function (a, b) {
        return new Date(a.week) - new Date(b.week);
      });

      return res.status(200).json({
        message: 'Success!',
        result: result,
        totalCapacities: JSONArray
      });
    }
  });
});

router.post('/data/graph', function (req, res, next) {
  SQL.getGraphData(req, (err, result) => {
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

router.put('/data', function (req, res, next) {
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
  SQL.getPeople(req, (err, employees) => {
    if (err) {
      return res.status(500).json({
        message: 'Error!',
        err: err
      });
    }
    const rollUps = [];
    let count = 0;
    req.query = {};
    for (const employee of employees) {
      req.query['employeeid'] = employee.id;
      employee.opened = false;
      rollUps.push('');
      SQL.getEntries(req, (err, entries) => {
        if (err) {
          return res.status(500).json({
            message: 'Error!',
            err: err
          });
        }
        if (entries.length > 0) {
          rollUps.splice(count, 1, entries);
        } else {
          const index = employees.indexOf(employee);
          employees.splice(index, 1);
        }
        count++;
        if (count > employees.length - 1) {
          return res.status(200).json({
            message: 'Success!',
            employees: employees,
            rollUps: rollUps
          });
        }
      })
    }
  });
});


module.exports = router;
