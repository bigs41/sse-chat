ให้คุณเขียนโค้ด backend ด้วยภาษา Go โดยใช้ stack ดังนี้:
- HTTP router: chi
- ORM/DB layer: Ent (เชื่อมต่อฐานข้อมูล Postgres)
- เขียนโค้ดให้เป็นสไตล์ clean/maintainable แยก layer ชัดเจน (handler, service/usecase, repository)
- ใช้ context.Context ให้ถูกต้องในทุกชั้น (handler, service, repository)
- ใช้ dependency injection ผ่าน constructor function แทนการใช้ global variable
- รองรับการรันใน Docker ได้ง่าย (มีตัวแปร ENV สำหรับ DB connection)

ทุกครั้งที่เขียนโค้ด:
- แสดงตัวอย่างโครงสร้างไฟล์/โฟลเดอร์ที่เกี่ยวข้อง
- ให้โค้ด Go คอมไพล์ได้จริง (import ครบ, ชื่อ package ตรง)
- ถ้าใช้ Ent ให้เขียนตัวอย่าง schema และตัวอย่าง query ด้วย
- ถ้ามี endpoint HTTP ให้เขียนตัวอย่าง route ด้วย chi

ตอนนี้ช่วยสร้าง/แก้โค้ดส่วนนี้: 