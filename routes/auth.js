const express = require("express");
const router = express.Router();
const { userSignupValidator } = require("../validator");

const { signup, signin, signout } = require("../controllers/auth");
const { userById } = require("../controllers/user");

router.post("/signup", userSignupValidator, signup);
router.post("/signin", signin);
router.get("/signout", signout);

// we're looking for the prameter in the incoming URL
router.param("userId", userById);

module.exports = router;
