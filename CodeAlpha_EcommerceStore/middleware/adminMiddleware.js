const User = require("../models/User");

const isAdmin = async (req, res, next) => {
    const user = await User.findById(req.session.userId);

    if (!user || user.role !== "admin") {
        return res.status(403).send("Access denied");
    }

    next();
};

module.exports = isAdmin;