const Order = require("../models/Order");

const adminTest = (req, res) => {
  res.send("Welcome Admin! You have access.");
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.render("admin/orders/index", {
      orders,
    });

  } catch (error) {
    console.error(error);

    req.flash("error", "Unable to load orders");

    res.redirect("/admin");
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    const allowedStatuses = [
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled"
    ];

    if (!allowedStatuses.includes(status)) {
      req.flash("error", "Invalid order status");

      return res.redirect("/admin/orders");
    }

    const order = await Order.findById(orderId);

    if (!order) {
      req.flash("error", "Order not found");

      return res.redirect("/admin/orders");
    }

    order.orderStatus = status;

    await order.save();

    req.flash("success", "Order status updated");

    res.redirect("/admin/orders");

  } catch (error) {
    console.error(error);

    req.flash("error", "Unable to update order status");

    res.redirect("/admin/orders");
  }
};

// ADMIN DASHBOARD
const getAdminDashboard = async (req, res) => {
  try {
    const Product = require("../models/Product");
    const User = require("../models/User");

    const productCount = await Product.countDocuments();

    const orderCount = await Order.countDocuments();

    const userCount = await User.countDocuments();

    const recentOrders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    res.render("admin/dashboard", {
      productCount,
      orderCount,
      userCount,
      recentOrders,
    });

  } catch (error) {
    console.error(error);

    req.flash("error", "Unable to load admin dashboard");

    res.redirect("/products");
  }
};

module.exports = {
  adminTest,
  getAdminDashboard,
  getAllOrders,
  updateOrderStatus,
};