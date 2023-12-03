const express = require('express');
const router = express.Router();

// Home route is redirected to the `books` route
router.get('/', (req, res, next) => {
  res.redirect("/books")
});

/* GET generated error route - create and throw 500 server error 
    This is intentional for testing purposes.
*/
router.get('/error', (req, res, next) => {
    
  // Log out custom error handler indication
  console.log('Custom error route called');
  
  const err = new Error();
  err.message = `The server returned a 500 internal error.`
  err.status = 500;
  throw err;
});

module.exports = router;
