# 🚀 CodeAlpha — Ecommerce Store

> A full-stack ecommerce web application built with **Node.js, Express, MongoDB, and EJS** as part of the **CodeAlpha Internship — Task 1**.

CodeAlpha Ecommerce Store allows customers to browse products, search and filter products, manage their shopping cart, place orders, and manage their profiles — all from one simple ecommerce platform.

---

## ✨ Features

### 🔐 Authentication

- User registration and login
- Secure password hashing with bcrypt
- Session-based authentication
- Logout functionality
- Protected routes and access control
- Admin authentication and authorization
- Role-based access control

### 🛍️ Product Management

- Browse all available products
- View individual product details
- Search products by name
- Filter products by category
- Sort products by price
- Stock-based product availability
- Product categories
- Product descriptions and pricing
- Product images

### 👨‍💼 Admin Product Management

- Admin dashboard
- View total products
- Add new products
- Edit existing products
- Delete products
- View product stock
- Manage product categories
- Manage product images
- Admin-only product management

### 🛒 Shopping Cart

- Add products to cart
- View cart items
- Update product quantities
- Remove products from cart
- Calculate cart totals
- Stock-aware cart management
- Protected cart functionality for logged-in users

### 💳 Checkout

- Checkout page
- Order summary
- Customer order information
- Payment method selection
- Order total calculation
- Create customer orders
- Order success page

### 📦 Order Management

#### Customer

- View order history
- View individual order details
- View order status
- View order total
- View order date
- Track order progress

#### Admin

- View all customer orders
- View customer information
- View order totals
- View payment information
- View payment status
- Update order status
- Manage order lifecycle:
  - Processing
  - Shipped
  - Delivered
  - Cancelled

### 👤 User Profile

- View user profile
- Manage account information
- Protected profile routes
- Session-based user access

### 📊 Admin Dashboard

- View total products
- View total orders
- View total users
- View recent orders
- Quick product management
- Quick order management
- Store navigation

### 🔔 Flash Messages & Error Handling

- Success flash messages
- Error flash messages
- Form validation
- Friendly error handling
- Custom error page
- Protected routes

### 🎨 UI & UX

- Responsive interface
- Tailwind CSS styling
- Clean ecommerce layout
- Admin dashboard
- Product cards
- Responsive forms
- Mobile-friendly design
- User-friendly navigation

---

## 🛠️ Tech Stack

| Technology          | Purpose                  |
| ------------------- | ------------------------ |
| **Node.js**         | Backend runtime          |
| **Express.js**      | Web framework            |
| **MongoDB**         | Database                 |
| **Mongoose**        | MongoDB object modeling  |
| **EJS**              | Server-side templating   |
| **Tailwind CSS**    | UI styling               |
| **bcrypt**          | Password hashing         |
| **express-session** | Session authentication   |
| **connect-mongo**   | MongoDB session storage  |
| **connect-flash**   | Flash messages           |
| **dotenv**          | Environment variables    |
| **method-override** | PUT/DELETE form requests |
| **Multer**          | File upload handling     |

---

## 📂 Project Structure

```text
CodeAlpha_EcommerceStore/
│
├── config/
│   └── db.js
│
├── controllers/
│   ├── adminController.js
│   ├── authController.js
│   ├── cartController.js
│   ├── checkoutController.js
│   ├── orderController.js
│   ├── productController.js
│   └── profileController.js
│
├── middleware/
│   ├── adminMiddleware.js
│   └── authMiddleware.js
│
├── models/
│   ├── Cart.js
│   ├── Order.js
│   ├── Product.js
│   └── User.js
│
├── routes/
│   ├── adminRoutes.js
│   ├── authRoutes.js
│   ├── cartRoutes.js
│   ├── checkoutRoutes.js
│   ├── orderRoutes.js
│   ├── productRoutes.js
│   └── profileRoutes.js
│
├── views/
│   │
│   ├── admin/
│   │   ├── dashboard.ejs
│   │   │
│   │   ├── orders/
│   │   │   └── index.ejs
│   │   │
│   │   └── products/
│   │       ├── index.ejs
│   │       ├── new.ejs
│   │       └── edit.ejs
│   │
│   ├── auth/
│   │   ├── login.ejs
│   │   └── register.ejs
│   │
│   ├── cart/
│   │   └── index.ejs
│   │
│   ├── checkout/
│   │   ├── index.ejs
│   │   └── success.ejs
│   │
│   ├── orders/
│   │   ├── index.ejs
│   │   └── details.ejs
│   │
│   ├── products/
│   │   ├── index.ejs
│   │   └── show.ejs
│   │
│   ├── profile/
│   │   └── index.ejs
│   │
│   └── error.ejs
│
├── .env
├── .gitignore
├── app.js
├── package.json
├── package-lock.json
├── seed.js
└── README.md