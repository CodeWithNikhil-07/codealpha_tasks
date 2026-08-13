const User = require("../models/User");
const bcrypt = require("bcrypt");

exports.showRegisterPage = (req, res) => {
    res.render("auth/register");
};

exports.register = async (req, res) => {

    const { name, email, password } = req.body;

    // Check required fields
    if (!name || !email || !password) {
        return res.send("All fields are required");
    }

    // Validate name
    if (name.trim().length < 2) {
        return res.send("Name must be at least 2 characters");
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        return res.send("Invalid email address");
    }

    // Validate password
    if (password.length < 8) {
        return res.send("Password must be at least 8 characters");
    }

    // Check whether user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        return res.send("Email already registered");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
        name,
        email,
        password: hashedPassword
    });

    // Save user
    await user.save();

    // Flash message
    req.flash("success", "Account created successfully!");

    // Redirect to login
    res.redirect("/login");
};


exports.showLoginPage = (req, res) => {

    const successMessage = req.flash("success");

    res.render("auth/login", {
        successMessage
    });
};


exports.login = async (req, res) => {

    const { email, password } = req.body;

    // 1. Check required fields
    if (!email || !password) {
        return res.send("Email and password are required");
    }

    // 2. Find user
    const user = await User.findOne({ email });

    if (!user) {
        return res.send("Invalid email or password");
    }

    // 3. Compare password with stored hash
    const isPasswordCorrect = await bcrypt.compare(
        password,
        user.password
    );

    // 4. Check password result
    if (!isPasswordCorrect) {
        return res.send("Invalid email or password");
    }

    // 5. Create login session
    req.session.userId = user._id;

    // 6. Login successful
    res.send("Login successful!");
};