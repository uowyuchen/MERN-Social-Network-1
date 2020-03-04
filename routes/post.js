const express = require("express");
const router = express.Router();
const { createPostValidator } = require("../validator");
const {
  getPosts,
  createPost,
  postsByUser,
  postById,
  isPoster,
  deletePost,
  updatePost,
  postPhoto,
  singlePost,
  like,
  unlike,
  comment,
  uncomment
} = require("../controllers/post");
const { userById } = require("../controllers/user");
const { requireSignin } = require("../controllers/auth");

router.get("/posts", getPosts);

// like unlike
router.put("/post/like", requireSignin, like);
router.put("/post/unlike", requireSignin, unlike);

// comments
router.put("/post/comment", requireSignin, comment);
router.put("/post/uncomment", requireSignin, uncomment);

router.post(
  "/post/new/:userId",
  requireSignin,
  createPost,
  createPostValidator
);
// get posts by a user
router.get("/posts/by/:userId", requireSignin, postsByUser);
// delete single post
router.delete("/posts/:postId", requireSignin, isPoster, deletePost);
// update a post
router.put("/post/:postId", requireSignin, isPoster, updatePost);

// get single post
router.get("/post/:postId", singlePost);

// get post photo
router.get("/post/photo/:postId", postPhoto);

// we're looking for the prameter in the incoming URL
router.param("userId", userById);
router.param("postId", postById);

module.exports = router;
