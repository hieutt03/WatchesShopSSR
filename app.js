var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const passport = require("passport");
const MongoStore = require("connect-mongo");


var indexRouter = require('./routes/index');
const connectDB = require('./config/database');
const session = require('express-session');
const mongoose = require('mongoose');
const { Member } = require('./model');
const LocalStrategy = require('passport-local').Strategy; 

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
app.use(indexRouter)

// connect DB
connectDB();

app.use(session({
  secret: "watchesPRJ",
  saveUninitialized: true,
  resave: false,
  cookie: {
    maxAge: 60000 * 60
  },
  store: MongoStore.create({
    client: mongoose.connection.getClient()
  })
}))

app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(Member.serializeUser()); 
passport.deserializeUser(Member.deserializeUser()); 
 
passport.use(new LocalStrategy(Member.authenticate())); 
// passport.serializeUser(function (user, cb) {
//   cb(null, user);
// });

// passport.deserializeUser(function (obj, cb) {
//   cb(null, obj);
// });

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
