var DataSource = require('../models/data_source').DataSource;
var Signal = require('../models/signal');

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var Promise = require('bluebird');

var moment = require('moment');

exports.getSignalById = function(req, res) {
  var datasource_id = req.params.datasource_id
  var signal_id = req.params.signal_id;
  var user = req.user;

  DataSource.findOne({
    '_id': datasource_id,
    'user': user
  }).exec(function(err, datasource) {
    var signal = datasource.signals.id(mongoose.Types.ObjectId(signal_id));
    if (err || !signal)
      res.json({
        status: 0,
        message: 'Signal not found'
      });
    else
      res.json({
        status: 1,
        signal: signal,
      });
  });
}




exports.getDataFromSignal = function(req, res) {
  var datasource_id = req.params.datasource_id
  var signal_id = req.params.signal_id
    // Get the authenticated user
  var user = req.user;

  var ungrouped = (typeof req.query.ungrouped === 'undefined') ? "false" : req.query.ungrouped;
  var sortParam = (typeof req.query.sort === 'undefined') ? "asc" : req.query.sort;
  var sort = (sortParam === 'asc') ? 1 : -1;

  Signal.aggregate([{
      $match: {
        _id: mongoose.Types.ObjectId(signal_id),
        user: mongoose.Types.ObjectId(user._id)
      }
    }, {
      $unwind: "$measurements"
    }, {
      $project: {
        _id: 0,
        datetime: '$measurements.datetime',
        value: '$measurements.value'
      },
    },
    //{ $limit : -1 },{ $skip : 0 },
    {
      $sort: {
        datetime: sort
      }
    }
  ], function(err, signal) {

    if (ungrouped === "false") {
      var dates = [];
      var values = [];
      signal.forEach(function(entry) {
        dates.push(entry.datetime);
        values.push(entry.value);
      })
      res.json({
        status: 1,
        count: dates.length,
        datetimes: dates,
        values: values,
      });
    } else {
      res.json({
        status: 1,
        data: signal,
      });
    }
  });
}



exports.getDataFromDataSource = function(req, res) {
  var datasource_id = req.params.datasource_id
  var signal_id = req.params.signal_id
    // Get the authenticated user
  var user = req.user;

  var ungrouped = (typeof req.query.ungrouped === 'undefined') ? "false" : req.query.ungrouped;
  var sortParam = (typeof req.query.sort === 'undefined') ? "asc" : req.query.sort;
  var sort = (sortParam === 'asc') ? 1 : -1;

  var criteria = {};
  criteria = {
    '_id': datasource_id,
    'user': user,
  };

  DataSource.findOne(criteria).select('signals')
    .populate('signals', '-measurements -datetimes -last_data -status -data_type -user -name -periodic_mag -periodic_delay -periodic_period -linear_gradient -linear_delay -dt')
    .exec(function(err, datasource) {
      var promises = [];
      var dataouter = {
        data: []
      };

      var signals = datasource.signals;
      signals.forEach(function(signal) {

        promises.push(
          Signal.findOne({
            _id: signal._id
          }).select('measurements name').exec()
        );
      })

      Promise.all(promises).then(function(signalsFromPromises) {
        signalsFromPromises.forEach(signal => {
          if (signal_id == null || (signal_id == signal._id)) {
            var dates = [];
            var values = [];
            var compound = {};
            compound.name = signal.name;
            compound.signal = signal._id;
            signal.measurements.sort(function(d1, d2) {
              return (d1.datetime - d2.datetime) * sort;
            }).forEach(function(value) {
              dates.push(value.datetime);
              values.push(value.value);
            })
            compound.dates = dates;
            compound.values = values;
            dataouter.data.push(compound);
          }
        });
        res.json(dataouter);
      });
    });
}


exports.processNewMeasurements = function(signal, measurements) {
  
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


exports.addDataToSignal = function(req, res) {

  var signal_id = req.params.signal_id
  var jsonData = req.body;
  var user = req.user;

  var criteria = {};
  criteria = {
    '_id': signal_id,
    'user': user,
  };

  Signal.findOneAndUpdate(
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
        message: "No signal found with ID"
      });
    } else {

      signal = exports.processNewMeasurements(signal, jsonData);

      signal.save(function(err_signall) {
        res.json({
          status: 1,
          data: jsonData
        });
      })
    }
  });


}



exports.editSignal = function(req, res) {
  console.log("HERE");
  var signal_id = req.params.signal_id;
  var name = req.body.name;
  var description = req.body.description;
  var authenticatedUser = req.user;

  if (signal_id === "")
    res.json({
      staus: -1,
      message: "Could not find signal with ID " + signal_id
    });

  Signal.findOne({
    _id: signal_id,
    'user': authenticatedUser
  }, function(err, signal) {
    if (err) {
      res.send(err);
    }

    signal.name = name;
    signal.description = description;

    signal.save(function(err, signal) {
      if (err) {
        res.send(err);
      }
      res.json(signal);
    });

  })


}
