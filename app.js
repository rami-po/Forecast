var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var resourceRoutes = require('./routes/resource');
var appRoutes = require('./routes/app');

var app = express();


// view engine setup
// app.set('views', path.join(__dirname, 'dist'));
// app.set('view engine', 'ejs');
// app.engine('html', require('ejs').renderFile);


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use(express.static(path.join(__dirname, 'dist')));

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT, PATCH, DELETE, OPTIONS');
  next();
});

app.use(function(req, res, next) {
  for (var key in req.query) {
    req.query[key.toLowerCase()] = req.query[key];
    if (key.toLowerCase() === 'employeeid' && isNaN(key)) {
      req.query[key.toLowerCase()] = '\'' + req.query[key] + '\'';
    }
  }
  next();
});

app.use('/resource', resourceRoutes);
app.use('/', appRoutes);

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   res.render('index.html');
// });


module.exports = app;
