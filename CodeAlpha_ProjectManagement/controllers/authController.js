const bcrypt = require("bcrypt");
const User = require("../models/User");

// Show Register Page
const showRegister = (req, res) => {
    res.render("auth/register", {
        title: "Create account",
    });
};


// Register User
const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        const cleanName = name?.trim();
        const cleanEmail = email?.trim().toLowerCase();

        // Validate Required Fields
        if (!cleanName || !cleanEmail || !password) {
            req.flash(
                "error",
                "Name, email, and password are required."
            );

            return res.redirect("/auth/register");
        }

        // Validate Email and Password
        const isValidEmail = /^\S+@\S+\.\S+$/.test(cleanEmail);
        const isValidPassword = password.length >= 6;

        if (!isValidEmail || !isValidPassword) {
            req.flash(
                "error",
                "Enter a valid email and a password of at least 6 characters."
            );

            return res.redirect("/auth/register");
        }

        // Check Existing User
        const existingUser = await User.findOne({
            email: cleanEmail,
        });

        if (existingUser) {
            req.flash(
                "error",
                "That email is already registered. Please sign in instead."
            );

            return res.redirect("/auth/login");
        }

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create User
        const user = await User.create({
            name: cleanName,
            email: cleanEmail,
            password: hashedPassword,
        });

        // Create Login Session
        req.session.userId = user._id;

        req.flash(
            "success",
            "Welcome! Your account is ready."
        );

        res.redirect("/dashboard");

    } catch (error) {
        console.error(error);
        next(error);
    }
};


// Show Login Page
const showLogin = (req, res) => {
    res.render("auth/login", {
        title: "Sign in",
    });
};


// Login User
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate Required Fields
        if (!email || !password) {
            req.flash(
                "error",
                "Email and password are required."
            );

            return res.redirect("/auth/login");
        }

        // Find User
        const cleanEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: cleanEmail,
        });

        if (!user) {
            req.flash(
                "error",
                "Invalid email or password."
            );

            return res.redirect("/auth/login");
        }

        // Check Password
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            req.flash(
                "error",
                "Invalid email or password."
            );

            return res.redirect("/auth/login");
        }

        // Create Login Session
        req.session.userId = user._id;

        req.flash(
            "success",
            `Welcome back, ${user.name}.`
        );

        res.redirect("/dashboard");

    } catch (error) {
        console.error(error);
        next(error);
    }
};


// Logout User
const logout = (req, res, next) => {
    req.session.destroy((error) => {

        if (error) {
            console.error(error);
            return next(error);
        }

        res.clearCookie("connect.sid");
        res.redirect("/auth/login");
    });
};


module.exports = {
    showRegister,
    register,
    showLogin,
    login,
    logout,
};