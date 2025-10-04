// utils-module.js
export function getContext(selector) { //ถูกนำไปใช้ (import) ในไฟล์ index.js ได้ ซึ่งเป็นการออกแบบโค้ดแบบ Modular
  const el = document.querySelector(selector); //ค้นหา Canvas Element ใน DOM โดยใช้ Selector ที่ส่งเข้ามา
  if (!el) throw new Error(`Canvas not found: ${selector}`); //ถ้าหา Element ไม่พบ จะหยุดการทำงานและส่ง Error ทันที
  const ctx = el.getContext('2d'); //เรียกใช้เมธอดเพื่อดึง Drawing Context ออกมา
  return ctx;
}

// Simple FPS helper (update() inside loop; show(ctx,x,y) to draw text)
export const FPS = {
  lastTime: performance.now(), //เก็บเวลาล่าสุดที่ได้ทำการอัปเดตค่า FPS
  frameCount: 0, //นับจำนวนเฟรมที่ถูกวาดไปแล้วตั้งแต่การอัปเดตครั้งล่าสุด
  fps: 0, //ค่า FPS ที่คำนวณได้สุดท้าย
  update() {
    this.frameCount++; //นับเพิ่มจำนวนเฟรม
    const now = performance.now();
    const dt = now - this.lastTime; //คำนวณเวลาที่ผ่านไป (Delta Time)
    if (dt >= 500) { // update twice a second // จะทำการคำนวณและแสดงผลค่า FPS ใหม่ ทุก ๆ(500วินาที = 0.5 วินาที) เพื่อไม่ให้ค่า FPS มีการเปลี่ยนแปลงเร็วเกินไป
      this.fps = Math.round((this.frameCount / dt) * 1000); //สูตร: (จำนวนเฟรม/เวลาที่ใช้ (ms))×1000=เฟรมต่อวินาที
      this.frameCount = 0; //รีเซ็ตตัวนับเฟรม
      this.lastTime = now; //บันทึกเวลาเริ่มต้นใหม่
    }
  },
  show(ctx, x = 8, y = 20) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 255, 0, 0.89)'; 
    ctx.font = '14px Arial';
    ctx.fillText(`FPS: ${this.fps}`, x, y); //ctx3บรรทัดคือตั้งค่าสีและฟอนต์สำหรับข้อความแสดงค่า FPS //วาดค่า FPS ที่คำนวณได้ลงบน Canvas ที่พิกัดที่กำหนด
    ctx.restore(); //เพื่อให้การตั้งค่าการวาดข้อความ (เช่น fillStyle และ font) ที่ใช้สำหรับแสดง FPS ไม่ไปเปลี่ยนแปลงสถานะการวาดหลักของภาพทิวทัศน์
  }
};
