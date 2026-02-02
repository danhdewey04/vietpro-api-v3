const ProductModel = require("../../models/product");
const paginate = require("../../../libs/paginate");
exports.findAll = async (req, res) => {
  try {
    const query = {};
    if (req.query.is_featured) query.is_featured = req.query.is_featured;
    if (req.query.category_id) query.category_id = req.query.category_id;
    if (req.query.keyword) query.$text = { $search: req.query.keyword };
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = page * limit - limit;
    const products = await ProductModel.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ _id: -1 });
    return res.status(200).json({
      status: "success",
      message: "Get products successfully",
      data: products,
      pages: await paginate(page, limit, query, ProductModel),
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};
exports.findOne = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await ProductModel.findById(id);
    return res.status(200).json({
      status: "success",
      message: "Get product successfully",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};
// Generated
// Create new product
exports.create = async (req, res) => {
  try {
    const {
      category_id,
      name,
      image,
      price,
      status,
      accessories,
      promotion,
      details,
      is_stock,
      is_featured,
    } = req.body;

    // Validate required fields
    if (!category_id || !name || !image || !price || !status || !accessories || !promotion || !details) {
      return res.status(400).json({ status: "error", message: "Missing required fields" });
    }

    const newProduct = await ProductModel.create({
      category_id,
      name,
      image,
      price,
      status,
      accessories,
      promotion,
      details,
      is_stock: is_stock !== undefined ? is_stock : true,
      is_featured: is_featured !== undefined ? is_featured : false,
    });
    return res.status(201).json({ status: "success", message: "Product created successfully", data: newProduct });
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Internal server error", error: error.message });
  }
};

// Update product by id (partial)
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {};
    const fields = [
      "category_id",
      "name",
      "image",
      "price",
      "status",
      "accessories",
      "promotion",
      "details",
      "is_stock",
      "is_featured",
    ];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) updateData[f] = req.body[f];
    });
    const updated = await ProductModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) return res.status(404).json({ status: "error", message: "Product not found" });
    return res.status(200).json({ status: "success", message: "Product updated successfully", data: updated });
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Internal server error", error: error.message });
  }
};

// Delete product by id
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const removed = await ProductModel.findByIdAndDelete(id);
    if (!removed) return res.status(404).json({ status: "error", message: "Product not found" });
    return res.status(200).json({ status: "success", message: "Product deleted successfully", data: removed });
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Internal server error", error: error.message });
  }
};
