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
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  datasource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Datasource'
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
  units: String,
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
  datestamp_format: {
    type: String,
    default: "yyy-mm-dd hh:mm:ss"
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
  measurements: [{
    _id: false,
    datetime: Date,
    value: [{
      type: Number
    }]
  }],
  Yrange: {
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 0
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
  data_count: {
    type: Number,
    default: 0
  }
});

SignalSchema.post('save', function(doc) {
  //Add an index for sorting signals and finding in the correct order
   mongoose.model('Signal').count({datasource:doc.datasource}, function(err, c) {
     doc.index = c;
     doc.save();
   });
});

module.exports = mongoose.model('Signal', SignalSchema)