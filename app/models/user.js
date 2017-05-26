
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({
    isAdmin: { type: Boolean, default: false },
    firstLogin: { type: Boolean, default: true },
    token: String,
    recentMessages: Number,
    recentComments: Number,
    location: {
      city: { type: String, required: false },
      country: { type: String, required: false },
     },
    feed: {
      lastTwitterID :  { type: Number, default: 1, required: false }
    },
    local            : {
        email        : String,
        password     : String,
        displayName  : {type: String, default: "notset"},
        resetPasswordToken: String,
        resetPasswordExpires: Date
    },
    facebook         : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },
    twitter          : {
        id           : String,
        token        : String,
        tokenSecret  : String,
        displayName  : String,
        username     : String
    },
    google           : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    }

});

userSchema.post('save', function(doc) {
  //var token = hat();
  //doc.token = token;
  //doc.save();
});


userSchema.methods.getSafeUser = function() {
   var user = this;
   //filter user as per your requirements here.
  
  

   return user;
}

// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
