// Dependencies
var request = require('request');
var moment = require('moment');

// Local libraries
var datalib = require('../lib/datalib.js');

var DataSource = require('../models/data_source').DataSource;
var Project = require('../models/project');
var Signal = require('../models/data_source').Signal;
var Model = require('../models/model');

var ShareToken = require('../models/datashare_token');

var signalAPIService = require('../services/SignalAPIService');

var mongoose = require('mongoose');
var asyncR = require('async');

var hat = require('hat');




var santizeUserObjects = function(users) {
  var cleanUsers = [];
  for (i = 0; i < users.length; i++) { 
    var cleanUser = {
      displayName: users[i].local.displayName,
      //email: users[i].local.email,
    }
     console.log(cleanUser);
    cleanUsers.push(cleanUser);
  }
  return cleanUsers;
}

var santizeUserObject = function(user) {
  return santizeUserObjects([user])[0];
}


exports.getAllDataSourcesForUser = function(req, res) {
  var authenticatedUser = req.user;

  var criteria = {};
  criteria = {
    'user': authenticatedUser,
  };

  DataSource.find(criteria).populate('projects', 'name').exec(function(err_datasource, datasources) {
    if (err_datasource || !datasources.length) {
      res.json({
        status: 0,
        message: "No datasources found for user.",
        datasources: []
      });
    } else {
      
      var userDataSources = datasources;

      /* lets get shared datasources */
      ShareToken.find(
        {sharedWithUser:authenticatedUser.local.email})
        .populate('datasource').lean().populate('sharedByUser').exec(function(err_sharedDatasource, sharedDatasources) {

      sharedDatasources.forEach(function(dataSource) {
       
       dataSource.sharedByUser = santizeUserObject(dataSource.sharedByUser);
      })
      
      res.json({
        status: 1,
        datasources: userDataSources,
        shared_datasources: sharedDatasources
      });
      
      
      });
      
    }
  });
}




exports.addDataSource = function(req, res) {
  var datasourceName = req.body.datasource_name;
  var datasourceDescription = req.body.datasource_description;
  var authenticatedUser = req.user;

  var newDataSource = DataSource({
    name: datasourceName,
    description: datasourceDescription,
    user: authenticatedUser
  });

  newDataSource.save(function(err) {
    if (err)
      res.json({
        status: 0,
        message: 'DataSource not saved'
      });
    else
      res.json({
        status: 1,
        message: 'DataSource saved successfully'
      });
  });
};




exports.getDataSourceById = function(req, res) {
  var datasource_id = req.params.datasource_id;
  var authenticatedUser = req.user;

  DataSource.findOne({
    '_id': datasource_id,
    'user': authenticatedUser
  }).populate('signals', '-measurements').exec(function(err, datasource) {
    //}).populate('signals -measurements').exec(function(err, datasource) {
    if (err)
      res.json({
        status: 0,
        message: 'Data source not found'
      });
    else
      res.json({
        status: 1,
        datasource: datasource,
      });
  });
}





exports.editDataSource = function(req, res) {
  var datasource_id = req.params.datasource_id;
  var name = req.body.datasourcename;
  var description = req.body.datasourcedescription;
  var authenticatedUser = req.user;

  if (datasource_id === "")
    res.json({
      staus: -1,
      message: "Could not find datasource with ID " + datasource_id
    });

  DataSource.findOne({
    _id: datasource_id,
    'user': authenticatedUser
  }, function(err, datasource) {
    if (err) {
      res.send(err);
    }

    datasource.name = name;
    datasource.description = description;

    datasource.save(function(err, datasource) {
      if (err) {
        res.send(err);
      }
      res.json(datasource);
    });

  })


}



exports.deleteDataSource = function(req, res) {
  var datasource_id = req.params.datasource_id;
  var authenticatedUser = req.user;

  if (datasource_id === "")
    res.json({
      staus: -1,
      message: "Could not find datasource with ID " + datasource_id
    });

  DataSource.findOne({
    _id: datasource_id,
    'user': authenticatedUser
  }).remove(function(err, datasource) {
    if (err) {
      res.send(err);
    }


    Project.findOne({
        'datasources.oid': datasource_id
      }, {
        'datasources.$': 1
      },
      function(err, project) {

        if (project) {

        } else {

        }
      }
    )

    res.json(datasource);

  })




}




