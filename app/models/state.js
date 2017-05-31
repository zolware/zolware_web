var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var StateSchema = new Schema({
  name: String,
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
  type: {
    type: String,
    default: "signal"
  },
});

StateSchema.pre('remove', function(next) {
    // 'this' is the client being removed. Provide callbacks here if you want
    // to be notified of the calls' result.
    //Component.remove({model_id: this._id}).exec();
    next();
});

module.exports = mongoose.model('State', StateSchema)