const express = require("express");
const router = express.Router();
const { userSignupValidator, passwordResetValidator } = require("../validator");

const {
  signup,
  signin,
  signout,
  forgotPassword,
  resetPassword
} = require("../controllers/auth");
const { userById } = require("../controllers/user");

router.post("/signup", userSignupValidator, signup);
router.post("/signin", signin);
router.get("/signout", signout);

// forgot & reset password
router.put("/forgot-password", forgotPassword);
router.put("/reset-password", passwordResetValidator, resetPassword);

// we're looking for the prameter in the incoming URL
router.param("userId", userById);

module.exports = router;
