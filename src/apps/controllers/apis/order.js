const ProductModel = require("../../models/product");
const OrderModel = require("../../models/order");
const sendMail = require("../../../emails/mail");
const config = require("config");
const paginate = require("../../../libs/paginate");
exports.order = async (req, res) => {
  try {
    let customerInfo = {};
    if (req.customer) {
      // Customer
      customerInfo = {
        customer_id: req.customer._id,
        fullName: req.customer.fullName,
        email: req.customer.email,
        phone: req.customer.phone,
        address: req.customer.address,
      };
    } else {
      // Guest
      const { fullName, email, phone, address } = req.body;
      customerInfo = { fullName, email, phone, address };
    }
    // Create new items
    let totalPrice = 0;
    let orderItems = [];
    let orderMail = [];
    const { items } = req.body;
    for (let item of items) {
      const product = await ProductModel.findById(item.prd_id);
      if (!product) {
        return res.status(400).json({
          status: "error",
          message: `Product ${item.prd_id} not found`,
        });
      }
      const itemPrice = product.price;
      totalPrice += item.qty * itemPrice;
      orderItems.push({
        prd_id: product._id,
        qty: item.qty,
        price: itemPrice,
      });
      orderMail.push({
        name: product.name,
        qty: item.qty,
        price: itemPrice,
      });
    }
    // Create order
    const order = await OrderModel.create({
      ...customerInfo,
      totalPrice,
      items: orderItems,
    });
    // Send mail
    await sendMail(`${config.get("mail.mailTemplate")}/mail-order.ejs`, {
      ...customerInfo,
      totalPrice,
      items: orderMail,
      subject: "Xác nhận đơn hàng từ Vietpro Shop ✔",
    });
    // Response
    return res.status(201).json({
      status: "success",
      message: "Create order successfully",
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};
exports.findByCustomerId = async (req, res) => {
  try {
    const {id} = req.customer;
    const query = {};
    query.customer_id = id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = page * limit - limit;
    const orders = await OrderModel.find()
    .skip(skip)
    .limit(limit)
    .sort({_id: -1});
    return res.status(200).json({
      status: "success",
      message: "Get orders successfully",
      data: orders,
      pages: await paginate(page, limit, query, OrderModel), 
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
    const order = await OrderModel.findById(id);
    return res.status(200).json({
    status: "success",
    message: "Get order successfully",
    data: order,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};
exports.cancel = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await OrderModel.findByIdAndUpdate(
      id,
      {status: "canceled"},
      {new: true}
    );
    return res.status(200).json({
    status: "canceled",
    message: "Order has been canceled successfully",
    data: order,
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

// Admin: list orders with filters (status, email, phone, date range, totalPrice range)
exports.findAllAdmin = async (req, res) => {
  try {
    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.email) query.email = req.query.email;
    if (req.query.phone) query.phone = req.query.phone;
    if (req.query.minTotal || req.query.maxTotal) {
      query.totalPrice = {};
      if (req.query.minTotal) query.totalPrice.$gte = Number(req.query.minTotal);
      if (req.query.maxTotal) query.totalPrice.$lte = Number(req.query.maxTotal);
    }
    // date range filter on createdAt
    if (req.query.dateFrom || req.query.dateTo) {
      query.createdAt = {};
      if (req.query.dateFrom) query.createdAt.$gte = new Date(req.query.dateFrom);
      if (req.query.dateTo) query.createdAt.$lte = new Date(req.query.dateTo);
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = page * limit - limit;

    const orders = await OrderModel.find(query).skip(skip).limit(limit).sort({ _id: -1 });
    const paginateLib = require("../../../libs/paginate");
    return res.status(200).json({
      status: "success",
      message: "Get orders successfully",
      data: orders,
      pages: await paginateLib(page, limit, query, OrderModel),
    });
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Internal server error", error: error.message });
  }
};

// Admin: update order (customer info, items, totalPrice, status)
exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {};
    const { email, phone, address, items, status } = req.body;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (status !== undefined) updateData.status = status;

    if (items !== undefined) {
      // validate items and recompute totalPrice
      let totalPrice = 0;
      const orderItems = [];
      for (let item of items) {
        const product = await ProductModel.findById(item.prd_id);
        if (!product) {
          return res.status(400).json({ status: "error", message: `Product ${item.prd_id} not found` });
        }
        const itemPrice = product.price;
        totalPrice += item.qty * itemPrice;
        orderItems.push({ prd_id: product._id, qty: item.qty, price: itemPrice });
      }
      updateData.items = orderItems;
      updateData.totalPrice = totalPrice;
    }

    const updated = await OrderModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) return res.status(404).json({ status: "error", message: "Order not found" });
    return res.status(200).json({ status: "success", message: "Order updated successfully", data: updated });
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Internal server error", error: error.message });
  }
};

// Admin: change order status (approve/confirm/etc.)
exports.changeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) return res.status(400).json({ status: "error", message: "Status is required" });
    const allowed = ["pending", "confirmed", "shipping", "delivered", "canceled"];
    if (!allowed.includes(status)) return res.status(400).json({ status: "error", message: "Invalid status" });
    const updated = await OrderModel.findByIdAndUpdate(id, { status }, { new: true });
    if (!updated) return res.status(404).json({ status: "error", message: "Order not found" });
    return res.status(200).json({ status: "success", message: "Order status updated", data: updated });
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Internal server error", error: error.message });
  }
};

// Admin: delete order
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const removed = await OrderModel.findByIdAndDelete(id);
    if (!removed) return res.status(404).json({ status: "error", message: "Order not found" });
    return res.status(200).json({ status: "success", message: "Order deleted successfully", data: removed });
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Internal server error", error: error.message });
  }
};
