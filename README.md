
**Nguyễn Đình Huy - 2180606153**

## Mô tả dự án

Đây là một dự án đơn giản với backend Node.js + Express + MongoDB và frontend tĩnh HTML/CSS/JS.

## Cách chạy

1. Cài dependencies:
   ```bash
   npm install
   ```

2. Cấu hình file `.env`:
   - `MONGO_URI` kết nối MongoDB
   - `JWT_PRIVATEKEY_PATH=./config/keys/private.key`
   - `JWT_PUBLICKEY_PATH=./config/keys/public.key`
   - `JWT_SECRET` giá trị bí mật

3. Chạy server:
   ```bash
   npm start
   ```

4. Mở trình duyệt:
   - `http://localhost:3001`

## Cấu trúc chính

- `app.js`: Express server
- `config/`: cấu hình JWT, CORS, Multer, Swagger
- `routes/`: định nghĩa API routes
- `controllers/`: logic xử lý
- `models/`: schema MongoDB
- `middlewares/`: middleware xác thực và lỗi
- `frontend/`: static frontend files
- `uploads/`: ảnh upload

## Ghi chú

- Static frontend được phục vụ từ `frontend/`
- `app.js` hiện tại dùng `express.static('frontend')`
- Giữ các tập tin và thư mục cần thiết để web app vẫn chạy được
