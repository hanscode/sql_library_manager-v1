const express = require("express");
const router = express.Router();
const Book = require('../models').Book;
const { Op } = require("sequelize");

function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next)
    } catch (error) {
      // Forward error to the global error handler
      next(error);
    }
  }
}

/* Shows the full list of books */
router.get('/', asyncHandler(async (req, res) => {

  let limit = 7;   // number of records per page
  let offset = 0;
  const activePage = req.query.page ? req.query.page : 1;
  const activeSearch = req.query.search ? req.query.search : '';
  const paginationNumbers = [];
  const search = req.query.search || "";

  // Getting the `offset` value according to the value of the query parameter `page` in the route.
  offset = req.query.page ? limit * (req.query.page - 1) : 0;

  const {count, rows} = await Book.findAndCountAll({
    limit: limit,
    offset: offset,
    where: {
      [Op.or]: [
        { title: { [Op.like]: '%'+ search +'%' } },
        { author: { [Op.like]: '%'+ search +'%' } },
        { genre: { [Op.like]: '%'+ search +'%' } },
        { year: { [Op.like]: '%'+ search +'%' } },
      ]
    }
  });

  // Get the amount of books stored in the database.
  const books = rows;

  // A variable called `numOfPages` to calculate the number of pagination pages needed.
  const numOfPages = Math.ceil(count / limit);

  // A For loop that runs once over the number of pages needed: `numOfPages`.
  for (let i = 1; i <= numOfPages; i++) {

    if (count > limit) {
       /**
        * Check If there are more than the limit of books listed per page:
        * Then create the elements needed to display the pagination buttons and store them in the array `paginationNumbers`.
        * */ 
       paginationNumbers.push(i);
    }
 }

  // Pass all books data to 'index' template
  res.render("books/index", { books, title: "Books", query: search, pages: numOfPages, buttons: paginationNumbers, activePage, activeSearch, count });

}));

/* Create a new book form. */
router.get('/new', (req, res) => {
  res.render("books/new-book", { books: {}, title: "New Book" });
});

/* POST a new book to the database. */
router.post('/', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.create(req.body);
    res.redirect("/books/" + book.id);
  } catch (error) {
    if (error.name === "SequelizeValidationError") { // checking the error
      book = await Book.build(req.body);
      res.render("books/new-book", { book, errors: error.errors, title: "New Book" })
    } else {
      throw error; // error caught in the asyncHandler's catch block
    }
  }
}));

/* GET individual book detail form. */
router.get("/:id", asyncHandler(async (req, res, next) => {
  const book = await Book.findByPk(req.params.id);
  if (book) {
    res.render("books/show-book", { book, title: book.title });
  } else {
    const err = new Error();
    err.status = 404;
    next(err);
  }
}));

/* Update a book form. */
router.get("/:id/update", asyncHandler(async (req, res, next) => {
  const book = await Book.findByPk(req.params.id);
  if (book) {
    res.render("books/update-book", { book, title: "Update Book" });
  } else {
    const err = new Error();
    err.status = 404;
    next(err);
  }
}));

/* Update an book in the database. */
router.post('/:id/update', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.findByPk(req.params.id);
    if (book) {
      await book.update(req.body);
      res.redirect("/books/" + book.id);
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      book.id = req.params.id; // make sure correct book gets updated
      res.render("books/update", { book, errors: error.errors, title: "Update Book" })
    } else {
      throw error;
    }
  }

}));

/* Delete a book. */
router.post('/:id/delete', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  await book.destroy();
  if (book) {
    await book.destroy();
    res.redirect("/books");
  } else {
    res.sendStatus(404);
  }
}));

module.exports = router;