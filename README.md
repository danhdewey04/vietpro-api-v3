# Mobile Shop API

Backend **RESTful API** đầy đủ tính năng cho hệ thống **thương mại điện tử**, được xây dựng với **Node.js, Express, MongoDB và Redis**.
Hỗ trợ **Authentication đa nền tảng**, quản lý **sản phẩm – đơn hàng – người dùng**, caching, upload file và email notification.

---

## Giới thiệu

**Mobile Shop API** là một backend hoàn chỉnh phục vụ ứng dụng e-commerce, bao gồm:

* Authentication (JWT + OAuth)
* Quản lý sản phẩm, danh mục, đơn hàng
* Gửi email (xác nhận, reset mật khẩu, đơn hàng)
* Upload & quản lý file
* Redis caching & session storage

---

## Công nghệ sử dụng

### Core Stack

* **Node.js** – JavaScript runtime
* **Express 5.1.0** – Web framework
* **MongoDB (Mongoose 6.13.8)** – NoSQL database
* **Redis 5.9.0** – Caching & session storage

### Authentication & Security

* **bcrypt 6.0.0** – Hash mật khẩu
* **jsonwebtoken 9.0.2** – JWT token
* **jwt-decode 4.0.0** – Decode JWT
* **Passport 0.7.0** – Authentication middleware
* **Google OAuth 2.0**
* **express-session 1.18.2**

### Validation & Parsing

* **express-validator 7.2.1**
* **body-parser 2.2.0**
* **cookie-parser 1.4.7**

### File Upload

* **multer 1.4.5**
* **express-fileupload 1.5.2**
* **formidable 3.5.0**

### Email & Communication

* **nodemailer 7.0.9**
* **EJS 3.1.10** – Email template engine

### Other Utilities

* **axios 1.13.2**
* **cors 2.8.5**
* **dotenv 17.2.1**
* **config 4.1.1**
* **connect-flash 0.1.1**

---

## Yêu cầu hệ thống

* **Node.js** ≥ 14.x (khuyến nghị ≥ 18.x)
* **MongoDB** ≥ 4.4
* **Redis** ≥ 6.0
* **npm** hoặc **yarn**

---

## Cài đặt

### 1️⃣ Clone repository

```bash
git clone https://github.com/danhdewey04/vietpro-api-v3.git
cd node-api-259
```

### 2️⃣ Cài đặt dependencies

```bash
npm install
```

### 3️⃣ Cấu hình Environment Variables

```bash
cp .env.example .env
```

**Ví dụ `.env`:**

```env
# Server
SERVER_PORT=3000
PREFIX_API_VERSION=/api/v3

# JWT
JWT_ACCESS_KEY=your_access_key
JWT_REFRESH_KEY=your_refresh_key
JWT_RESET_KEY=your_reset_key

# Session
SESSION_SECRET=your_session_secret

# OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Database
MONGODB_URI=mongodb://localhost:27017/vietpro_shop_api

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

---

## 🗄️ Setup Database

### MongoDB

```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### Redis

```bash
# Windows
redis-server

# macOS
brew services start redis

# Linux
sudo systemctl start redis
```

---

## ▶️ Chạy ứng dụng

### Development

```bash
npm start
```

* Server: `http://localhost:3000`
* API base: `http://localhost:3000/api/v3`

### Production

```bash
NODE_ENV=production npm start
```

---

## Tính năng chính

### Authentication & Authorization

* JWT Access & Refresh Token
* Google OAuth 2.0
* Reset mật khẩu qua email
* Role-based access control

### User Management

* Đăng ký / Đăng nhập
* Quản lý profile
* Upload avatar
* Đổi / Quên mật khẩu

### Product Management

* CRUD sản phẩm
* Upload ảnh sản phẩm
* Tìm kiếm & filter
* Biến thể sản phẩm

### Order Management

* Tạo đơn hàng
* Theo dõi trạng thái
* Lịch sử mua hàng

### Category Management

* CRUD danh mục
* Nested categories
* Ảnh danh mục

### Banner & Slider

* Quản lý banner / slider
* Upload hình ảnh

### Comment System

* Comment sản phẩm
* Reply & moderation

### Caching

* Redis caching
* Session storage
* Cache invalidation

---

## API Endpoints (ví dụ)

### Auth

```
POST   /api/v3/auth/register
POST   /api/v3/auth/login
POST   /api/v3/auth/refresh-token
POST   /api/v3/auth/logout
POST   /api/v3/auth/forgot-password
POST   /api/v3/auth/reset-password
```

### Products

```
GET    /api/v3/products
POST   /api/v3/products
PUT    /api/v3/products/:id
DELETE /api/v3/products/:id
```

*(Danh sách đầy đủ xem trong source code hoặc Postman collection)*

---

## OAuth Setup

### Google OAuth

* Google Cloud Console → Create Project
* Enable Google API
* OAuth 2.0 Credentials
* Redirect URI:

```
http://localhost:3000/api/v3/auth/google/callback
```

---

## Email Setup (Gmail)

* Enable **2-Step Verification**
* Tạo **App Password**
* Dùng App Password trong `.env`

---

## Testing

```bash
npm test
```

---

## Security Best Practices

* Không commit `.env`
* JWT secret đủ mạnh
* Enable CORS đúng domain
* Validate input
* HTTPS trong production

---

## Troubleshooting

### MongoDB

```bash
mongod --version
sudo systemctl start mongod
```

### Redis

```bash
redis-cli ping
```

### bcrypt lỗi (Windows)

```bash
npm install --global windows-build-tools
npm rebuild bcrypt --build-from-source
```

---

## 🤝 Contributing

* Fork project
* Tạo branch mới
* Commit & Push
* Open Pull Request 🚀

---

## 📞 Liên hệ

* **GitHub:** [@danhdewey04](https://github.com/danhdewey04)
* **Repository:** `vietpro-api-v3`

---

## 📝 Ghi chú

> Dự án phục vụ mục đích **học tập và thực hành Node.js backend**, mô phỏng đầy đủ một hệ thống thương mại điện tử thực tế.

---

👉 nói mình biết, mình chỉnh tiếp cho đúng “gu” GitHub chuyên nghiệp nhé 😄
