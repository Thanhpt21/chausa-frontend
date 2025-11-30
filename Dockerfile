# Giai đoạn Build (builder stage) - Tạo bản build sản phẩm Next.js
FROM node:22 AS builder

WORKDIR /app

# Copy các file cấu hình dependency từ thư mục frontend
COPY package.json package-lock.json ./ 

# Cài đặt tất cả các dependencies (bao gồm dev dependencies)
RUN npm install

# Copy toàn bộ mã nguồn của dự án Next.js vào thư mục /app trong container
COPY . .

# Sao chép tệp .env từ thư mục frontend vào /app của container (thêm bước này)
COPY .env ./.env

# Chạy lệnh build của Next.js (tạo ra thư mục .next)
RUN npm run build

# -----------------------------------------------------------
# Giai đoạn Production (runner stage) - Tạo image nhẹ để chạy ứng dụng Next.js
# -----------------------------------------------------------
FROM node:22 AS runner

WORKDIR /app

# Copy các file package.json và package-lock.json cần thiết cho runtime từ giai đoạn builder
COPY --from=builder /app/package.json /app/package-lock.json ./

# Cài đặt chỉ các production dependencies
RUN npm install --omit=dev

# Copy thư mục .next/ (chứa bản build) từ giai đoạn builder
COPY --from=builder /app/.next ./.next

# Copy thư mục public (nếu có)
COPY --from=builder /app/public ./public

# Copy tệp .env từ giai đoạn builder vào container
COPY --from=builder /app/.env ./.env

# Cấu hình các biến môi trường để chạy ứng dụng Next.js
ENV NODE_ENV=production
ENV NEXT_PUBLIC_PAGE_SIZE=12
ENV JWT_SECRET=jwtsecret12345

# Mở cổng mà ứng dụng Next.js của bạn sẽ lắng nghe
EXPOSE 3000

# Lệnh để chạy ứng dụng Next.js khi container khởi động
CMD ["npm", "start"]
