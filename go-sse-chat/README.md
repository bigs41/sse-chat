# Go SSE Chat

ระบบแชทที่ใช้ Server-Sent Events (SSE) สร้างด้วย Go, Chi router และ Ent ORM

## โครงสร้างโปรเจกต์

```
go-sse-chat/
├── cmd/
│   └── server/
│       └── main.go          # Entry point
├── ent/
│   ├── schema/              # Ent schemas
│   │   ├── message.go
│   │   └── user.go
│   └── generate.go          # Ent code generation
├── internal/
│   ├── config/              # Configuration
│   ├── handler/             # HTTP handlers
│   ├── model/               # Domain models
│   ├── repository/          # Data access layer
│   └── service/             # Business logic layer
├── go.mod
├── go.sum
├── Dockerfile
└── docker-compose.yml
```

## Architecture

โปรเจกต์นี้ใช้ Clean Architecture แบ่งเป็น layers:

- **Handler**: จัดการ HTTP requests/responses และ routing
- **Service**: Business logic และ event management
- **Repository**: Data access layer ใช้ Ent ORM
- **Model**: Domain models และ DTOs

## การติดตั้งและรัน

### 1. ติดตั้ง dependencies

```bash
go mod download
```

### 2. Generate Ent code

```bash
go generate ./ent
```

### 3. ตั้งค่า environment variables

สร้างไฟล์ `.env`:

```env
DATABASE_URL=postgres://user:password@localhost:5432/sse_chat?sslmode=disable
PORT=3000
```

### 4. รันด้วย Docker Compose

```bash
docker-compose up
```

### 5. หรือรันแบบ local

```bash
# ต้องมี PostgreSQL running ก่อน
go run cmd/server/main.go
```

## API Endpoints

### GET /chats/:chatId/messages
SSE endpoint สำหรับ stream messages

```bash
curl -N http://localhost:3000/chats/chat123/messages
```

### POST /chats/:chatId/messages
สร้าง message ใหม่

```bash
curl -X POST http://localhost:3000/chats/chat123/messages \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "text": "Hello, World!"
  }'
```

## Database Schema

### Messages
- `id` (UUID)
- `chat_id` (String)
- `user_id` (String, FK to users)
- `text` (String)
- `created_at` (Timestamp)

### Users
- `id` (UUID)
- `username` (String)
- `email` (String, Unique)
- `password` (String)
- `avatar` (String, Optional)
- `employee_id` (String, Optional)
- `created_at` (Timestamp)

## Features

- ✅ Server-Sent Events (SSE) สำหรับ real-time messaging
- ✅ Event-driven architecture ด้วย EventBus
- ✅ Clean Architecture (Handler, Service, Repository)
- ✅ Context propagation ทุก layer
- ✅ Dependency Injection ผ่าน constructor functions
- ✅ Docker support
- ✅ Graceful shutdown

