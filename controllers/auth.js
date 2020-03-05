require("dotenv").config();
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const _ = require("lodash");
const { sendEmail } = require("../helpers");
const dotenv = require("dotenv");
dotenv.config();

const User = require("../models/user");

// Signup
exports.signup = async (req, res) => {
  const userExists = await User.findOne({ email: req.body.email });
  if (userExists)
    return res.status(403).json({
      error: "Email is taken!"
    });
  const user = await new User(req.body);
  await user.save();
  // back to client
  res.status(200).json({ message: "signup success" });
};

// Signin
exports.signin = (req, res) => {
  // find the user based on email
  const { email, password } = req.body;
  User.findOne({ email }, (err, foundUser) => {
    // if error or no user
    if (err || !foundUser) {
      return res.status(401).json({
        error: "User with that email does not exist. Please signin"
      });
    }
    // if user found, make usre the email and psw match
    // create authenticate method in user model
    if (!foundUser.authenticate(password)) {
      return res.status(401).json({
        error: "Email and password do not match"
      });
    }

    // generate a token with user id and secret
    // 基于user的id 和 我们自己设置的secret 来生成token
    const token = jwt.sign({ id: foundUser.id }, process.env.JWT_SECRET);

    // persist the token as 't' in cookie with exiry date
    res.cookie("t", token, { expire: new Date() + 9999 });
    // return response with user and token to frontend client
    const { id, name, email } = foundUser;
    return res.json({ token, user: { id, name, email } });
  });
};

// Signout
exports.signout = (req, res) => {
  res.clearCookie("t");
  return res.json({ message: "Signout success!" });
};

// 这个放在哪就说明那个route需要signin；通过解析token来检查是否signin了！
// Signin不代表你有权利去修改别人的东西，所以我们需要 hasAuthorization
exports.requireSignin = expressJwt({
  // secret这个是用来检查登录user的token是否是正确的，别忘了我们生成token的时候用到了这个secret，在此是解析token；如果成功解析了token就怎么此user是登录状态了；然后把user信息放入auth中，auth.id就是user.id
  secret: process.env.JWT_SECRET,
  userProperty: "auth"
});

// add forgotPassword method
exports.forgotPassword = (req, res) => {
  if (!req.body) return res.status(400).json({ message: "No request body" });
  if (!req.body.email)
    return res.status(400).json({ message: "No Email in request body" });

  const { email } = req.body;

  // find the user based on email
  User.findOne({ email }, (err, user) => {
    // if err or no user
    if (err || !user)
      return res.status("401").json({
        error: "User with that email does not exist!"
      });

    // generate a token with user id and secret
    const token = jwt.sign(
      { _id: user._id, iss: "NODEAPI" },
      process.env.JWT_SECRET
    );

    // email data
    const emailData = {
      from: "noreply@node-react.com",
      to: email,
      subject: "Password Reset Instructions",
      text: `Please use the following link to reset your password: ${process.env.CLIENT_URL}/reset-password/${token}`,
      html: `<p>Please use the following link to reset your password:</p> <p>${process.env.CLIENT_URL}/reset-password/${token}</p>`
    };

    return user.updateOne({ resetPasswordLink: token }, (err, success) => {
      if (err) {
        return res.json({ message: err });
      } else {
        sendEmail(emailData);
        return res.status(200).json({
          message: `Email has been sent to ${email}. Follow the instructions to reset your password.`
        });
      }
    });
  });
};

// reset password
exports.resetPassword = (req, res) => {
  console.log("haha");
  // resetPasswordLink其实就是DB中存的那个token
  const { resetPasswordLink, newPassword } = req.body;

  User.findOne({ resetPasswordLink }, (err, user) => {
    // if err or no user
    if (err || !user)
      return res.status("401").json({
        error: "Invalid Link!"
      });

    console.log("2", resetPasswordLink);

    const updatedFields = {
      password: newPassword,
      resetPasswordLink: ""
    };

    user = _.extend(user, updatedFields);
    user.updated = Date.now();

    user.save((err, result) => {
      if (err) {
        return res.status(400).json({
          error: err
        });
      }
      res.json({
        message: `Great! Now you can login with your new password.`
      });
    });
  });
};
