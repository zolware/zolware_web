var mongoose = require('mongoose'),
  extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;

var Signal = require('./signal');



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
 measurements: [{
    _id: false,
    datetime: {type: Date}, 
    values: [{type: Number}]
  }],
   Yrange: {
    min: {
      type: String,
      default: ""
    },
    max: {
      type: String,
      default: ""
    }
  },
  Xrange: {
    min: {
      type: Date,
      default: new Date(1900, 0, 1)
    },
    max: {
      type: Date,
      default: new Date(1900, 0, 1)
    }
  },
  last_data: {
    type: Date,
    default: new Date(1990, 0, 1)
  },
  numcols: {
    type: Number,
    default: 1
  },
  file_line_cursor: {
    type: Number,
    default: 0
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
  data_count: {
    type: Number,
    default: 0
  }
}, {
  collection: 'data_sources',
  discriminatorKey: '_type'
});


DataSourceSchema.pre('remove', function(next) {
  Signal.remove({
    datasource: this._id
  }).exec();
  next();
});


module.exports.DataSource = mongoose.model('DataSource', DataSourceSchema)