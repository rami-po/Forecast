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
  const employee = {id: uuidv4(), first_name: req.body.name, last_name: '', capacity: 144000, is_active: 1, is_contractor: 0};
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

router.delete('/person/fake/:id', function (req, res, next) {
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

router.get('/project/:id*', function (req, res, next) {
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

});

router.post('/project/:project_id/assignments', function(req, res, next) {
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

router.get('/client/:id*', function (req, res, next) {
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

router.delete('/assignment/fake/:id', function (req, res, next) {
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
            totalCost[date] += result[i].capacity *  result[i].cost;
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
 * ROLLUP ROUTES
 */

// router.get('/rollups', function (req, res, next) {
//   let rollUps = [];
//
//   SQL.getPeople(req, (err, data) => {
//     if (err) {
//
//     } else {
//       const employees = data;
//       for (let i = 0; i < employees.length; i++) {
//         employees[i].opened = false;
//       }
//       for (const employee of employees) {
//         req.query['employeeid'] = employee.id;
//         SQL.getEntries(req, (err, entries) => {
//           if (err) {
//             console.log('reerer')
//           } else {
//             console.log('d')
//             if (entries.length > 0) {
//               console.log('e')
//               rollUps.push(entries);
//             } else {
//               console.log('f')
//               const index = employees.indexOf(employee);
//               employees.splice(index, 1);
//             }
//           }
//         });
//       }
//       console.log('gilbert');
//       console.log(rollUps);
//       console.log(employees);
//     }
//   });
// });

module.exports = router;
