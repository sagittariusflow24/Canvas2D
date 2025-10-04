// index.js (module)
import { getContext, FPS } from './utils-module.js';

// เปลี่ยนชื่อเอกสาร
document.title = "A01 - App Graphics 2D";

// ตั้งค่าเริ่มต้น (config) — ปรับได้
const config = {
  width: 900,    // base CSS width (will be responsive)
  heightRatio: 0.62, // height = width * heightRatio
  debug: true
};

// สถานะแอนิเมชัน
const state = {
  running: true,
  cloudOffset: 0,
  riverOffset: 0,
  lastTime: 0,
  skyMode: 'day' // 'day' | 'sunset'
};

document.addEventListener('DOMContentLoaded', main);

function main() {
  const ctx = getContext('#myCanvas');
  const canvas = ctx.canvas;

  // Resize canvas to be responsive + high-DPI aware
  function resize() {
    const ratio = window.devicePixelRatio || 1;
    const cssWidth = Math.min(1100, Math.max(640, window.innerWidth * 0.86));
    const cssHeight = Math.round(cssWidth * config.heightRatio);
    canvas.style.width = cssWidth + 'px';
    canvas.style.height = cssHeight + 'px';
    canvas.width = Math.round(cssWidth * ratio);
    canvas.height = Math.round(cssHeight * ratio);
    // map drawing coordinates to CSS pixels
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  // ------------------ ฟังก์ชันวาด (เรียงจากหลังมาหน้า) ------------------

  // 1) Sky (linear gradient) — day / sunset
  function drawSky(w, h) {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    if (state.skyMode === 'day') {
      g.addColorStop(0, '#87CEEB');  //Day mode
      g.addColorStop(0.6, '#e2ffdfff');
      g.addColorStop(1, '#F8FFFE');
    } else {
      g.addColorStop(0, '#FFB199'); //Sunset mode
      g.addColorStop(0.5, '#FFDDC2');
      g.addColorStop(1, '#FFF5E6');
    }
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  // 2) Sun (radial glow)
  function drawSun(x, y, r) {
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r * 2);
    if (state.skyMode === 'day') {
      grad.addColorStop(0, 'rgba(255,255,210,1)'); //Day mode
      grad.addColorStop(0.4, 'rgba(255,210,90,0.9)');
      grad.addColorStop(1, 'rgba(255,210,90,0)');
    } else {
      grad.addColorStop(0, 'rgba(255,240,200,1)'); //Sunset mode
      grad.addColorStop(0.5, 'rgba(255,160,90,0.9)');
      grad.addColorStop(1, 'rgba(255,120,60,0)');
    }
    ctx.beginPath(); //เริ่มวาด
    ctx.fillStyle = grad; //สีGradient 
    ctx.arc(x, y, r, 0, Math.PI * 2); //สูตรวาดวงกลม
    ctx.fill();
  }

  // 3) Mountains (two layers)
  function drawMountains(w, h) {
    ctx.beginPath();
    ctx.moveTo(0, h); //กำหนดจุดเริ่มต้น
    ctx.lineTo(w * 0.25, h * 0.4); //วาดเส้นตรง
    ctx.lineTo(w * 0.35, h * 0.6);
    ctx.lineTo(w * 0.52, h * 0.35);
    ctx.lineTo(w * 0.70, h * 0.61);
    ctx.lineTo(w * 0.82, h * 0.50);
    ctx.lineTo(w, h * 0.66); 
    ctx.lineTo(w, h); //ปิดส่วนฐาน
    ctx.closePath(); //ปิด Path
    const g1 = ctx.createLinearGradient(0, h * 0.3, 0, h); //สร้าง Gradientไล่สีจากด้านบนลงล่าง
    g1.addColorStop(0, '#fffd70ff');
	g1.addColorStop(0.4, '#0b7513ff');
    g1.addColorStop(1, '#083d03ff');
    ctx.fillStyle = g1;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(w * 0.23, h * 0.6);
    ctx.lineTo(w * 0.35, h * 0.8);
    ctx.lineTo(w * 0.52, h * 0.56);
    ctx.lineTo(w * 0.68, h * 0.82);
    ctx.lineTo(w * 0.88, h * 0.6);
    ctx.lineTo(w, h * 0.78);
    ctx.lineTo(w, h);
    ctx.closePath();
    const g2 = ctx.createLinearGradient(0, h * 0.3, 0, h);
    g1.addColorStop(0, '#e6e484ff');
	g2.addColorStop(0.4, '#19690fff'); 
    g2.addColorStop(1, '#002707ff'); 
    ctx.fillStyle = g2;
    ctx.fill(); //ภูเขาอีกส่วน
  }

  // 4) Rice field (foreground) + furrows //ร่องน้ำ/คันนา
  function drawRiceField(w, h) {
    ctx.save();
    const top = h * 0.8; //กำหนดขอบเขต กำหนดให้ท้องนาเริ่มต้นที่ความสูง 80% ของ Canvas (วัดจากด้านบน)
    const g = ctx.createLinearGradient(0, top, 0, h); //การไล่สีแบบแนวตั้ง
    g.addColorStop(0, '#9AD77B');
    g.addColorStop(1, '#4E8A3F');
    ctx.fillStyle = g;
    ctx.fillRect(0, top, w, h - top); //วาดพื้นหญ้าเป็นสี่เหลี่ยมผืนผ้า

    ctx.save();
    ctx.strokeStyle = 'rgba(0,0,0,0.06)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) { //วนซ้ำ 8 ครั้ง เพื่อวาดเส้นรายละเอียด 8 เส้น (ร่องน้ำหรือคันนา)
      const t = i / 7;
      ctx.beginPath();
      const y = top + t * (h - top); //เพื่อให้เส้นกระจายตัวจากขอบบน (top) ไปยังขอบล่าง (h) อย่างสม่ำเสมอ
      ctx.moveTo(0, y + Math.sin(t * 6 + state.riverOffset / 90) * 4); //Math.sin() ที่ผูกกับ state.riverOffset ซึ่งกำลังเพิ่มขึ้นเรื่อย ๆ ใน Draw Loop เพื่อสร้าง Animation ให้เส้นดูมีการกระเพื่อม คล้ายการเคลื่อนไหวของน้ำในร่องนา หรือความพริ้วไหวของพืช
      ctx.quadraticCurveTo(w * 0.5, y + 10, w, y + Math.sin(t * 6 + state.riverOffset / 60) * 6); //วาดเส้นโค้ง
      ctx.stroke();
    }
    ctx.restore();
  }

  // 5) Tree (trunk + foliage) //ต้นไม้และใบ
  function drawTree(x, y, scale = 1) { //วาดลำต้น
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = '#6b3f2a';
    ctx.fillRect(-6, 0, 12, 40); //วาดลำต้น
    ctx.beginPath(); //เตรียมวาดใบ
    ctx.fillStyle = '#1e8b3a';
    ctx.arc(0, -8, 20, -5, Math.PI * 2); //วาดพุ่มใบ
    ctx.arc(-18, 0, 14, 0, Math.PI * 2);
    ctx.arc(18, 0, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 6) House (base rect + triangular roof + door/windows)
  function drawHouse(x, y, scale = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = '#F0D9B5';
    ctx.fillRect(-40, -28, 80, 56); //เริ่มต้นที่ −40 เพื่อให้ตัวบ้านกว้าง 80 พิกเซล 
    ctx.beginPath(); 
    ctx.moveTo(-50, -28);
    ctx.lineTo(0, -68);
    ctx.lineTo(50, -28);
    ctx.closePath();
    ctx.fillStyle = '#A64D3A'; //วาดสามเหลี่ยมหน้าจั่ว
    ctx.fill();
    ctx.fillStyle = '#6B3F2A'; 
    ctx.fillRect(-12, 6, 24, 30); //วาดประตู
    ctx.fillStyle = '#CFEFFF';
    ctx.fillRect(-32, 12, 20, 16); //วาดหน้าต่าง
    ctx.fillRect(12, 12, 20, 16);  //เหมือนกัน
    ctx.restore();
  }

 
  // 7) River (คดเคี้ยวยาวจากไกลมาถึงใกล้)
function drawRiver(w, h, offset) {
  const top = h * 0.8; // จุดเริ่มต้นแม่น้ำด้านบน

  ctx.save();
  ctx.beginPath();

  // เริ่มจากกลางบน
  ctx.moveTo(w * 0.5, top);

  // แม่น้ำโค้งธรรมชาติ ลงมาที่ล่าง
  ctx.bezierCurveTo(w * 0.55, top + 40, w * 0.7, top + 20, w * 0.5, h * 0.8); //ใช้ bezierCurveTo()สามารถควบคุมความโค้งของเส้นได้แม่นยำกว่า (quadraticCurveTo) 
  ctx.bezierCurveTo(w * 0.5, h * 0.95, w * 0.3, h * 0.9, w * 0.25, h); //วาดส่วนโค้ง (2) (ลงสู่ด้านล่างของ Canvas)

  // ขอบขวาล่าง
  ctx.lineTo(w * 0.55, h); //ลากเส้นตรงไปยังจุดที่ขอบแม่น้ำอีกด้านสัมผัสกับขอบล่างของ Canvas

  // ปิด pathด้วย Curve กลับไปจุดเริ่มต้น
  ctx.bezierCurveTo(w * 0.25, h * 0.95, w * 0.55, h * 1, w * 0.7, top); //การปิด Path ด้วยเส้นโค้งแทนที่จะเป็นเส้นตรง ทำให้ขอบของแม่น้ำดูเป็นธรรมชาติมากขึ้น
  ctx.closePath();

  // ไล่สีแม่น้ำ
  const gradient = ctx.createLinearGradient(0, top, 0, h);
  gradient.addColorStop(0, '#a2d9ff'); // ฟ้าอ่อนด้านบน
  gradient.addColorStop(0.5, '#5ab0e0');
  gradient.addColorStop(1, '#1e6091'); // น้ำเข้มด้านล่าง
  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.restore();
}



  // Cloud shape
  function drawCloud(x, y, scale = 1, alpha = 0.98) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(0, 0, 18, Math.PI * 0.5, Math.PI * 1.5); //แบบเดียวกับพุ่มใบไม้ เป็นการสร้างรูปทรงที่ไม่เป็นระเบียบแต่ดูนุ่มนวล สร้างวงกลม
    ctx.arc(24, 0, 24, Math.PI * 1, Math.PI * 1.85);
    ctx.arc(46, 0, 18, Math.PI * 1.37, Math.PI * 0.37);
    ctx.closePath();
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // Compose scene in correct z-order ต้องวาด พื้นหลัง ก่อน แล้วค่อย ๆ วาดวัตถุที่อยู่ ข้างหน้า ทับลงมาเรื่อย ๆ เพื่อให้เกิดการซ้อนทับที่ถูกต้อง
  function renderScene() {  //
    const ratio = window.devicePixelRatio || 1;
    const w = canvas.width / ratio;
    const h = canvas.height / ratio;

    drawSky(w, h);
    drawSun(w * 0.82, h * 0.18, Math.min(w, h) * 0.06);
    drawMountains(w, h);
    drawRiceField(w, h);
    drawRiver(w, h, state.riverOffset);
    drawHouse(w * 0.22, h * 0.78, 1.0);
    drawTree(w * 0.16, h * 0.8, 0.9);
    drawTree(w * 0.30, h * 0.78, 1.05);
    drawTree(w * 0.40, h * 0.76, 0.8);

    // Clouds (animated)
    const bases = [w * 0.06, w * 0.45, w * 0.75];
    for (let i = 0; i < bases.length; i++) {
      const cx = ((bases[i] + state.cloudOffset * (0.5 + i * 0.35)) % (w + 220)) - 110; //เพื่อให้เมื่อเมฆเคลื่อนที่ออกไปจากขอบขวาของ Canvas ก็จะ ย้ายกลับมาปรากฏ ที่ขอบซ้ายทันที (Looping Animation) ทำให้เมฆลอยต่อเนื่องไม่มีที่สิ้นสุด
      const cy = h * (0.12 + i * 0.02 + Math.sin((state.cloudOffset + i * 20) / 80) * 0.01);
      drawCloud(cx, cy, 1 - i * 0.12, 0.98 - i * 0.08);
    }

    // small fence/detail //ไม่ค่อยจำเป็นทำมาทำไม
    ctx.save();
    ctx.strokeStyle = 'rgba(60, 20, 20, 0.28)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 9; i++) {
      const x = w * 0.05 + i * (w * 0.9 / 9);
      ctx.beginPath();
      ctx.moveTo(x, h * 0.74);
      ctx.lineTo(x + 6, h * 0.74 + 6);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ------------------ Main draw loop ------------------
  function draw(timestamp) { //ให้เบราว์เซอร์จัดการการเรียกฟังก์ชันนี้ซ้ำ ๆ อย่างมีประสิทธิภาพและถูกจังหวะที่สุด (โดยปกติคือ 60 ครั้ง/วินาที)
    if (!state.lastTime) state.lastTime = timestamp; 
    const dt = timestamp - state.lastTime; 
    state.lastTime = timestamp; 

    if (state.running) {
      state.cloudOffset += dt * 0.02; 
      state.riverOffset += dt * 0.035; //คำนวณเวลาที่ผ่านไป (dt) และใช้ dt ในการอัปเดต state.cloudOffset และ state.riverOffset
    }

    const ratio = window.devicePixelRatio || 1;
    const w = canvas.width / ratio;
    const h = canvas.height / ratio;
    // clear and render
    ctx.clearRect(0, 0, w, h); //ล้าง Canvas ทุกเฟรมก่อนเรียก renderScene()
    renderScene();

    // show FPS (optional)
    FPS.update();
    if (config.debug) FPS.show(ctx, 10, 22);

    requestAnimationFrame(draw);
  }

  // ------------------ Controls (UI buttons) ------------------
  document.getElementById('toggleAnim').addEventListener('click', (e) => { //ใช้ Event Listener เพื่อดักจับการคลิก
    state.running = !state.running;
    e.target.textContent = state.running ? 'Pause' : 'Resume';
  });

  document.getElementById('toggleSky').addEventListener('click', (e) => { //เปลี่ยนค่า Boolean/String ใน Object state ซึ่งจะส่งผลให้โค้ดส่วนอื่น ๆ (เช่น Draw Loop และฟังก์ชันวาด Sky/Sun)
    state.skyMode = state.skyMode === 'day' ? 'sunset' : 'day';
    e.target.textContent = state.skyMode === 'day' ? 'Sunset Mode' : 'Day Mode';
  });

  document.getElementById('resetBtn').addEventListener('click', () => {
    state.cloudOffset = 0;
    state.riverOffset = 0;
    state.skyMode = 'day';
    state.running = true;
    document.getElementById('toggleAnim').textContent = 'Pause';
    document.getElementById('toggleSky').textContent = 'Sunset Mode';
    resize(); // recompute sizes
  });

  // start loop
  resize();
  requestAnimationFrame(draw);
}
