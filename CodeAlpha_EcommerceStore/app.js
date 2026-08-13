const express = require("express");
const dotenv = require("dotenv");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");
const flash = require("connect-flash");

const connectDB = require("./config/db");

dotenv.config();

connectDB();

const app = express();

const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");

// Import Routes
// const indexRoutes = require("./routes/index");
const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");

app.use(express.urlencoded({ extended: true })); //takes that incoming data and turns it into a JavaScript object:

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
    }),
  }),
);
 
app.use(flash());

// Use Routes
// app.use("/", indexRoutes);
app.use("/", authRoutes);
app.use("/", testRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to CodeAlpha Ecommerce Store!");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
