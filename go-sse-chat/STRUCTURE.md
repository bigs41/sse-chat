# โครงสร้างโปรเจกต์ Go SSE Chat

## โครงสร้าง Directory

```
go-sse-chat/
├── cmd/
│   └── server/
│       └── main.go              # Entry point - ตั้งค่า dependencies และ start server
│
├── ent/
│   ├── schema/                  # Ent schemas (database models)
│   │   ├── message.go          # Message entity schema
│   │   └── user.go             # User entity schema
│   └── generate.go             # Ent code generation directive
│
├── internal/
│   ├── config/
│   │   └── config.go           # Configuration loading จาก environment variables
│   │
│   ├── handler/                # HTTP handlers (presentation layer)
│   │   ├── chat_handler.go    # Chat endpoints (SSE และ POST)
│   │   └── router.go          # Chi router setup และ middleware
│   │
│   ├── model/                  # Domain models และ DTOs
│   │   └── message.go         # Message model และ CreateMessageRequest
│   │
│   ├── repository/             # Data access layer
│   │   └── message_repository.go  # Database operations สำหรับ messages
│   │
│   └── service/                # Business logic layer
│       ├── message_service.go  # Message business logic
│       └── event_bus.go        # Event bus สำหรับ SSE
│
├── go.mod                      # Go module definition
├── Dockerfile                  # Docker build configuration
├── docker-compose.yml          # Docker Compose setup
├── Makefile                    # Build commands
└── README.md                   # Documentation
```

## Architecture Layers

### 1. Handler Layer (`internal/handler/`)
- **chat_handler.go**: จัดการ HTTP requests/responses
  - `StreamMessages`: SSE endpoint สำหรับ stream messages
  - `CreateMessage`: POST endpoint สำหรับสร้าง message
- **router.go**: ตั้งค่า Chi router และ middleware (CORS, logging, recovery)

### 2. Service Layer (`internal/service/`)
- **message_service.go**: Business logic สำหรับ messages
  - `CreateMessage`: สร้าง message และ publish event
  - `Subscribe/Unsubscribe`: จัดการ SSE subscriptions
- **event_bus.go**: Event bus สำหรับ publish/subscribe messages
  - ใช้ channels และ goroutines สำหรับ real-time messaging

### 3. Repository Layer (`internal/repository/`)
- **message_repository.go**: Data access layer
  - `Create`: สร้าง message ใหม่
  - `FindByChatID`: ค้นหา messages ตาม chat ID

### 4. Model Layer (`internal/model/`)
- **message.go**: Domain models
  - `Message`: Message entity
  - `CreateMessageRequest`: DTO สำหรับสร้าง message

### 5. Config Layer (`internal/config/`)
- **config.go**: โหลด configuration จาก environment variables
  - `DATABASE_URL`: PostgreSQL connection string
  - `PORT`: Server port

## Dependency Injection Flow

```
main.go
  ├── Config (load from env)
  ├── Ent Client (database connection)
  ├── MessageRepository (depends on Ent Client)
  ├── EventBus
  ├── MessageService (depends on Repository + EventBus)
  ├── ChatHandler (depends on MessageService)
  └── Router (depends on ChatHandler)
```

## Database Schema (Ent)

### Message Schema
```go
- id: String (UUID)
- chat_id: String
- user_id: String (FK to User)
- text: String
- created_at: Time
```

### User Schema
```go
- id: String (UUID)
- username: String
- email: String (Unique)
- password: String
- avatar: String? (Optional)
- employee_id: String? (Optional)
- created_at: Time
```

## API Endpoints

### GET /chats/:chatId/messages
- **Type**: Server-Sent Events (SSE)
- **Description**: Stream messages สำหรับ chat room
- **Response**: SSE stream ของ messages

### POST /chats/:chatId/messages
- **Type**: JSON
- **Request Body**:
  ```json
  {
    "userId": "string",
    "text": "string"
  }
  ```
- **Response**: Created message object

## การใช้งาน Context

ทุก function ใน handler, service, และ repository รับ `context.Context` เป็น parameter แรก:
- Handler: ใช้ `r.Context()` จาก HTTP request
- Service: ส่งต่อ context ไปยัง repository
- Repository: ใช้ context สำหรับ database operations

## Event-Driven Architecture

ใช้ EventBus สำหรับ real-time messaging:
1. เมื่อสร้าง message ใหม่ → `EventBus.Publish()`
2. SSE clients subscribe → `EventBus.Subscribe()`
3. EventBus ส่ง message ไปยังทุก subscribers ของ chat room

## Docker Support

- **Dockerfile**: Multi-stage build สำหรับ production
- **docker-compose.yml**: รวม PostgreSQL และ application
- Environment variables ตั้งค่าผ่าน docker-compose

