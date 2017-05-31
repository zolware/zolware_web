var Component = require('../models/component').Component;
var State = require('../models/state');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ModelSchema = new Schema({
  name: String,
  description: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  datasource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DataSource'
  },
//   states : [{
//     //_id:false,
//     type: {type: String},
//     name: {type: String},
//   }],
  states: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'State'
  }],
  components: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Component'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  running: {
    type: Boolean,
    default: false
  },
});

ModelSchema.pre('remove', function(next) {
    // 'this' is the client being removed. Provide callbacks here if you want
    // to be notified of the calls' result.
    Component.remove({model: this._id}).exec();
    State.remove({model: this._id}).exec();
    next();
});

module.exports = mongoose.model('Model', ModelSchema)