const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const routes = require('./routes/index');
const books = require('./routes/books');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// Static middleware for serving static files. This was automatically generated by Express Generator.
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/books', books);

/* ERROR HANDLERS */
/* 404 handler to catch undefined or non-existent route requests */
// Catch 404 and Forward to Error Handler
app.use( (req, res, next) => {
  console.log('404 error handler called');
  const err = new Error();
  err.status = 404;
  err.message = `Sorry! We couldn't find the page you were looking for.`;
  next(err);
});


// Global Error Handler
app.use((err, req, res, next) => {

  // check if there's an error
  if (err) {
    console.log('Global error handler called', err);
  }

  // if 404 error occurs, then render `page-not-found`
  if (err.status === 404) {
    err.message = `Sorry! We couldn't find the page you were looking for.`;
    res.status(404).render('page-not-found', { err, title: "Page Not Found" });
  } else {
    console.log(`Oops! Something went wrong on the server`);
    console.log(`Error status: ${err.status}`);
    console.log(`Error message: ${err.message}`);
    err.message = err.message || `Oops!  It looks like something went wrong on the server.`;
    res.status(err.status || 500).render('error', { err, title: "Server Error" });
  }
});

module.exports = app;