exports.getAllDataSourcesForProject = function(req, res) {
  var project_id = req.params.project_id
  var authenticatedUser = req.user;

  var criteria = {};
  criteria = {
    'project_id': project_id,
  };

  DataSource.find(criteria, function(err, datasources) {

    if (err || !datasources.length) {
      res.json({
        status: 0,
        datasources: [{
          id: 0,
          name: 'No datasources found for project'
        }]
      });
    } else {
      var returnedDataSources = datasources;
      res.json({
        status: 1,
        datasources: returnedDataSources
      });
    }
  });
}



exports.getAllSignalsFromDataSource = function(req, res) {
  var datasource_id = req.params.datasource_id;
  // Get the authenticated user
  var authenticatedUser = req.user;

  var depth = req.query.depth;
  var populateSelector = "";
  if (depth === undefined)
    populateSelector = '';
  else
    populateSelector = depth.replace(',', ' ');

  var criteria = {};
  criteria = {
    '_id': datasource_id,
    'user': authenticatedUser,
  };

  DataSource.findOne(criteria).populate('signals', populateSelector).exec(function(err, datasource) {

    if (err || !datasource) {

      res.json({
        status: 0,
        message: "No signals defined",
        signals: []
      });
    } else {
      var signals = datasource.signals;
      res.json({
        status: 1,
        signals: signals
      });
    }
  });
}








var constructSignal = function(form_data) {
  var signal = null;
  if (form_data.signal_type === "generated_signal") {

    var linear_gradient = parseFloat(form_data.signal_linear_gradient);
    var linear_delay = parseInt(form_data.signal_linear_delay);
    var periodic_delay = parseInt(form_data.signal_periodic_delay);
    var periodic_mag = parseInt(form_data.signal_periodic_mag);
    var periodic_period = parseInt(form_data.signal_periodic_period);

    signal = new Signal({
      name: form_data.signal_name,
      dt: form_data.signal_dt,
      data_type: "RG",
      linear_gradient: linear_gradient,
      periodic_mag: form_data.signal_periodic_mag,
      periodic_period: form_data.signal_periodic_period
    });

    var today = moment();
    var date = moment(form_data.start_date);

    var dt_minutes = form_data.signal_dt;

    var measurements = [];

    console.log(form_data);
    var counter = 0;
    var linear_counter = 0;
    var periodic_counter = 0;
    for (var m = date; m.diff(today, 'minutes') <= 0; m.add(dt_minutes, 'minutes')) {
      var linearDelayFlag = (counter >= linear_delay) ? 1 : 0;
      var periodicDelayFlag = (counter >= periodic_delay) ? 1 : 0;
      var periodicComponent = 0; //periodic_period%periodic_counter;
      var newValue = datalib.generateInitialData(0, 2) + linear_counter * linear_gradient + periodic_counter * periodicComponent;
      var value = {
        datetime: m.format("YYYY-MM-DD hh:mm:ss"),
        value: newValue
      };

      measurements.push(value);
      linear_counter = linear_counter + linearDelayFlag;
      periodic_counter = periodic_counter + periodicDelayFlag;
      counter++;
    }

    signal = signalAPIService.processNewMeasurements(signal, measurements);
    signal.measurements = measurements;
    signal.data_count = measurements.length;
  } else if (form_data.signal_type === "general_signal") {
    signal = new Signal({
      name: form_data.signal_name,
      dt: form_data.signal_dt,
      data_type: "General"
    });
  } else if (form_data.signal_type === "sensor_signal") {
    signal = new Signal({
      name: form_data.signal_name,
      dt: form_data.signal_dt,
      data_type: "Sensor",
      sensor_location: form_data.sensor_location,
      sensor_type: form_data.sensor_type,
      sensor_uri: form_data.sensor_uri,
      sensor_data_type: form_data.sensor_data_type,
    });
  }
  return signal;
}



//datalib.generateInitialData(0,2);

