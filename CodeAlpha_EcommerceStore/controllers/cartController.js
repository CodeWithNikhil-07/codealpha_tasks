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
      (item) => item.product.toString() === productId
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

module.exports = {
  addToCart,
  getCart,
};