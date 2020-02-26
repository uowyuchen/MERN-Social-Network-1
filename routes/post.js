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
  updatePost
} = require("../controllers/post");
const { userById } = require("../controllers/user");
const { requireSignin } = require("../controllers/auth");

router.get("/posts", getPosts);
router.post(
  "/post/new/:userId",
  requireSignin,
  createPost,
  createPostValidator
);
router.get("/posts/by/:userId", requireSignin, postsByUser);
router.delete("/post/:postId", requireSignin, isPoster, deletePost);
router.put("/post/:postId", requireSignin, isPoster, updatePost);

// we're looking for the prameter in the incoming URL
router.param("userId", userById);
router.param("postId", postById);

module.exports = router;
