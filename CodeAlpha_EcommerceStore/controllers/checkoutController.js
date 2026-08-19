const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Order = require("../models/Order");

const getCheckout = async (req, res) => {
  try {
    const userId = req.session.userId;

    const cart = await Cart.findOne({
      user: userId,
    }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      req.flash("error", "Your cart is empty");
      return res.redirect("/cart");
    }

    let subtotal = 0;

    cart.items.forEach((item) => {
      if (item.product) {
        subtotal += item.product.price * item.quantity;
      }
    });

    const shipping = subtotal >= 1000 ? 0 : 50;

    const total = subtotal + shipping;

    res.render("checkout/index", {
      cart,
      subtotal,
      shipping,
      total,
    });
  } catch (error) {
    console.error(error);

    req.flash("error", "Unable to load checkout");

    res.redirect("/cart");
  }
};

const placeOrder = async (req, res) => {
  try {
    const userId = req.session.userId;

    const {
      name,
      phone,
      address,
      city,
      state,
      pincode,
    } = req.body;

    const cart = await Cart.findOne({
      user: userId,
    }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      req.flash("error", "Your cart is empty");
      return res.redirect("/cart");
    }

    let subtotal = 0;

    const orderItems = [];

    for (const item of cart.items) {
      const product = item.product;

      if (!product) {
        req.flash("error", "Product no longer exists");
        return res.redirect("/cart");
      }

      if (product.stock < item.quantity) {
        req.flash(
          "error",
          `${product.name} does not have enough stock`
        );

        return res.redirect("/cart");
      }

      subtotal += product.price * item.quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      });
    }

    const shipping = subtotal >= 1000 ? 0 : 50;

    const total = subtotal + shipping;

    const order = new Order({
      user: userId,

      items: orderItems,

      shippingAddress: {
        name,
        phone,
        address,
        city,
        state,
        pincode,
      },

      subtotal,
      shipping,
      totalAmount: total,

      paymentMethod: "Cash on Delivery",

      paymentStatus: "Pending",

      orderStatus: "Processing",
    });

    await order.save();

    // Reduce product stock
    for (const item of cart.items) {
      const product = await Product.findById(
        item.product._id
      );

      product.stock -= item.quantity;

      await product.save();
    }

    // Clear cart
    cart.items = [];

    await cart.save();

    req.flash("success", "Order placed successfully");

    res.redirect(`/checkout/success/${order._id}`);
  } catch (error) {
    console.error(error);

    req.flash("error", "Unable to place order");

    res.redirect("/checkout");
  }
};

// ORDER SUCCESS PAGE
const orderSuccess = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      req.flash("error", "Order not found");
      return res.redirect("/products");
    }

    res.render("checkout/success", {
      order,
    });
  } catch (error) {
    console.error(error);

    req.flash("error", "Unable to load order");

    res.redirect("/products");
  }
};

module.exports = {
  getCheckout,
  placeOrder,
  orderSuccess,
};