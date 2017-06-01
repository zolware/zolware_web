var mongoose = require('mongoose'),
    extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;



var SignalSchema = new Schema({
  name: {
    type: String,
    default: ""
  },
  description: {
    type: String,
    default: 'No description'
  },
  index: {
    type: Number,
    default: ""
  },
  sensor_location: {
    type: String,
    default: ""
  },
  sensor_uri: {
    type: String,
    default: ""
  },
  sensor_type: {
    type: String,
    default: ""
  },
  file_read_lines: {
    type: Number,
    default: 0
  },
  units: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  data_type: {
    type: String,
    default: "RG"
  },
  status_msg: {
    type: String,
    default: ""
  },
  status: {
    type: Boolean,
    default: true
  },
  dt: {
    type: Number,
    default: 0
  },
   linear_delay: {
    type: Number,
    default: 0
  },
  linear_gradient: {
    type: Number,
    default: 0
  },
  periodic_delay: {
    type: Number,
    default: 0
  },
  periodic_mag: {
    type: Number,
    default: 0
  },
  periodic_period: {
    type: Number,
    default: 0
  },
  last_data: {
    type: Date,
    default: new Date(1990, 0, 1)
  },
  measurements : [{
      _id:false,
      datetime : Date,
      value : Number
  }],
  Yrange: {
    min: {type: Number, default: 0},
    max: {type: Number, default: 0}
  },
  Xrange: {
    min: {type: Date, default: new Date(1900, 0, 1)},
    max: {type: Date, default: new Date(1900, 0, 1)}
  },
  data_count : {type: Number, default: 0}
 });

var DataSourceSchema = new Schema({
  name: String,
  description: String,
  status: {
    type: String,
    default: "Not setup"
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tags: [{
    type: String
  }],
  type: {
    type: String,
    default: "test_signals"
  },
  dt: {
    type: Number,
    default: 0
  },
  numcols: {
    type: Number,
    default: 1
  },
  signals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Signal'
  }],
  file_uri: {
    type: String,
    default: ""
  },
  s3_bucket: {
    type: String,
    default: ""
  },
  s3_file: {
    type: String,
    default: ""
  },
  data_source: {
    type: String,
    default: "data_source_file"
  },
  data_format: {
    type: String,
    default: "csv"
  },
  file_data_col_names: {
    type: String,
    default: "['date','data']"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
}, {
  collection: 'data_sources',
  discriminatorKey: '_type'
});

var DataFileSchema = DataSourceSchema.extend({
  fileUri: String,
  default: ""
});


module.exports.DataSource = mongoose.model('DataSource', DataSourceSchema)
module.exports.DataFile = mongoose.model('DataFile', DataFileSchema)
module.exports.Signal = mongoose.model('Signal', SignalSchema)