const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const morgan = require("morgan");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const expressValidator = require("express-validator");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const fs = require("fs");

// connect to DB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("DB Connected!");
  });
// this is for error in case
mongoose.connection.on("error", err => {
  console.log(`DB connection error: ${err.message}`);
});

// require routes
const postRoutes = require("./routes/post");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");

// middleware
// morgan就是为了显示：GET / 304 4.916 ms - -
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressValidator());
app.use(cors());

app.use("/", postRoutes);
app.use("/", authRoutes);
app.use("/", userRoutes);

// apiDocs
app.get("/", (req, res) => {
  fs.readFile("docs/apiDocs.json", (err, data) => {
    if (err) {
      res.status(400).json({
        error: err
      });
    }
    const docs = JSON.parse(data);
    res.json(docs);
  });
});

// express-jwt error handling 位置很重要！！！
app.use(function(err, req, res, next) {
  console.log(1);
  if (err.name === "UnauthorizedError") {
    res.status(401).json({ error: "Unauthorized!" });
  }
});

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`A Node Js API is listening on port : ${port}`);
});
