const Cart = require("../models/Cart");
const Product = require("../models/Product");

// ADD PRODUCT TO CART

const addToCart = async (req, res) => {
  try {
    const userId = req.session.userId;
    const productId = req.params.id;

    const product = await Product.findById(productId);

    if (!product) {
      req.flash("error", "Product not found");
      return res.redirect("/products");
    }

    if (product.stock <= 0) {
      req.flash("error", "Product is out of stock");
      return res.redirect(`/products/${productId}`);
    }

    let cart = await Cart.findOne({
      user: userId,
    });

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [],
      });
    }

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId,
    );

    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        req.flash("error", "Maximum available stock already added");
        return res.redirect(`/products/${productId}`);
      }

      existingItem.quantity += 1;
    } else {
      cart.items.push({
        product: productId,
        quantity: 1,
      });
    }

    await cart.save();

    req.flash("success", "Product added to cart");

    res.redirect("/cart");
  } catch (error) {
    console.error(error);

    req.flash("error", "Unable to add product to cart");

    res.redirect("/products");
  }
};

// VIEW CART

const getCart = async (req, res) => {
  try {
    const userId = req.session.userId;

    const cart = await Cart.findOne({
      user: userId,
    }).populate("items.product");

    if (!cart) {
      return res.render("cart/index", {
        cart: {
          items: [],
        },
        subtotal: 0,
      });
    }

    let subtotal = 0;

    cart.items.forEach((item) => {
      if (item.product) {
        subtotal += item.product.price * item.quantity;
      }
    });

    res.render("cart/index", {
      cart,
      subtotal,
    });
  } catch (error) {
    console.error(error);

    req.flash("error", "Unable to load cart");

    res.redirect("/products");
  }
};

// ==========================================
// INCREASE CART ITEM QUANTITY
// ==========================================

const increaseQuantity = async (req, res) => {
  try {
    const userId = req.session.userId;
    const productId = req.params.id;

    const cart = await Cart.findOne({
      user: userId,
    });

    if (!cart) {
      req.flash("error", "Cart not found");
      return res.redirect("/cart");
    }

    const cartItem = cart.items.find(
      (item) => item.product.toString() === productId,
    );

    if (!cartItem) {
      req.flash("error", "Product not found in cart");
      return res.redirect("/cart");
    }

    const product = await Product.findById(productId);

    if (!product) {
      req.flash("error", "Product not found");
      return res.redirect("/cart");
    }

    // Don't allow quantity to exceed available stock
    if (cartItem.quantity >= product.stock) {
      req.flash("error", "Maximum available stock reached");
      return res.redirect("/cart");
    }

    cartItem.quantity += 1;

    await cart.save();

    req.flash("success", "Quantity increased");

    res.redirect("/cart");
  } catch (error) {
    console.error(error);

    req.flash("error", "Unable to increase quantity");

    res.redirect("/cart");
  }
};

// ==========================================
// DECREASE CART ITEM QUANTITY
// ==========================================

const decreaseQuantity = async (req, res) => {
  try {
    const userId = req.session.userId;
    const productId = req.params.id;

    const cart = await Cart.findOne({
      user: userId,
    });

    if (!cart) {
      req.flash("error", "Cart not found");
      return res.redirect("/cart");
    }

    const cartItem = cart.items.find(
      (item) => item.product.toString() === productId,
    );

    if (!cartItem) {
      req.flash("error", "Product not found in cart");
      return res.redirect("/cart");
    }

    // If quantity is 1, remove the item
    if (cartItem.quantity === 1) {
      cart.items = cart.items.filter(
        (item) => item.product.toString() !== productId,
      );
    } else {
      cartItem.quantity -= 1;
    }

    await cart.save();

    req.flash("success", "Quantity updated");

    res.redirect("/cart");
  } catch (error) {
    console.error(error);

    req.flash("error", "Unable to decrease quantity");

    res.redirect("/cart");
  }
};

// ==========================================
// REMOVE ITEM FROM CART
// ==========================================

const removeFromCart = async (req, res) => {
  try {
    const userId = req.session.userId;
    const productId = req.params.id;

    const cart = await Cart.findOne({
      user: userId,
    });

    if (!cart) {
      req.flash("error", "Cart not found");
      return res.redirect("/cart");
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId,
    );

    await cart.save();

    req.flash("success", "Product removed from cart");

    res.redirect("/cart");
  } catch (error) {
    console.error(error);

    req.flash("error", "Unable to remove product");

    res.redirect("/cart");
  }
};

module.exports = {
  addToCart,
  getCart,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
};
