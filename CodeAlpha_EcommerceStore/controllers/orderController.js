const Order = require("../models/Order");

const getMyOrders = async (req, res) => {
  try {
    const userId = req.session.userId;

    const orders = await Order.find({
      user: userId,
    }).sort({ createdAt: -1 });

    res.render("orders/index", {
      orders,
    });
  } catch (error) {
    console.error(error);

    req.flash("error", "Unable to load orders");

    res.redirect("/products");
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const userId = req.session.userId;

    const order = await Order.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!order) {
      req.flash("error", "Order not found");

      return res.redirect("/orders");
    }

    res.render("orders/details", {
      order,
    });
  } catch (error) {
    console.error(error);

    req.flash("error", "Unable to load order");

    res.redirect("/orders");
  }
};

module.exports = {
  getMyOrders,
  getOrderDetails,
};