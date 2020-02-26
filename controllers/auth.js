require("dotenv").config();
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");

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
    // 基于user的id 和 我们自己设置的secret 来生产token
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
