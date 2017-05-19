var mongoose = require('mongoose'),
  extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;

var ComponentSchema = new Schema({
  name: String,
  description: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  model: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Model'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
}, { collection : 'components', discriminatorKey : '_type' });

var VectorSchema = ComponentSchema.extend({
  rows: {type: String, default: "2"},
  values: {type: String, default: "[1,2]"},
});

var MatrixSchema = ComponentSchema.extend({
  cols: {type: String, default: "2"},
  rows: {type: String, default: "2"},
  values: {type: String, default: "[[0,0],[0,0]]"},
});

var KalmanFilterSchema = ComponentSchema.extend({
  datasource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DataSource'
  },
  component_type: {
    type: String,
    default: "kalman"
  },
  A: {type: String, default: "[[1,2],[3,4]]"},
  R: {type: String, default: "[[1,2],[3,4]]"},
  H: {type: String, default: "[[1,2],[3,4]]"},
  Q: {type: String, default: "[[1,2],[3,4]]"},
});

module.exports.Component = mongoose.model('Component', ComponentSchema)
module.exports.Vector = mongoose.model('Vector', VectorSchema)
module.exports.Matrix = mongoose.model('Matrix', MatrixSchema)
module.exports.KalmanFilter = mongoose.model('KalmanFilter', KalmanFilterSchema)