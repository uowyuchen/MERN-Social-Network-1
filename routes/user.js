const express = require("express");
const router = express.Router();
const {
  userById,
  allUsers,
  getSingleUser,
  updateUser,
  deleteUser,
  userPhoto
} = require("../controllers/user");
const { requireSignin } = require("../controllers/auth");

// get all users
router.get("/users", allUsers);
router.get("/users/:userId", requireSignin, getSingleUser);
router.put("/users/:userId", requireSignin, updateUser);
router.delete("/users/:userId", requireSignin, deleteUser);
// get user photo
router.get("/users/photo/:userId", userPhoto);

// we're looking for the prameter in the incoming URL
router.param("userId", userById);

module.exports = router;
