const CommentModel = require("../../models/comment");
const paginate = require("../../../libs/paginate");
exports.findByProductId = async (req, res) => {
  try {
    const { id } = req.params;
    const query = {};
    query.product_id = id;
    const sort = {};
    if (req.query.sort && req.query.sort == true) {
      sort._id = 1;
    } else {
      sort._id = -1;
    }
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = page * limit - limit;
    const comments = await CommentModel.find(query)
      .skip(skip)
      .limit(limit)
      .sort(sort);
    return res.status(200).json({
      status: "success",
      message: "Get comments successfully",
      data: comments,
      pages: await paginate(page, limit, query, CommentModel),
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};
exports.create = async (req, res) => {
  try {
    const { id } = req.params;
    const { body } = req;
    if (body.name === "")
      return res.status(400).json({
        status: "error",
        message: "Name is required",
      });
    if (body.email === "")
      return res.status(400).json({
        status: "error",
        message: "Email is required",
      });
    if (body.content === "")
      return res.status(400).json({
        status: "error",
        message: "Content is required",
      });
    const newComment = await CommentModel.create({
      product_id: id,
      name: body.name,
      email: body.email,
      content: body.content,
    });
    return res.status(201).json({
      status: "success",
      message: "Comment created successfully",
      data: newComment,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Admin: get all comments (with optional pagination)
exports.findAll = async (req, res) => {
  try {
    const query = {};
    if (req.query.product_id) query.product_id = req.query.product_id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = page * limit - limit;
    const sort = { _id: -1 };
    const comments = await CommentModel.find(query)
      .skip(skip)
      .limit(limit)
      .sort(sort);
    const paginateLib = require("../../../libs/paginate");
    return res.status(200).json({
      status: "success",
      message: "Get comments successfully",
      data: comments,
      pages: await paginateLib(page, limit, query, CommentModel),
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Admin: get one comment by id
exports.findOne = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await CommentModel.findById(id);
    if (!comment) {
      return res.status(404).json({ status: "error", message: "Comment not found" });
    }
    return res.status(200).json({ status: "success", message: "Get comment successfully", data: comment });
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Internal server error", error: error.message });
  }
};

// Admin: update comment by id
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, content } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (content !== undefined) updateData.content = content;
    const updated = await CommentModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) {
      return res.status(404).json({ status: "error", message: "Comment not found" });
    }
    return res.status(200).json({ status: "success", message: "Comment updated successfully", data: updated });
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Internal server error", error: error.message });
  }
};

// Admin: delete comment by id
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const removed = await CommentModel.findByIdAndDelete(id);
    if (!removed) {
      return res.status(404).json({ status: "error", message: "Comment not found" });
    }
    return res.status(200).json({ status: "success", message: "Comment deleted successfully", data: removed });
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Internal server error", error: error.message });
  }
};
