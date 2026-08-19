const User = require("../models/User");

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);

    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/products");
    }

    res.render("profile/index", { user });
  } catch (error) {
    console.error(error);
    req.flash("error", "Unable to load profile");
    res.redirect("/products");
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);

    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/products");
    }

    const { name, phone, address, city, state, pincode } = req.body;

    // Validate profile fields.
    if (!name || name.trim().length < 2) {
      req.flash("error", "Name must contain at least 2 characters");
      return res.redirect("/profile");
    }

    if (phone && !/^[0-9]{10}$/.test(phone)) {
      req.flash("error", "Phone number must contain exactly 10 digits");
      return res.redirect("/profile");
    }

    if (pincode && !/^[0-9]{6}$/.test(pincode)) {
      req.flash("error", "Pincode must contain exactly 6 digits");
      return res.redirect("/profile");
    }

    if (address && address.trim().length < 5) {
      req.flash("error", "Please enter a valid address");
      return res.redirect("/profile");
    }

    if (city && city.trim().length < 2) {
      req.flash("error", "Please enter a valid city");
      return res.redirect("/profile");
    }

    if (state && state.trim().length < 2) {
      req.flash("error", "Please enter a valid state");
      return res.redirect("/profile");
    }

    user.name = name.trim();
    user.phone = phone?.trim() || "";
    user.address = address?.trim() || "";
    user.city = city?.trim() || "";
    user.state = state?.trim() || "";
    user.pincode = pincode?.trim() || "";

    await user.save();

    req.flash("success", "Profile updated successfully");
    res.redirect("/profile");
  } catch (error) {
    console.error(error);
    req.flash("error", "Unable to update profile");
    res.redirect("/profile");
  }
};

module.exports = {
  getProfile,
  updateProfile,
};