const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const routes = require('./routes/index');
const books = require('./routes/books');

const app = express();

// Static middleware for serving static files
app.use('/static', express.static('public'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/books', books);

/* ERROR HANDLERS */
/* 404 handler to catch undefined or non-existent route requests */
// Catch 404 and Forward to Error Handler
app.use( (req, res, next) => {
  console.log('404 error handler called');
  const err = new Error("Sorry! We couldn't find the page you were looking for..");
  err.status = 404;
  next(err);
});


// Global Error Handler
app.use((err, req, res, next) => {
  if (err.status === 404) {
    res.status(404).render('page-not-found', { err, title: "Page Not Found" });
  } else {
    console.log(`The server returned an internal error`);
    err.message = err.message || `Oops!  It looks like something went wrong on the server.`;
    res.status(err.status || 500).render('error', { err, title: "Server Error" });
  }
});

module.exports = app;
