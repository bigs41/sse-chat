# ระบบแชทที่ใช้ SSE และ EventEmitter

ระบบแชทแบบ real-time ที่ใช้ Server-Sent Events (SSE) และ EventEmitter สำหรับการส่งข้อความแบบ real-time

## 🚀 การติดตั้ง

```bash
npm install
```

## 🏃 การรัน

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## 📡 API Endpoints

ดูเอกสาร API แบบละเอียดพร้อม curl examples ที่ [API.md](./API.md)

### Quick Examples

**1. สร้างข้อความ**
```bash
curl -X POST http://localhost:3000/chats/chat-123/messages \
  -H "Content-Type: application/json" \
  -d '{"userId": "user-123", "text": "สวัสดีครับ"}'
```

**2. รับข้อความแบบ Real-time (SSE)**
```bash
curl -N http://localhost:3000/chats/chat-123/messages
```

## 📁 โครงสร้างโปรเจกต์

```
src/
├── message/
│   ├── dto/
│   │   └── create-message.dto.ts
│   ├── message.model.ts
│   ├── message.service.ts
│   └── message.module.ts
├── chat/
│   ├── chat.controller.ts
│   └── chat.module.ts
├── app.module.ts
└── main.ts
```

## ✨ Features

- ✅ Message Context (DTO) สำหรับการสร้าง message
- ✅ MessageService พร้อม EventEmitter
- ✅ SSE streaming สำหรับ real-time updates
- ✅ Validation ด้วย class-validator

