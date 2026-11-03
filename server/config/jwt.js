// ==============================================================================
// CẤU HÌNH XÁC THỰC VÀ BẢO MẬT JWT (JSON WEB TOKEN)
// Sử dụng module Node.js Crypto chuẩn mực: HMAC-SHA256 & Băm mật khẩu an toàn
// ==============================================================================
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// Khóa bí mật dùng để ký và xác thực JWT
export const JWT_SECRET = process.env.JWT_SECRET || 'devops_st23b_online_bookstore_secret_jwt_key_2026';
// Thời hạn hiệu lực mặc định của Token (24 giờ = 86400 giây)
export const JWT_EXPIRES_IN_SECONDS = 86400;

/**
 * Mã hóa chuỗi hoặc object sang định dạng Base64URL
 * @param {object|string} data - Dữ liệu cần mã hóa
 * @returns {string} Chuỗi Base64URL an toàn
 */
function base64UrlEncode(data) {
  const str = typeof data === 'string' ? data : JSON.stringify(data);
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/**
 * Giải mã chuỗi Base64URL về object JSON hoặc chuỗi gốc
 * @param {string} str - Chuỗi Base64URL
 * @returns {any} Dữ liệu đã giải mã
 */
function base64UrlDecode(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

/**
 * Ký và tạo chuỗi JWT chứa Payload (UserId, Role, Email...)
 * @param {object} payload - Dữ liệu người dùng cần đính kèm vào Token
 * @param {number} expiresInSeconds - Thời gian tồn tại tính bằng giây
 * @returns {string} Chuỗi JWT hoàn chỉnh dạng header.payload.signature
 */
export function generateToken(payload, expiresInSeconds = JWT_EXPIRES_IN_SECONDS) {
  // 1. Tạo Header thuật toán HMAC SHA256
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  // 2. Thêm thời gian hết hạn (exp) và thời gian cấp (iat)
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  // 3. Encode Header và Payload
  const encodedHeader = base64UrlEncode(header);
  const encodedPayload = base64UrlEncode(fullPayload);

  // 4. Tạo chữ ký số HMAC SHA256 với JWT_SECRET
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Xác thực tính hợp lệ và giải mã nội dung JWT
 * @param {string} token - Chuỗi JWT gửi từ Client
 * @returns {object|null} Payload người dùng nếu hợp lệ, null nếu token sai hoặc hết hạn
 */
export function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, signature] = parts;

  // Tính toán lại chữ ký kỳ vọng để chống giả mạo
  const expectedSignature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  if (signature !== expectedSignature) {
    return null; // Chữ ký không khớp, dữ liệu bị can thiệp
  }

  try {
    const payloadStr = base64UrlDecode(encodedPayload);
    const payload = JSON.parse(payloadStr);

    // Kiểm tra thời hạn hiệu lực của Token
    const currentTime = Math.floor(Date.now() / 1000);
    if (payload.exp && currentTime > payload.exp) {
      return null; // Token đã hết hạn
    }

    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Băm mật khẩu an toàn bằng SHA256 kết hợp Salt bí mật
 * @param {string} password - Mật khẩu dạng plain text
 * @returns {string} Chuỗi mật khẩu băm Hex
 */
export function hashPassword(password) {
  if (!password) return '';
  return crypto
    .createHmac('sha256', JWT_SECRET)
    .update(String(password))
    .digest('hex');
}

/**
 * Kiểm tra mật khẩu người dùng nhập vào so với mật khẩu lưu trong DB
 * @param {string} inputPassword - Mật khẩu người dùng nhập khi Login
 * @param {string} storedHash - Mật khẩu đã băm (hoặc plaintext ban đầu của seed)
 * @returns {boolean} True nếu khớp, False nếu sai
 */
export function comparePassword(inputPassword, storedHash) {
  if (!inputPassword || !storedHash) return false;
  // Hỗ trợ kiểm tra cả mật khẩu băm và mật khẩu seed đơn giản
  if (inputPassword === storedHash) return true;
  const hashedInput = hashPassword(inputPassword);
  return hashedInput === storedHash;
}
