const express = require("express");
const dotenv = require("dotenv");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");
const path = require("path");

const connectDB = require("./config/db");

dotenv.config();

connectDB();

const app = express();

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,

        store: MongoStore.create({
            mongoUrl: process.env.MONGODB_URI,
        }),

        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 7,
            httpOnly: true,
        },
    })
);
app.use(flash());
app.use((req, res, next) => {
    res.locals.messages = {
        success: req.flash("success"),
        error: req.flash("error"),
    };
    res.locals.currentUser = null;
    next();
});

// EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const commentRoutes = require("./routes/commentRoutes");

app.use("/auth", authRoutes);
app.use("/", projectRoutes);
app.use("/", taskRoutes);
app.use("/", commentRoutes);

// Home
app.get("/", (req, res) => {
    res.redirect(req.session.userId ? "/dashboard" : "/auth/login");
});

app.get("/login", (req, res) => {
    res.redirect("/auth/login");
});

app.get("/register", (req, res) => {
    res.redirect("/auth/register");
});

app.use((req, res) => {
    res.status(404).render("error", {
        title: "Page not found",
        status: 404,
        message: "The page you requested does not exist or has moved.",
    });
});

app.use((error, req, res, next) => {
    console.error(error);
    const status = error.name === "CastError" ? 404 : 500;
    res.status(status).render("error", {
        title: status === 404 ? "Not found" : "Something went wrong",
        status,
        message: status === 404 ? "The requested record was not found." : "Please try again. If this continues, restart the application.",
    });
});

// Server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
