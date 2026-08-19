const Product = require("../models/Product");

const getAdminProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.render("admin/products/index", { products });
  } catch (error) {
    console.error(error);
    req.flash("error", "Unable to load products");
    res.redirect("/admin");
  }
};

const showCreateProductForm = (req, res) => {
  res.render("admin/products/new");
};

const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      imageUrl,
      category,
      stock,
    } = req.body;

    const product = new Product({
      name,
      description,
      price,
      imageUrl,
      category,
      stock,
    });

    await product.save();

    req.flash("success", "Product created successfully");
    res.redirect("/products/admin");
  } catch (error) {
    console.error(error);
    req.flash("error", "Unable to create product");
    res.redirect("/products/admin/new");
  }
};

const showEditProductForm = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      req.flash("error", "Product not found");
      return res.redirect("/products/admin");
    }

    res.render("admin/products/edit", { product });
  } catch (error) {
    console.error(error);
    req.flash("error", "Unable to load product");
    res.redirect("/products/admin");
  }
};

const updateProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      imageUrl,
      category,
      stock,
    } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        price,
        imageUrl,
        category,
        stock,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      req.flash("error", "Product not found");
      return res.redirect("/products/admin");
    }

    req.flash("success", "Product updated successfully");
    res.redirect("/products/admin");
  } catch (error) {
    console.error(error);
    req.flash("error", "Unable to update product");
    res.redirect("/products/admin");
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      req.flash("error", "Product not found");
      return res.redirect("/products/admin");
    }

    req.flash("success", "Product deleted successfully");
    res.redirect("/products/admin");
  } catch (error) {
    console.error(error);
    req.flash("error", "Unable to delete product");
    res.redirect("/products/admin");
  }
};

const getProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;

    const filter = {
      stock: { $gt: 0 },
    };

    // Search by product name.
    if (search) {
      filter.name = {
        $regex: search,
        $options: "i",
      };
    }

    // Filter by category.
    if (category) {
      filter.category = category;
    }

    let query = Product.find(filter);

    if (sort === "low") {
      query = query.sort({ price: 1 });
    } else if (sort === "high") {
      query = query.sort({ price: -1 });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    const products = await query;
    const categories = await Product.distinct("category");

    res.render("products/index", {
      products,
      categories,
      search: search || "",
      selectedCategory: category || "",
      selectedSort: sort || "",
    });
  } catch (error) {
    console.error(error);
    req.flash("error", "Unable to load products");
    res.redirect("/");
  }
};

const getProductDetails = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      req.flash("error", "Product not found");
      return res.redirect("/products");
    }

    res.render("products/show", { product });
  } catch (error) {
    console.error(error);
    req.flash("error", "Unable to load product");
    res.redirect("/products");
  }
};

module.exports = {
  getAdminProducts,
  showCreateProductForm,
  createProduct,
  showEditProductForm,
  updateProduct,
  deleteProduct,
  getProducts,
  getProductDetails,
};