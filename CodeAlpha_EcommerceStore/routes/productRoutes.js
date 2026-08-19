const express = require("express");

const router = express.Router();

const {
    getAdminProducts,
    showCreateProductForm,
    createProduct,
    showEditProductForm,
    updateProduct,
    deleteProduct,
    getProducts,
    getProductDetails,
} = require("../controllers/productController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// ADMIN PRODUCT ROUTES

// Manage all products
router.get(
    "/admin",
    authMiddleware,
    adminMiddleware,
    getAdminProducts
);

// Show create product form
router.get(
    "/admin/new",
    authMiddleware,
    adminMiddleware,
    showCreateProductForm
);

// Create product
router.post(
    "/admin",
    authMiddleware,
    adminMiddleware,
    createProduct
);


// Show edit product form

router.get(
    "/admin/:id/edit",
    authMiddleware,
    adminMiddleware,
    showEditProductForm
);


// Update product

router.put(
    "/admin/:id",
    authMiddleware,
    adminMiddleware,
    updateProduct
);


// Delete product

router.delete(
    "/admin/:id",
    authMiddleware,
    adminMiddleware,
    deleteProduct
);


// View all products
router.get(
    "/",
    getProducts
);


// View single product
router.get(
    "/:id",
    getProductDetails
);


module.exports = router;