const express = require("express");
const router = express.Router();

// Import Controller
const CategoryController = require("../apps/controllers/apis/category");
const ProductController = require("../apps/controllers/apis/product");
const OrderController = require("../apps/controllers/apis/order");
const CommentController = require("../apps/controllers/apis/comment");
const CustomerAuthController = require("../apps/controllers/apis/customerAuth");
const BannerController = require("../apps/controllers/apis/banner");
const TestController = require("../test/testController");

// Import Middleware
const { registerValidator } = require("../apps/middlewares/customerValidator");
const { verifyCustomer } = require("../apps/middlewares/orderAuth");
const {
  createOrderRules,
  createOrderValidator,
} = require("../apps/middlewares/orderValidator");
const {
  loginRules,
  loginValidator,
} = require("../apps/middlewares/authValidator");

const {
  verifyAccessToken,
  verifyRefreshToken,
} = require("../apps/middlewares/customerAuth");

router.post(
  "/auth/customers/register",
  registerValidator,
  CustomerAuthController.register
);
router.post(
  "/auth/customers/login",
  loginRules,
  loginValidator,
  CustomerAuthController.login
);
router.post("/auth/customers/logout", verifyAccessToken, CustomerAuthController.logout);
router.post(
  "/auth/customers/refresh",
  verifyRefreshToken,
  CustomerAuthController.resfreshToken
);
router.get(
  "/auth/customers/me",
  verifyAccessToken,
  CustomerAuthController.getMe
);

//Generated
// Password reset & social login
router.post("/auth/customers/forgot-password", CustomerAuthController.forgotPassword);
router.post("/auth/customers/reset-password", CustomerAuthController.resetPassword);
router.post("/auth/customers/social-login", CustomerAuthController.socialLogin);

router.get("/categories", CategoryController.findAll);
router.get("/categories/:id", CategoryController.findOne);
router.get("/products", ProductController.findAll);
router.get("/products/:id/comments", CommentController.findByProductId);
router.post("/products/:id/comments", CommentController.create);
router.get("/products/:id", ProductController.findOne);
// Banners (public)
router.get("/banners", BannerController.getAllBanners);
router.get("/banners/:id", BannerController.getBannerById);

// Admin routes (protected)
// Categories
router.post("/admin/categories", verifyAccessToken, CategoryController.create);
router.get("/admin/categories", verifyAccessToken, CategoryController.findAll);
router.get("/admin/categories/:id", verifyAccessToken, CategoryController.findOne);
router.patch("/admin/categories/:id", verifyAccessToken, CategoryController.update);
router.delete("/admin/categories/:id", verifyAccessToken, CategoryController.delete);

// Products
router.post("/admin/products", verifyAccessToken, ProductController.create);
router.get("/admin/products", verifyAccessToken, ProductController.findAll);
router.get("/admin/products/:id", verifyAccessToken, ProductController.findOne);
router.patch("/admin/products/:id", verifyAccessToken, ProductController.update);
router.delete("/admin/products/:id", verifyAccessToken, ProductController.delete);

// Comments
router.get("/admin/comments", verifyAccessToken, CommentController.findAll);
router.get("/admin/comments/:id", verifyAccessToken, CommentController.findOne);
router.patch("/admin/comments/:id", verifyAccessToken, CommentController.update);
router.delete("/admin/comments/:id", verifyAccessToken, CommentController.delete);

// Customers (members)
router.get("/admin/customers", verifyAccessToken, CustomerAuthController.findAll);
router.get("/admin/customers/:id", verifyAccessToken, CustomerAuthController.findOne);
router.patch("/admin/customers/:id", verifyAccessToken, CustomerAuthController.update);
router.delete("/admin/customers/:id", verifyAccessToken, CustomerAuthController.delete);

// Orders (admin)
router.get("/admin/orders", verifyAccessToken, OrderController.findAllAdmin);
router.get("/admin/orders/:id", verifyAccessToken, OrderController.findOne);
router.patch("/admin/orders/:id", verifyAccessToken, OrderController.updateOrder);
router.patch("/admin/orders/:id/status", verifyAccessToken, OrderController.changeStatus);
router.delete("/admin/orders/:id", verifyAccessToken, OrderController.deleteOrder);

// Admin Banners
router.post("/admin/banners", verifyAccessToken, BannerController.createBanner);
router.get("/admin/banners", verifyAccessToken, BannerController.getAllBanners);
router.get("/admin/banners/:id", verifyAccessToken, BannerController.getBannerById);
router.patch("/admin/banners/:id", verifyAccessToken, BannerController.updateBanner);
router.delete("/admin/banners/:id", verifyAccessToken, BannerController.deleteBanner);

router.post(
  "/customers/orders",
  verifyCustomer,
  createOrderRules,
  createOrderValidator,
  OrderController.order
);
router.get(
  "/customers/orders", 
  verifyAccessToken, 
  OrderController.findByCustomerId
);
router.get("/customers/orders/:id", verifyAccessToken, OrderController.findOne);
router.patch(
"/customers/orders/:id/cancel", 
  verifyAccessToken,
  OrderController.cancel
);

// Test cache
router.get("/cache/products/basic", TestController.cacheBasic);
router.get("/cache/products/advanced", TestController.cacheAdvanced);
router.get("/cache/products/redis", TestController.cacheRedis);

module.exports = router;
