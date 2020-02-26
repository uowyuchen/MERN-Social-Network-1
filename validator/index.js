exports.createPostValidator = (req, res, next) => {
  // title validation
  // 如果没给title就显示这个
  req.check("title", "Write a title").notEmpty();
  // 如果title不够长就显示这个
  req.check("title", "Title must be between 4 to 150 characters").isLength({
    min: 4,
    max: 150
  });
  // body validation
  req.check("title", "Write a body").notEmpty();
  req.check("title", "Body must be between 4 to 2000 characters").isLength({
    min: 4,
    max: 2000
  });
  // only get one error
  const errors = req.validationErrors(); // get all errors
  // show only one error
  if (errors) {
    const firstError = errors.map(error => error.msg)[0];
    return res.status(400).json({ error: firstError });
  }
  // proceed to next middleware
  next();
};

exports.userSignupValidator = (req, res, next) => {
  // name is not null and between 4 to 10 characters
  req.check("name", "Name is required").notEmpty();
  // email is not null, valid and normalized
  req
    .check("email", "Email must be between 3 to 32 characters")
    .matches(/.+\@.+\..+/)
    .withMessage("Email must contain @")
    .isLength({ min: 4, max: 2000 });
  // check for psw
  req.check("password", "Password is required").notEmpty();
  req
    .check("password")
    .isLength({ min: 6 })
    .withMessage("Password must contain at least 6 characters");
  // check for errors
  // only get one error
  const errors = req.validationErrors(); // get all errors
  // show only one error
  if (errors) {
    const firstError = errors.map(error => error.msg)[0];
    return res.status(400).json({ error: firstError });
  }
  // proceed to next middleware
  next();
};
