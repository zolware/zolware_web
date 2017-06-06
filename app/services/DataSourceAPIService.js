// Dependencies
var request = require('request');
var moment = require('moment');

// Local libraries
var utils = require('../lib/utils.js');
var datalib = require('../lib/datalib.js');

var DataSource = require('../models/data_source').DataSource;
var Project = require('../models/project');
var Signal = require('../models/signal');
var Model = require('../models/model');
var ShareToken = require('../models/datashare_token');
var signalAPIService = require('../services/SignalAPIService');
var mongoose = require('mongoose');
var asyncR = require('async');

var hat = require('hat');

var validator = require('validator');


exports.getAllDataSourcesForUser = function(req, res) {
	var authenticatedUser = req.user;

	var sort = req.query.sort;
	sort = (typeof req.query.sort === 'undefined') ? "desc" : sort;
	var sortInt = (sort === 'desc') ? -1 : 1;

	var criteria = {
		'user': authenticatedUser,
	};

	DataSource.find(criteria)
		.sort({
			name: sort
		})
		.populate('projects', 'name')
		.exec(function(err_datasource, datasources) {
			if (err_datasource || !datasources.length) {
				res.json({
					status: 0,
					message: "No datasources found for user.",
					datasources: []
				});
			} else {
				var userDataSources = datasources;
				/* lets get shared datasources */
				ShareToken.find({
						sharedWithUser: authenticatedUser.local.email
					})
					.populate('datasource').lean().populate('sharedByUser').exec(function(err_sharedDatasource, sharedDatasources) {
						sharedDatasources.forEach(function(dataSource) {
							dataSource.sharedByUser = utils.santizeUserObject(dataSource.sharedByUser);
						})
						res.set('X-Total-Count', datasources.length.toString());
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

	var newDataSource = DataSource(
		req.body
	);
	// Set the user
	newDataSource.user = authenticatedUser;

	newDataSource.save(function(err, newDataSource) {
		if (err)
			res.json({
				status: 0,
				message: 'Datasource not saved'
			});
		else
			res.json({
				status: 1,
				message: 'Datasource saved successfully',
				links: {
					href: '/datasources/' + newDataSource._id
				},
				datasource: {
					name: newDataSource.name,
					description: newDataSource.description,
				}
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
	}, function(err, datasource) {
		if (err) {
			res.send(err);
		} else {
			datasource.remove();
			res.json({
				status:0,
				message: "Datasource " + datasource._id + " successfully removed."
			});
		}
	})
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

	DataSource.findOne(criteria)
		.sort('-index')
		.populate('signals', populateSelector).exec(function(err, datasource) {
		console.log(err);

		if (err || !datasource) {

			res.json({
				status: 0,
				err: err,
				message: "No signals defineds",
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
	var signal = new Signal({});
	signal.name = form_data.signal_name;
	signal.description = form_data.signal_description;

	if (form_data.signal_type === "timestamp") {
		signal.data_type = "Timestamp";
	} else if (form_data.signal_type === "generated_signal") {

		var linear_gradient = parseFloat(form_data.signal_linear_gradient);
		var linear_delay = parseInt(form_data.signal_linear_delay);
		var periodic_delay = parseInt(form_data.signal_periodic_delay);
		var periodic_mag = parseInt(form_data.signal_periodic_mag);
		var periodic_period = parseInt(form_data.signal_periodic_period);

		signal.data_type = "RG";
		signal.linear_gradient = linear_gradient;
		signal.periodic_mag = form_data.signal_periodic_mag;
		signal.periodic_period = form_data.signal_periodic_period;

		var today = moment();
		var date = moment(form_data.start_date);

		var dt_minutes = form_data.signal_dt;

		var measurements = [];

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
		signal.data_type = "General";
	} else if (form_data.signal_type === "sensor_signal") {
		signal.data_type = "Sensor data",
			signal.sensor_location = form_data.sensor_location;
		signal.sensor_type = form_data.sensor_type;
		signal.file_uri = form_data.file_uri;
		signal.sensor_data_source = form_data.sensor_data_source;
	}
	return signal;
}




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
			signal.datasource = datasource;

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

				Signal.findOne({'_id': signal_id}).remove(function(err_remove, signal) {
					//Find model and re-do the states
			//		Model.find({
			//			'datasource': datasource_id,
		//				'user': authenticatedUser,
		//			}).exec(function(err_models, models) {

// 						models.forEach(function(model) {
// 							model.states = [];
// 							datasource.signals.forEach(function(signal) {
// 								model.states.push({
// 									"name": signal.name,
// 									"type": "from signal"
// 								});
// 							});

// 						});

						if (!err_save) {
							res.json({
								status: 1,
								datasource: datasource,
							});
						}

					//});


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
		$and: [{
			'_id': share_id
		}, {
			$or: [{
				'sharedByUser': authenticatedUser
			}, {
				'sharedWithUser': authenticatedUser.local.email
			}]
		}]
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

exports.processNewMeasurements = function(datasource, measurements) {
  
  var newMeasurements = measurements;
  var measurementsArray = [];
  var datesArray = [];
  newMeasurements.forEach(function(value) {
    var newDate = value.datetime;
    datesArray.push(moment(newDate));
    var newValue = value.value;
    measurementsArray.push(newValue);
  });

  var maxDateNew = moment.max(datesArray)
  var maxValueNew = Math.max.apply(Math, measurementsArray);
  var minDateNew = moment.min(datesArray)
  var minValueNew = Math.min.apply(Math, measurementsArray);

  // Not the first data
  if (signal.data_count > 0) {
    var tempXMax = moment(signal.Xrange.max);
    var tempXMin = moment(signal.Xrange.min);

    signal.Xrange = {
      max: moment.max(maxDateNew, moment(tempXMax)).format("YYYY-MM-DD hh:mm:ss"),
      min: moment.min(minDateNew, moment(tempXMin)).format("YYYY-MM-DD hh:mm:ss")
    };

    var tempYMax = signal.Yrange.max;
    var tempYMin = signal.Yrange.min;
    signal.Yrange = {
      max: Math.max(tempYMax, maxValueNew),
      min: Math.min(tempYMin, minValueNew)
    };
  } else {
    signal.Xrange = {
      max: maxDateNew.format("YYYY-MM-DD hh:mm:ss"),
      min: minDateNew.format("YYYY-MM-DD hh:mm:ss")
    };
    signal.Yrange = {
      max: maxValueNew,
      min: minValueNew
    };
  }
  return signal;
}

exports.addMeasurementDataToDatasource = function(req, res) {
	var datasource_id = req.params.datasource_id
  var jsonData = req.body;
  var user = req.user;
	
	console.log(jsonData);

  var criteria = {};
  criteria = {
    '_id': datasource_id,
    'user': user,
  };

  DataSource.findOneAndUpdate(
    criteria, {
      $push: {
        "measurements": {
          $each: jsonData
        }
      },
      $inc: {
        data_count: jsonData.length
      }
    }, {
      safe: true,
      upsert: false
    }
  ).exec(function(err, signal) {
    if (err || !signal) {
      console.log(err);
      res.json({
        status: 0,
        message: "No datasource found with ID"
      });
    } else {

      //signal = exports.processNewMeasurements(signal, jsonData);

     // signal.save(function(err_signall) {
      //  res.json({
      //    status: 1,
     //     data: jsonData
     //   });
    //  })
    }
  });
}