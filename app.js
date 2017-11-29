var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var resourceRoutes = require('./routes/resource');
var appRoutes = require('./routes/app');

var app = express();

// user multer !
var fileUpload = require('express-fileupload');


// view engine setup
// app.set('views', path.join(__dirname, 'dist'));
// app.set('view engine', 'ejs');
// app.engine('html', require('ejs').renderFile);


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(fileUpload());
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
    if (key !== key.toLowerCase()) {
      console.log('QUERY PARAMETERS SHOULD BE LOWERCASE: ' + key + ' in ' + JSON.stringify(req.query));
      // the one-liner below produces duplicate keys that only differ by capitalization
      req.query[key.toLowerCase()] = req.query[key];
      delete req.query[key];
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
