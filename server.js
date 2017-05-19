// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var app      = express();
var port     = process.env.SERVER_PORT;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');
var path = require('path');
var i18n = require("i18n");

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

var configDB = require('./config/database.js');

var MongoStore = require('connect-mongo/es5')(session);

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)

app.use(i18n.init);

app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));

i18n.configure({
    locales:['en', 'fr'],
    directory: __dirname + '/locales'
});

//app.use(express.json());       // to support JSON-encoded bodies
//app.use(express.urlencoded()); // to support URL-encoded bodies

app.set('view engine', 'ejs'); // set up ejs for templating

//app.use(express.static('public'));
//app.use(express.static(__dirname + '/public'));
app.use('/static', express.static(path.join(__dirname, 'public')))
//app.use("/public", express.static(__dirname + '/public'));

// required for passport
//app.use(session({ secret: process.env.SESSION_SECRET })); // session secret

app.use(session({
  secret: 'ilovescotchscotchyscotchscotch' ,
  cookie : {
    maxAge: 3600000, // see below
    rolling: true,
    resave: true, 
  },
  rolling: true,
    store   : new MongoStore({
        url  : configDB.url
    })
}));


app.use(passport.initialize());

app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// forward all requests to /s/* to /index.html
app.use(function(req, res, next) {
  //var re = /\/(.*)/;
  //var results = req.url.match(re);
  next();
});


// routes ======================================================================
require('./app/routes/routes.js')(app);
require('./app/routes/loginroutes.js')(app, passport); // load our routes and pass in our app and fully configured passport
require('./app/routes/projectroutes.js')(app);
require('./app/routes/datasourceroutes.js')(app);
require('./app/routes/modelroutes.js')(app);
require('./app/routes/plotroutes.js')(app);

// launch ======================================================================
app.listen(port);
console.log('Server started on port ' + port);

// Export for testing
module.exports = app;
