const mongoose = require("mongoose");
const uuidv1 = require("uuid/v1");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true
  },
  email: {
    type: String,
    trim: true,
    required: true
  },
  hashed_password: {
    type: String,
    trim: true,
    required: true
  },
  salt: String,
  created: {
    type: Date,
    default: Date.now
  },
  updated: Date,
  photo: {
    data: Buffer,
    contentType: String
  },
  about: { type: String, trim: true }
});

/**
 * Virtual fields are additional fields for a given model.
 * Their values can be set manually or auto with defined functionality.
 * Keep in mind: virtual properties don't get persisted in DB.
 * The only exist logically and are not written to the document's collection.
 */

// virtual field
userSchema
  .virtual("password") // 这个password来自前端用户的输入
  .set(function(password) {
    // create temporary variable called _password
    // this._password = password;
    // generate a timestamp
    this.salt = uuidv1();
    // encryp password
    this.hashed_password = this.encryptPassword(password);
  });
// .get(function() {
//   return this._password;
// });

// methods
userSchema.methods = {
  encryptPassword: function(password) {
    if (!password) return "";
    try {
      return crypto
        .createHmac("sha1", this.salt)
        .update(password)
        .digest("hex");
    } catch (err) {
      return "";
    }
  },
  // 把用户输入的密码加密后 看看 是否等于 DB中存储的 hashed_password
  authenticate: function(plainText) {
    return this.encryptPassword(plainText) === this.hashed_password;
  }
};
module.exports = mongoose.model("User", userSchema);
