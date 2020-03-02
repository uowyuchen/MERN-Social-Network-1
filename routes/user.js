const express = require("express");
const router = express.Router();
const {
  userById,
  allUsers,
  getSingleUser,
  updateUser,
  deleteUser,
  userPhoto,
  addFollowing,
  addFollower,
  removeFollowing,
  removeFollower,
  findPeople
} = require("../controllers/user");
const { requireSignin } = require("../controllers/auth");

router.put("/users/follow", requireSignin, addFollowing, addFollower);
router.put("/users/unfollow", requireSignin, removeFollowing, removeFollower);

// get all users
router.get("/users", allUsers);
router.get("/users/:userId", requireSignin, getSingleUser);
router.put("/users/:userId", requireSignin, updateUser);
router.delete("/users/:userId", requireSignin, deleteUser);
// get user photo
router.get("/users/photo/:userId", userPhoto);
// who to follow
router.get("/users/findpeople/:userId", requireSignin, findPeople);

// we're looking for the prameter in the incoming URL
router.param("userId", userById);

module.exports = router;
