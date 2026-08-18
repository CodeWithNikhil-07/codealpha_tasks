const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  try {
    if (!req.session.userId) {
      return res.redirect("/auth/login");
    }

    const user = await User.findById(req.session.userId);

    if (!user) {
      req.session.destroy(() => {});
      return res.redirect("/auth/login");
    }

    req.user = user;
    res.locals.currentUser = user;

    next();
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const isGuest = (req, res, next) => {
  if (req.session.userId) {
    return res.redirect("/dashboard");
  }

  next();
};

module.exports = {
  isAuthenticated,
  isGuest,
};
