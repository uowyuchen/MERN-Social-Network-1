const _ = require("lodash");
const Post = require("../models/post");
const formidable = require("formidable");
const fs = require("fs");

// post by id param
exports.postById = (req, res, next, id) => {
  Post.findById(id)
    .populate("postedBy", "id name")
    .exec((err, foundPost) => {
      if (err || !foundPost) {
        return res.status(400).json({
          error: err
        });
      }
      req.post = foundPost;
      next();
    });
};

// get all posts
exports.getPosts = (req, res) => {
  Post.find()
    .populate("postedBy", "id name")
    .select("id title body created")
    .sort({ created: -1 })
    .then(posts => {
      res.json(posts);
    })
    .catch(err => console.log(err));
};

// create post
exports.createPost = (req, res) => {
  let form = new formidable.IncomingForm();
  // keep file extension
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "Image could not be uploaded"
      });
    }
    let post = new Post(fields);
    // 把user 给postBy
    req.profile.hashed_password = undefined;
    req.profile.salt = undefined;
    post.postedBy = req.profile;

    // 存照片
    if (files.photo) {
      post.photo.data = fs.readFileSync(files.photo.path);
      post.photo.contentType = files.photo.type;
    }

    post.save((err, savedPost) => {
      if (err) {
        return res.status(400).json({
          error: err
        });
      }
      res.json({ savedPost });
    });
  });
};

// get post by user
exports.postsByUser = (req, res) => {
  Post.find({ postedBy: req.profile.id })
    .populate("postedBy", "id name")
    .sort("created")
    .exec((err, foundPosts) => {
      if (err) {
        return res.status(400).json({
          error: err
        });
      }
      res.json(foundPosts);
    });
};

// is Poster?
exports.isPoster = (req, res, next) => {
  /**
   * req.auth是因为我们有：
   * exports.requireSignin = expressJwt({
      // secret这个是用来检查登录user的token是否是正确的，别忘了我们生成token的时候用到了这个secret，在此是解析token；如果成功解析了token就怎么此user是登录状态了；然后把user信息放入auth中，auth.id就是user.id
      secret: process.env.JWT_SECRET,
      userProperty: "auth"
    });
   */
  let isPoster = req.post && req.auth && req.post.postedBy.id === req.auth.id;
  if (!isPoster) {
    return res.status(403).json({ error: "User is not authorized" });
  }
  next();
};

// delete post
exports.deletePost = (req, res) => {
  let post = req.post;
  post.remove(err => {
    if (err) {
      return res.status(400).json({ error: err });
    }
    res.json({ message: "Post deleted successfully" });
  });
};

// update post
exports.updatePost = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({ error: "Photo could not be uploaded" });
    }
    // save post
    let post = req.post;
    post = _.extend(post, fields);
    post.updated = Date.now();

    // save photo
    if (files.photo) {
      post.photo.data = fs.readFileSync(files.photo.path);
      post.photo.contentType = files.photo.type;
      console.log("haha");
    }

    post.save((err, savedPost) => {
      if (err) {
        return res.status(400).json({ error: err });
      }
      res.json(savedPost);
    });
  });
};

// get post photo
exports.postPhoto = (req, res) => {
  // 设置好 image type；其实就是image.jpg的jpg
  res.set("Content-Type", req.post.photo.contentType);
  // 然后返回image数据，通过上面和下面的步骤，就能把二进制变成一张图片
  return res.send(req.post.photo.data);
};

// get single post
exports.singlePost = (req, res) => {
  let post = req.post;
  return res.json(post);
};
