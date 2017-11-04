var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var multer = require('multer');
var fs = require('fs');

var configDB = require('./config/database.js');
var index = require('./routes/posting.js');

var app = express();
app.use(express.static(path.join(__dirname, 'public')));

// configuration ===============================================================
mongoose.connect(configDB.url).then(
  () => {console.log('connected !')},
  err => {console.log('error connecting !')}
);

require('./config/passport')(passport); // pass passport for configuration

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser()); /////
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// required for passport
var sessionParams = { secret: 'ilovescotchscotchyscotchscotch',maxAge: new Date(Date.now() + 3600000),

}
//  save user session in database only in dev environment
if(process.env.NODE_ENV=='dev') {
  sessionParams.store = new MongoStore(
    {mongooseConnection:mongoose.connection
    })
}

app.use(session( sessionParams)); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session




// routes ======================================================================
require('./routes/profile.js')(app, passport); // load our routes and pass in our app and fully configured passport

app.use(index);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
