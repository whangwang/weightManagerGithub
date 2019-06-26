var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var mongoose = require('mongoose');
mongoose.connect('MONGOPATH', {useNewUrlParser: true});
require('./models/coupon.js');
require('./models/notification.js');
require('./models/users.js');

const session = require('express-session');

var app = express();
const MongoStore = require('connect-mongo')(session);
app.use(session({
    store: new MongoStore({ mongooseConnection: mongoose.connection, ttl: 30 * 24 * 60 * 60 }),
    secret: 'ms300k',
    resave: false,
    saveUninitialized: false
}));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//-----admin Routes
app.use('/admin', require('./routes/admin/index'));
//-----web Routes
app.use(require('./routes/index'));


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
