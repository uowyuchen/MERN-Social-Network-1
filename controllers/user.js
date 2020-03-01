const _ = require("lodash");
const User = require("../models/user");
const formidable = require("formidable");
const fs = require("fs");

// 把要更改的东西（比如一个user的profile）的userId放入req.profile中
exports.userById = (req, res, next, id) => {
  User.findById(id)
    .populate("following", "_id name")
    .populate("follower", "_id name")
    .exec((err, foundUser) => {
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
    res.json(allUsers);
  }).select("name email updated created");
};

// get single user
exports.getSingleUser = (req, res) => {
  req.profile.hashed_password = undefined;
  req.profile.salt = undefined;
  return res.json(req.profile);
};

// update user
// exports.updateUser = (req, res) => {
//   let user = req.profile;
//   user = _.extend(user, req.body);
//   user.updated = Date.now();
//   user.save((err, savedUser) => {
//     if (err) {
//       return res.status(400).json({
//         error: "You are not authorized to perfomr this action"
//       });
//     }
//     savedUser.hashed_password = undefined;
//     savedUser.salt = undefined;
//     return res.json({ savedUser });
//   });
// };

// update user
exports.updateUser = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "Photo could not be uploaded"
      });
    }
    // update user with lodash.extend
    let user = req.profile;
    user = _.extend(user, fields);
    user.updated = Date.now();

    // 如果有photo就保存photo
    if (files.photo) {
      user.photo.data = fs.readFileSync(files.photo.path);
      user.photo.contentType = files.photo.type;
    }

    // save user
    user.save((err, savedUser) => {
      if (err) {
        return res.status(400).json({
          error: err
        });
      }
      user.hashed_password = undefined;
      user.salt = undefined;
      res.json(savedUser);
    });
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

// get user photo
exports.userPhoto = (req, res, next) => {
  // 如果user的profile里面有photo.data，说明已经上传⏫过avater了
  if (req.profile.photo.data) {
    res.set(("Content-Type", req.profile.photo.contentType));
    return res.send(req.profile.photo.data);
  }
  next();
};

// follow unfollow
exports.addFollowing = (req, res, next) => {
  // 意思是登录的user的userId，去follows 另一个user，其id是followId
  // 就是登录的user去follow另一个user
  User.findByIdAndUpdate(
    req.body.userId,
    { $push: { following: req.body.followId } },
    (err, foundUser) => {
      if (err) {
        return res.status(400).json({
          error: err
        });
      }
      next();
    }
  );
};
exports.addFollower = (req, res, next) => {
  // 上面👆的方法执行结束，就要往followId这个user里面加一个follower
  // 那么，这个follower是就上面👆那个登录的user
  User.findByIdAndUpdate(
    req.body.followId,
    { $push: { followers: req.body.userId } },
    { new: true }
  )
    .populate("following", "_id name")
    .populate("follower", "_id name")
    .exec((err, foundUser) => {
      if (err) {
        return res.status(400).json({
          error: err
        });
      }
    });
  foundUser.hashed_password = undefined;
  foundUser.salt = undefined;
  res.json(foundUser);
};

// remove following & follower
exports.removeFollowing = (req, res, next) => {
  // 意思是登录的user的userId，去follows 另一个user，其id是followId
  // 就是登录的user去follow另一个user
  User.findByIdAndUpdate(
    req.body.userId,
    { $pull: { following: req.body.unfollowId } },
    (err, foundUser) => {
      if (err) {
        return res.status(400).json({
          error: err
        });
      }
      next();
    }
  );
};
exports.removeFollower = (req, res, next) => {
  // 上面👆的方法执行结束，就要往followId这个user里面加一个follower
  // 那么，这个follower是就上面👆那个登录的user
  User.findByIdAndUpdate(
    req.body.unfollowId,
    { $pull: { followers: req.body.userId } },
    { new: true }
  )
    .populate("following", "_id name")
    .populate("follower", "_id name")
    .exec((err, foundUser) => {
      if (err) {
        return res.status(400).json({
          error: err
        });
      }
    });
  foundUser.hashed_password = undefined;
  foundUser.salt = undefined;
  res.json(foundUser);
};
