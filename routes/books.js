const express = require("express");
const router = express.Router();
const Book = require('../models').Book;

function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      // Forward error to the global error handler
      next(error);
    }
  }
}

/* Shows the full list of books */
router.get('/', asyncHandler(async (req, res) => {
  const books = await Book.findAll();
  // Pass all books data to 'index' template
  res.render("books/index", { books, title: "Books" });
}));

/* Create a new book form. */
router.get('/new', (req, res) => {
    res.render("books/new-book", { books: {}, title: "New Book" });
  });

/* POST a new book to the database. */
router.post('/', asyncHandler(async (req, res) => {
    let book;
    try {
      book= await Book.create(req.body);
      res.redirect("/books/" + book.id);
    } catch (error) {
      if(error.name === "SequelizeValidationError") { // checking the error
        book = await Book.build(req.body);
        res.render("books/new-book", { book, errors: error.errors, title: "New Book" })
      } else {
        throw error; // error caught in the asyncHandler's catch block
      }  
    }
  }));

/* Edit a book form. */
router.get("/:id/update", asyncHandler(async(req, res, next) => {
    const book = await Book.findByPk(req.params.id);
    if(book) {
      res.render("books/update-book", { book, title: "Update Book" });     
    } else {
      console.log('404 error handler called');
      const err = new Error();
          err.status = 404;
          err.message = `Sorry! We couldn't find the page you were looking for.`
          next(err);
    }
}));

/* GET individual book detail form. */
router.get("/:id", asyncHandler(async (req, res, next) => {
    const book = await Book.findByPk(req.params.id);
    if(book) {
      res.render("books/show-book", { book, title: book.title });
    } else {
      console.log('404 error handler called');
      const err = new Error();
          err.status = 404;
          err.message = `Sorry! We couldn't find the page you were looking for.`
          next(err);
    } 
  }));

/* Update an book in the database. */
router.post('/:id/update', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.findByPk(req.params.id);
    if(book) {
      await book.update(req.body);
      res.redirect("/books/" + book.id);
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    if(error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      book.id = req.params.id; // make sure correct book gets updated
      res.render("books/update", { book, errors: error.errors, title: "Update Book" })
    } else {
      throw error;
    }
  }
    
  }));
  
/* Delete a book. */
router.post('/:id/delete', asyncHandler(async (req ,res) => {
    const book = await Book.findByPk(req.params.id);
    await book.destroy();
    if(book) {
      await book.destroy();
      res.redirect("/books");
    } else {
      res.sendStatus(404);
    }
}));

module.exports = router;