exports.addSignalToDataSource = function(req, res) {
  var datasource_id = req.params.datasource_id
  var user = req.user;
  var criteria = {};
  criteria = {
    '_id': datasource_id,
    'user': user,
  };

  DataSource.findOne(criteria).exec(function(err_find, datasource) {

    if (err_find) {

      res.json({
        status: 0,
        message: "No signals defined"
      });
    } else {

      //Validate and sanitize
      var signal = constructSignal(req.body);
      signal.user = user;

      signal.save(function(err_signal) {
        datasource.signals.push(signal);
        datasource.save(function(err_save) {
          if (!err_save && !err_signal) {
            res.json({
              status: 1,
              datasource: datasource,
              signal: signal
            });
          }
        });

      });
    }
  });
}






exports.deleteSignalFromDataSource = function(req, res) {
  var datasource_id = req.params.datasource_id;
  var signal_id = req.params.signal_id;
  var authenticatedUser = req.user;

  var criteria = {};
  criteria = {
    '_id': datasource_id,
    'user': authenticatedUser,
  };
  DataSource.findOne(criteria).exec(function(err_find, datasource) {
    if (err_find) {
      res.json({
        status: 0,
        message: "No signals defined"
      });
    } else {
      datasource.signals.pull(mongoose.Types.ObjectId(signal_id));
      datasource.save(function(err_save) {

        Signal.findOne({
          '_id': signal_id
        }).remove(function(err_remove, signal) {

          //Find model and re-do the states
          Model.find({
            'datasource': datasource_id,
            'user': authenticatedUser,
          }).exec(function(err_models, models) {

            models.forEach(function(model) {
              model.states = [];
              datasource.signals.forEach(function(signal) {
                model.states.push({
                  "name": signal.name,
                  "type": "from signal"
                });
              });

            });



            if (!err_save) {
              res.json({
                status: 1,
                datasource: datasource,
              });
            }


          });


        });




      });
    }
  });
}




// --- Sharing


exports.addDataSourceShareToken = function(req, res) {
  var datasource_id = req.params.datasource_id
  var authenticatedUser = req.user;
  var sharedWithUser = req.body.sharewith;

  var criteria = {};
  criteria = {
    '_id': datasource_id,
    'user': authenticatedUser,
  };

  DataSource.findOne(criteria).exec(function(err_find, datasource) {

    if (err_find) {

      res.json({
        status: 0,
        message: "No signals defined"
      });
    } else {

      var token = hat();

      var sharetoken = new ShareToken({
        datasource: datasource,
        sharedByUser: authenticatedUser,
        sharedWithUser: sharedWithUser,
        token: token
      });

      sharetoken.save(function(err_save) {
        if (!err_save) {
          res.json({
            status: 1,
            sharetoken: sharetoken
          });
        }
      });
    }
  });
}



exports.getAllShareTokensForDataSource = function(req, res) {
  var datasource_id = req.params.datasource_id
  var authenticatedUser = req.user;

  var criteria = {};
  criteria = {
    'datasource': datasource_id,
    'sharedByUser': authenticatedUser,
  };

  ShareToken.find(
    criteria
  ).exec(function(err, sharetokens) {

    if (err || !sharetokens.length) {
      res.json({
        status: 0,
        sharetokens: [{
          id: 0,
          name: 'No sharetokens found for user'
        }]
      });
    } else {
      res.json({
        status: 1,
        sharetokens: sharetokens
      });
    }
  });
}


exports.deleteShareTokenFromDataSource = function(req, res) {
  var datasource_id = req.params.datasource_id;
  var share_id = req.params.share_id;
  var authenticatedUser = req.user;

  var criteria = {
    $and: [
          {'_id': share_id},
          { $or: [{'sharedByUser': authenticatedUser}, {'sharedWithUser': authenticatedUser.local.email}] }
      ]
  }

  ShareToken.findOne(criteria).remove(function(err, sharetoken) {
    if (err) {
      res.json({
        status: 0,
        message: "No sharetoken defined"
      });
    } else {
      if (!err) {
        res.json({
          status: 1,
          sharetoken: sharetoken,
        });
      }
    }
  });
}



