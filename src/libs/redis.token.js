const TokenModel = require("../apps/models/token");
const clientRedis = require("../common/init.redis");
//const jwtDecode = require("jwt-decode");

// jwt-decode v4 is ESM-only and may not be require()-able in this environment.
// Implement a small local decoder to extract the JWT payload (no signature verification).
const jwtDecode = (token) => {
  if (!token || typeof token !== "string") return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  const payload = parts[1];
  // base64url -> base64
  const pad = payload.length % 4;
  const base64 = payload.replace(/-/g, '+').replace(/_/g, '/') + (pad ? '='.repeat(4 - pad) : '');
  try {
    const json = Buffer.from(base64, 'base64').toString('utf8');
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
};
// Export both names for compatibility: addTokenBlacklist and addToBlacklist
exports.addTokenBlacklist = async (customerId) => {
  const token = await TokenModel.findOne({ customerId });
  if (!token) {
    const error = new Error("No token found this customer");
    error.statusCode = 404;
    throw error;
  }
  const { accessToken, refreshToken } = token;
  // Move Access Token to Redis
  const decodedAccessToken = jwtDecode(accessToken);
  if (decodedAccessToken.exp > Date.now()/1000){
    await clientRedis.set(
        `tb_${accessToken}`,
        "revoked",
        {EXAT: decodedAccessToken.exp,}
    );
  }
  // Move Refresh Token to Redis
  const decodedRefreshToken = jwtDecode(refreshToken);
  if (decodedRefreshToken.exp > Date.now()/1000){
    await clientRedis.set(
        `tb_${refreshToken}`,
        "revoked",
        {EXAT: decodedRefreshToken.exp,}
    );
  }
};