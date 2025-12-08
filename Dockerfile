# Build stage
FROM node:20-alpine AS builder

# ติดตั้ง pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# ติดตั้ง dependencies
RUN pnpm install --frozen-lockfile

# Copy source code และ Prisma schema
COPY . .

# Generate Prisma Client
RUN pnpm prisma generate

# Build application
RUN pnpm build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# ติดตั้ง pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# ติดตั้ง production dependencies เท่านั้น
RUN pnpm install --prod --frozen-lockfile

# Copy Prisma schema และ migrations
COPY prisma ./prisma

# Generate Prisma Client สำหรับ production
RUN pnpm prisma generate

# Copy built application จาก builder stage
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Health check (optional - ลบออกได้ถ้าไม่ต้องการ)
# HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
#   CMD node -e "require('http').get('http://localhost:3000/', (r) => {process.exit(r.statusCode ? 0 : 1)})" || exit 1

# Run application
CMD ["node", "dist/main.js"]
