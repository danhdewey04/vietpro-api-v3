const CategoryModel = require("../../models/category");
exports.findAll = async (req, res) => {
  try {
    const categories = await CategoryModel.find();
    return res.status(200).json({
      status: "success",
      message: "Get categories successfully",
      data: categories,
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
    const category = await CategoryModel.findById(id);
    return res.status(200).json({
      status: "success",
      message: "Get category successflly",
      data: category,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Create new category
exports.create = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.toString().trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "Name is required",
      });
    }
    const newCategory = await CategoryModel.create({ name: name.toString().trim() });
    return res.status(201).json({
      status: "success",
      message: "Category created successfully",
      data: newCategory,
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
// Update existing category by id
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name || name.toString().trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "Name is required",
      });
    }
    const updated = await CategoryModel.findByIdAndUpdate(
      id,
      { name: name.toString().trim() },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({
        status: "error",
        message: "Category not found",
      });
    }
    return res.status(200).json({
      status: "success",
      message: "Category updated successfully",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Delete category by id
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const removed = await CategoryModel.findByIdAndDelete(id);
    if (!removed) {
      return res.status(404).json({
        status: "error",
        message: "Category not found",
      });
    }
    return res.status(200).json({
      status: "success",
      message: "Category deleted successfully",
      data: removed,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};
