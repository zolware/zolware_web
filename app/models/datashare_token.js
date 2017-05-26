var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DataShareTokenSchema = new Schema({
  sharedByUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  datasource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DataSource'
  },
  token: {
    type: String
  },
  sharedWithUser:{
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
});

module.exports = mongoose.model('DataShareToken', DataShareTokenSchema)