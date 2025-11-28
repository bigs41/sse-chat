#!/bin/bash

# สคริปต์ทดสอบระบบแชท
# ใช้งาน: ./test-chat.sh [chatId]

CHAT_ID=${1:-"test-chat"}
BASE_URL="http://localhost:3000"

echo "🚀 เริ่มทดสอบระบบแชท"
echo "📋 Chat ID: ${CHAT_ID}"
echo "🌐 Base URL: ${BASE_URL}"
echo ""

# ตรวจสอบว่า server ทำงานอยู่หรือไม่
echo "🔍 ตรวจสอบ server..."
if ! curl -s -f "${BASE_URL}" > /dev/null 2>&1; then
    echo "❌ ไม่สามารถเชื่อมต่อ server ได้"
    echo "   กรุณาเริ่ม server ด้วยคำสั่ง: npm run start:dev"
    exit 1
fi
echo "✅ Server ทำงานอยู่"
echo ""

# สร้างข้อความ
echo "📤 ส่งข้อความ..."
echo ""

MESSAGES=(
    "สวัสดีครับ"
    "ทดสอบข้อความที่ 2"
    "ทดสอบข้อความที่ 3"
    "Hello World!"
    "ข้อความสุดท้าย"
)

USER_IDS=(
    "user-1"
    "user-2"
    "user-1"
    "user-2"
    "user-1"
)

for i in "${!MESSAGES[@]}"; do
    MESSAGE="${MESSAGES[$i]}"
    USER_ID="${USER_IDS[$i]}"
    echo "  [$(($i + 1))] ส่งจาก ${USER_ID}: ${MESSAGE}"
    
    RESPONSE=$(curl -s -X POST ${BASE_URL}/chats/${CHAT_ID}/messages \
        -H "Content-Type: application/json" \
        -d "{\"userId\": \"${USER_ID}\", \"text\": \"${MESSAGE}\"}")
    
    if [ $? -eq 0 ]; then
        echo "      ✅ สำเร็จ: $(echo $RESPONSE | grep -o '"id":"[^"]*"' | head -1)"
    else
        echo "      ❌ ล้มเหลว"
    fi
    
    sleep 0.5
done

echo ""
echo "✅ ส่งข้อความเสร็จสิ้น"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📥 เปิด SSE stream เพื่อรับข้อความ"
echo "   (กด Ctrl+C เพื่อหยุด)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# เปิด SSE stream
curl -N ${BASE_URL}/chats/${CHAT_ID}/messages

