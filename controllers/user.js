const _ = require("lodash");
const User = require("../models/user");

// 把要更改的东西（比如一个user的profile）的userId放入req.profile中
exports.userById = (req, res, next, id) => {
  User.findById(id).exec((err, foundUser) => {
    if (err || !foundUser) {
      return res.status(400).json({ error: "User not found" });
    }

    req.profile = foundUser; // adds profile object in req with user info
    // console.log(req.profile);
    // {
    //   "_id": "5e5551ff0306314ecd7bf054",
    //   "name": "zhen",
    //   "email": "yuchendl@hotmail.com",
    //   "salt": "ebe8e350-57ef-11ea-a579-578df468ce35",
    //   "hashed_password": "72193996e83a0ab1faed8093f43bb70d509cce1a",
    //   "created": "2020-02-25T16:57:35.493Z",
    //   "__v": 0
    // }
    next();
  });
};

// 这个意思是 有权利做更改了！因为登录的userId和需要修改的东西的userId是一样的！
exports.hasAuthorization = (req, res, next) => {
  const authorized = req.profile && req.auth && req.profile.id === req.auth.id;
  if (!authorized) {
    return res.status(403).json({
      error: "User is not authorized to perform this action"
    });
  }
  next();
};

// get all users
exports.allUsers = (req, res) => {
  User.find((err, allUsers) => {
    if (err || !allUsers) {
      return res.status(400).json({
        error: err
      });
    }
    res.json({ users: allUsers });
  }).select("name email updated created");
};

// get single user
exports.getSingleUser = (req, res) => {
  req.profile.hashed_password = undefined;
  req.profile.salt = undefined;
  return res.json(req.profile);
};

// update user
exports.updateUser = (req, res) => {
  let user = req.profile;
  user = _.extend(user, req.body);
  user.updated = Date.now();
  user.save((err, savedUser) => {
    if (err) {
      return res.status(400).json({
        error: "You are not authorized to perfomr this action"
      });
    }
    savedUser.hashed_password = undefined;
    savedUser.salt = undefined;
    return res.json({ savedUser });
  });
};

// delete user
exports.deleteUser = (req, res) => {
  let user = req.profile;
  user.remove((err, deletedUser) => {
    if (err) {
      return res.status(400).json({
        error: err
      });
    }
    return res.json({ message: "User deleted successfully" });
  });
};
