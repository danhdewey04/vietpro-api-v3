const CustomerModel = require("../../models/customer");
const { addTokenBlacklist } = require("../../../libs/redis.token");
const jwt = require("../../../libs/jwt");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const { deleteCustomerToken, storeCustomerToken } = require("../../../libs/token.service");
const sendMail = require("../../emails/mailer");
const jwtLib = require("jsonwebtoken");
const config = require("config");
// Verify Google id_tokens and call Facebook Graph API
const { OAuth2Client } = require("google-auth-library");
const fetch = require("node-fetch");
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const FB_APP_ID = process.env.FB_APP_ID;
exports.register = async (req, res) => {
  try {
    // Validate form
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "error",
        message: "Validator customer",
        errors: errors.array(),
      });
    }
    const { fullName, email, password, phone, address } = req.body;
    // Validate unique email
    const emailExists = await CustomerModel.findOne({ email });
    if (emailExists)
      return res.status(400).json({
        status: "error",
        message: "Email already exists",
      });
    // Validate unique password
    const phoneExists = await CustomerModel.findOne({ phone });
    if (phoneExists)
      return res.status(400).json({
        status: "error",
        message: "Phone already exists",
      });
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const newCustomer = await CustomerModel.create({
      fullName,
      email,
      password: hashedPassword,
      phone,
      address,
    });
    return res.status(201).json({
      status: "success",
      message: "Registered customer successfully",
      data: newCustomer,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Check email
    const isEmail = await CustomerModel.findOne({ email });
    if (!isEmail)
      return res.status(400).json({
        status: "error",
        maessage: "Invalid email",
      });

    // Check password
    const isPassword = await bcrypt.compare(password, isEmail.password);
    if (!isPassword)
      return res.status(400).json({
        status: "error",
        maessage: "Invalid password",
      });

    if (isEmail && isPassword) {
      // Generate Token
      const accessToken = await jwt.generateAccessToken(isEmail);
      const refreshToken = await jwt.generateRefreshToken(isEmail);
      const { password, ...others } = isEmail.toObject();

      //Insert Token to Database
      storeCustomerToken(others._id, accessToken, refreshToken);

      // Response Token & Customer
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "Strict",
        maxAg: 24 * 60 * 60 * 1000,
      });
      return res.status(200).json({
        status: "success",
        message: "Logged in successfully",
        customer: others,
        accessToken,
      });
    }
  } catch (error) {
    return res.status(500).json({
      ststus: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};
exports.logout = async (req, res) => {
  try{
    const { customer } = req;
    //Di chuyển Token (Access Token & Refresh Token) vào redis
    await addTokenBlacklist(customer.id);
    //Xoá Token trong DB
    deleteCustomerToken(customer.id);
    return res.status(200).json({
      status: "success",
      message: "Logout Successfully",
    });
  }
  catch(error){
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};
exports.resfreshToken = async (req, res) => {
  try {
    const { customer } = req;
    const accessToken = await jwt.generateAccessToken(customer);
    return res.status(200).json({
      status: "success",
      message: "Access token refreshed successfully",
      accessToken,
    });
  } catch (error) {
    return res.status(500).json({
      ststus: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};
exports.getMe = async (req, res) => {
  try {
    const { customer } = req;
    res.status(200).json({
      status: "success",
      message: "User profile retrieved successfully",
      data: customer,
    });
  } catch (error) {
    return res.status(500).json({
      ststus: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Generated
// Request password reset: generate token and send email
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ status: "error", message: "Email is required" });
    const customer = await CustomerModel.findOne({ email });
    if (!customer)
      return res.status(404).json({ status: "error", message: "Customer not found" });

    // Generate a short-lived token for password reset
    const resetToken = jwtLib.sign(
      { id: customer._id, email: customer.email },
      config.get("app.jwtAccessKey"),
      { expiresIn: "1h" }
    );

    // Prepare reset link (frontend should handle route). Return token in response for dev.
    const resetLink = `${req.protocol}://${req.get("host")}/auth/customers/reset-password?token=${resetToken}`;

    // Send email (use template)
    try {
      await sendMail(require("path").resolve(__dirname, "../../emails/templates/reset-password.ejs"), {
        email: customer.email,
        subject: "Reset your password",
        name: customer.fullName,
        resetLink,
        token: resetToken,
      });
    } catch (mailErr) {
      // If email fails, still return token so dev/client can proceed
      console.error("Send reset email failed:", mailErr.message || mailErr);
    }

    return res.status(200).json({ status: "success", message: "Password reset token generated", data: { resetToken, resetLink } });
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Internal server error", error: error.message });
  }
};

// Reset password with token
exports.resetPassword = async (req, res) => {
  try {
    // Accept token from body, query or Authorization header for convenience during testing
  const newPassword = req.body.newPassword || req.body.password;
  // Accept various token field names from body for convenience (token, Token, resetToken, ResetToken)
  const tokenFromBody = req.body.token || req.body.Token || req.body.resetToken || req.body.ResetToken;
    const tokenFromQuery = req.query.token || req.query.Token || req.query.Authorization || req.query.authorization;
    const authHeader = req.headers.authorization || req.headers.Authorization;
    let token = tokenFromBody || tokenFromQuery;
    if (!token && authHeader) {
      // header may be 'Bearer <token>' or just the token
      token = authHeader.includes(" ") ? authHeader.split(" ")[1] : authHeader;
    }

    if (!token || !newPassword) {
      return res.status(400).json({ status: "error", message: "Token and newPassword are required" });
    }

    let payload;
    try {
      payload = jwtLib.verify(token, config.get("app.jwtAccessKey"));
    } catch (err) {
      console.error("resetPassword.verify.error:", err && err.message ? err.message : err);
      return res.status(400).json({ status: "error", message: "Invalid or expired token" });
    }
    const customer = await CustomerModel.findById(payload.id);
    if (!customer) return res.status(404).json({ status: "error", message: "Customer not found" });

    const hashed = await bcrypt.hash(newPassword, 10);
    customer.password = hashed;
    await customer.save();

    // Optionally delete existing tokens so user must re-login
    try {
      await deleteCustomerToken(customer._id);
    } catch (e) {
      // ignore if no token
    }

    return res.status(200).json({ status: "success", message: "Password updated successfully" });
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Internal server error", error: error.message });
  }
};

// Social login (Facebook, Google, or other).
// Supported payloads:
// - Google: { provider: "google", idToken: "<GOOGLE_ID_TOKEN>", phone, address }
// - Facebook: { provider: "facebook", accessToken: "<FB_ACCESS_TOKEN>", phone, address }
exports.socialLogin = async (req, res) => {
  try {
    const { provider } = req.body;
    if (!provider) return res.status(400).json({ status: "error", message: "provider is required" });

    let finalProviderId = null;
    let finalEmail = null;
    let finalFullName = null;
    // Verify tokens according to provider
    if (provider === "google") {
      const { idToken, phone, address } = req.body;
      if (!idToken) return res.status(400).json({ status: "error", message: "idToken is required for Google login" });
      if (!GOOGLE_CLIENT_ID) console.warn("GOOGLE_CLIENT_ID is not set in env; verify will still run but audience check may fail");
      const client = new OAuth2Client(GOOGLE_CLIENT_ID);
      let ticket;
      try {
        ticket = await client.verifyIdToken({ idToken, audience: GOOGLE_CLIENT_ID });
      } catch (err) {
        return res.status(400).json({ status: "error", message: "Invalid Google idToken", error: err.message });
      }
      const payload = ticket.getPayload();
      finalProviderId = payload.sub;
      finalEmail = payload.email;
      finalFullName = payload.name || payload.given_name || payload.email;
      // If user not exists we require phone+address (model requires them)
      req.body.phone = phone;
      req.body.address = address;
    } else if (provider === "facebook") {
      const { accessToken, phone, address } = req.body;
      if (!accessToken) return res.status(400).json({ status: "error", message: "accessToken is required for Facebook login" });
      // Verify Facebook token and fetch profile
      try {
        // Validate token and get user info
        const fbRes = await fetch(`https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`);
        const fbJson = await fbRes.json();
        if (fbJson.error) {
          return res.status(400).json({ status: "error", message: "Invalid Facebook access token", error: fbJson.error });
        }
        finalProviderId = fbJson.id;
        finalFullName = fbJson.name;
        finalEmail = fbJson.email;
      } catch (err) {
        return res.status(400).json({ status: "error", message: "Failed to verify Facebook token", error: err.message });
      }
      req.body.phone = phone;
      req.body.address = address;
    } else {
      return res.status(400).json({ status: "error", message: "Unsupported provider" });
    }

    // Now we should have finalEmail (or client may also send email)
    const emailFromBody = req.body.email;
    const phone = req.body.phone;
    const address = req.body.address;
    const emailToUse = finalEmail || emailFromBody;
    if (!emailToUse) return res.status(400).json({ status: "error", message: "Email is required (from provider payload or body)" });

    // Find existing customer by email
    let customer = await CustomerModel.findOne({ email: emailToUse });
    if (!customer) {
      // Creating new customer: phone and address required by model
      if (!phone || !address) return res.status(400).json({ status: "error", message: "phone and address are required to create a new social customer" });
      const randomPass = Math.random().toString(36).slice(-8);
      const hashed = await bcrypt.hash(randomPass, 10);
      customer = await CustomerModel.create({ fullName: finalFullName || emailToUse, email: emailToUse, password: hashed, phone, address });
    }

    // Generate tokens and store
    const accessToken = await jwt.generateAccessToken(customer);
    const refreshToken = await jwt.generateRefreshToken(customer);
    const { password, ...others } = customer.toObject();
    storeCustomerToken(others._id, accessToken, refreshToken);
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
      maxAg: 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({ status: "success", message: `Logged in with ${provider} successfully`, customer: others, accessToken });
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Internal server error", error: error.message });
  }
};

// Generated
// Admin: list customers with pagination
exports.findAll = async (req, res) => {
  try {
    const query = {};
    if (req.query.keyword) query.$or = [
      { fullName: { $regex: req.query.keyword, $options: "i" } },
      { email: { $regex: req.query.keyword, $options: "i" } },
      { phone: { $regex: req.query.keyword, $options: "i" } },
    ];
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = page * limit - limit;
    const customers = await CustomerModel.find(query).skip(skip).limit(limit).sort({ _id: -1 });
    const paginateLib = require("../../../libs/paginate");
    return res.status(200).json({
      status: "success",
      message: "Get customers successfully",
      data: customers,
      pages: await paginateLib(page, limit, query, CustomerModel),
    });
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Internal server error", error: error.message });
  }
};

// Admin: get one customer by id
exports.findOne = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await CustomerModel.findById(id).select("-password");
    if (!customer) return res.status(404).json({ status: "error", message: "Customer not found" });
    return res.status(200).json({ status: "success", message: "Get customer successfully", data: customer });
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Internal server error", error: error.message });
  }
};

// Admin: update customer (partial)
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, phone, address } = req.body;
    const updateData = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    const updated = await CustomerModel.findByIdAndUpdate(id, updateData, { new: true }).select("-password");
    if (!updated) return res.status(404).json({ status: "error", message: "Customer not found" });
    return res.status(200).json({ status: "success", message: "Customer updated successfully", data: updated });
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Internal server error", error: error.message });
  }
};

// Admin: delete customer
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const removed = await CustomerModel.findByIdAndDelete(id).select("-password");
    if (!removed) return res.status(404).json({ status: "error", message: "Customer not found" });
    return res.status(200).json({ status: "success", message: "Customer deleted successfully", data: removed });
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Internal server error", error: error.message });
  }
};
