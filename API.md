# 📚 API Documentation

เอกสาร API สำหรับระบบแชทที่ใช้ SSE และ EventEmitter

---

## 🚀 Base URL

```
http://localhost:3000
```

---

## 📡 Endpoints

### 1. สร้างข้อความ (Create Message)

สร้างข้อความใหม่ในแชทที่ระบุ

**Endpoint:** `POST /chats/:chatId/messages`

**Path Parameters:**
- `chatId` (string, required) - ID ของแชท

**Request Body:**
```json
{
  "userId": "user-123",
  "text": "ข้อความที่ต้องการส่ง"
}
```

**Response:**
```json
{
  "id": "uuid-generated-id",
  "chatId": "chat-123",
  "userId": "user-123",
  "text": "ข้อความที่ต้องการส่ง",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/chats/chat-123/messages \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "text": "สวัสดีครับ"
  }'
```

**cURL Example (with variables):**
```bash
CHAT_ID="chat-123"
USER_ID="user-123"
MESSAGE="สวัสดีครับ"

curl -X POST http://localhost:3000/chats/${CHAT_ID}/messages \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"${USER_ID}\",
    \"text\": \"${MESSAGE}\"
  }"
```

---

### 2. รับข้อความแบบ Real-time (SSE Stream)

รับข้อความแบบ real-time ผ่าน Server-Sent Events (SSE)

**Endpoint:** `GET /chats/:chatId/messages`

**Path Parameters:**
- `chatId` (string, required) - ID ของแชท

**Response:** Server-Sent Events stream

**Response Format:**
```
data: {"id":"uuid","text":"ข้อความ","createdAt":"2024-01-01T00:00:00.000Z"}

data: {"id":"uuid","text":"ข้อความใหม่","createdAt":"2024-01-01T00:00:01.000Z"}
```

**cURL Example:**
```bash
curl -N http://localhost:3000/chats/chat-123/messages
```

**cURL Example (with variables):**
```bash
CHAT_ID="chat-123"

curl -N http://localhost:3000/chats/${CHAT_ID}/messages
```

**หมายเหตุ:** 
- ใช้ flag `-N` หรือ `--no-buffer` เพื่อให้ curl แสดงข้อมูลทันทีที่ได้รับ
- Connection จะเปิดค้างไว้และรับข้อความใหม่แบบ real-time

---

## 🧪 ตัวอย่างการทดสอบ

### ทดสอบแบบ Interactive (Terminal 1 - สร้างข้อความ)

```bash
# สร้างข้อความหลายข้อความ
curl -X POST http://localhost:3000/chats/chat-123/messages \
  -H "Content-Type: application/json" \
  -d '{"text": "ข้อความที่ 1"}'

curl -X POST http://localhost:3000/chats/chat-123/messages \
  -H "Content-Type: application/json" \
  -d '{"text": "ข้อความที่ 2"}'

curl -X POST http://localhost:3000/chats/chat-123/messages \
  -H "Content-Type: application/json" \
  -d '{"text": "ข้อความที่ 3"}'
```

### ทดสอบแบบ Interactive (Terminal 2 - รับข้อความ)

```bash
# เปิด connection เพื่อรับข้อความแบบ real-time
curl -N http://localhost:3000/chats/chat-123/messages
```

### ทดสอบแบบ Script

**test-chat.sh:**
```bash
#!/bin/bash

CHAT_ID="chat-123"
BASE_URL="http://localhost:3000"

echo "🚀 เริ่มทดสอบระบบแชท"
echo ""

# สร้างข้อความ
echo "📤 ส่งข้อความ..."
curl -X POST ${BASE_URL}/chats/${CHAT_ID}/messages \
  -H "Content-Type: application/json" \
  -d '{"userId": "user-1", "text": "สวัสดีครับ"}' \
  -w "\n"

sleep 1

curl -X POST ${BASE_URL}/chats/${CHAT_ID}/messages \
  -H "Content-Type: application/json" \
  -d '{"userId": "user-2", "text": "ทดสอบข้อความที่ 2"}' \
  -w "\n"

sleep 1

curl -X POST ${BASE_URL}/chats/${CHAT_ID}/messages \
  -H "Content-Type: application/json" \
  -d '{"userId": "user-1", "text": "ทดสอบข้อความที่ 3"}' \
  -w "\n"

echo ""
echo "✅ ส่งข้อความเสร็จสิ้น"
echo ""
echo "📥 เปิด SSE stream (กด Ctrl+C เพื่อหยุด):"
curl -N ${BASE_URL}/chats/${CHAT_ID}/messages
```

---

## 🔍 ตัวอย่าง Response

### Success Response (Create Message)

**Status Code:** `201 Created`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "chatId": "chat-123",
  "userId": "user-123",
  "text": "สวัสดีครับ",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

### SSE Stream Response

**Status Code:** `200 OK`
**Content-Type:** `text/event-stream`

```
data: {"id":"550e8400-e29b-41d4-a716-446655440000","userId":"user-123","text":"สวัสดีครับ","createdAt":"2024-01-15T10:30:00.000Z"}

data: {"id":"550e8400-e29b-41d4-a716-446655440001","userId":"user-456","text":"ข้อความที่ 2","createdAt":"2024-01-15T10:30:01.000Z"}

```

### Error Response (Validation Error)

**Status Code:** `400 Bad Request`

```json
{
  "statusCode": 400,
  "message": [
    "text should not be empty",
    "text must be a string"
  ],
  "error": "Bad Request"
}
```

---

## 📝 หมายเหตุ

1. **SSE Connection**: Connection จะเปิดค้างไว้จนกว่าจะปิดโดย client
2. **Message Filtering**: ข้อความจะถูกส่งเฉพาะให้กับ client ที่ subscribe ใน chatId ที่ตรงกัน
3. **Validation**: ใช้ class-validator สำหรับ validate request body
4. **CORS**: Server เปิด CORS ไว้แล้ว สามารถเรียกใช้จาก frontend ได้

---

## 🛠️ Testing Tools

### ใช้ httpie แทน curl

```bash
# สร้างข้อความ
http POST localhost:3000/chats/chat-123/messages userId="user-123" text="สวัสดีครับ"

# รับข้อความ (SSE)
http --stream GET localhost:3000/chats/chat-123/messages
```

### ใช้ Postman

1. **Create Message:**
   - Method: `POST`
   - URL: `http://localhost:3000/chats/chat-123/messages`
   - Body (raw JSON):
     ```json
     {
       "userId": "user-123",
       "text": "สวัสดีครับ"
     }
     ```

2. **SSE Stream:**
   - Method: `GET`
   - URL: `http://localhost:3000/chats/chat-123/messages`
   - ใช้ Postman's Server-Sent Events feature

---

## 🎯 Quick Start

```bash
# 1. เริ่ม server
npm run start:dev

# 2. Terminal 1: เปิด SSE stream
curl -N http://localhost:3000/chats/test-chat/messages

# 3. Terminal 2: ส่งข้อความ
curl -X POST http://localhost:3000/chats/test-chat/messages \
  -H "Content-Type: application/json" \
  -d '{"userId": "user-123", "text": "Hello World!"}'
```

