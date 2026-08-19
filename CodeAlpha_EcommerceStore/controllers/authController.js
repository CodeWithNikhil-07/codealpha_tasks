const User = require("../models/User");
const bcrypt = require("bcrypt");


exports.showRegisterPage = (req, res) => {
    res.render("auth/register");
};

// REGISTER USER
exports.register = async (req, res) => {
    try {

        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.send("All fields are required");
        }

        if (name.trim().length < 2) {
            return res.send("Name must be at least 2 characters");
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email.trim())) {
            return res.send("Invalid email address");
        }

        if (password.length < 8) {
            return res.send("Password must be at least 8 characters");
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.send("Email already registered");
        }

        // HASH PASSWORD
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword
        });

        await user.save();

        req.flash(
            "success",
            "Account created successfully!"
        );

        res.redirect("/login");

    } catch (error) {

        console.error(error);

        res.send("Registration failed");
    }
};


exports.showLoginPage = (req, res) => {

    const successMessage = req.flash("success");

    res.render("auth/login", {
        successMessage
    });
};

exports.login = async (req, res) => {
    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.send("Email and password are required");
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.send("Invalid email or password");
        }

        // COMPARE PASSWORD
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.send("Invalid email or password");
        }

        // CREATE LOGIN SESSION
        req.session.userId = user._id;
        req.session.userRole = user.role;

        // SAVE SESSION
        req.session.save((err) => {

            if (err) {
                console.error(err);

                return res.send("Login failed");
            }

            if (user.role === "admin") {
                return res.redirect("/admin");
            }

            res.redirect("/products");
        });

    } catch (error) {

        console.error(error);

        res.send("Login failed");
    }
};

exports.logout = (req, res) => {

    req.session.destroy((err) => {

        if (err) {
            return res.send("Logout failed");
        }

        res.redirect("/login");
    });
};