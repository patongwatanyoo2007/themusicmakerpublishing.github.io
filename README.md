# The Music Maker Thailand Distribution & Streaming Platform

## 🎵 เกี่ยวกับโครงการ

เว็บไซต์แพลตฟอร์มแจกจ่ายและสตรีมเพลงแบบครบวงจร ที่รวม 2 ฟีเจอร์หลัก เข้าด้วยกันในเว็บไซต์เดียว:

### ✨ ฟีเจอร์หลัก

#### 🎯 1. ระบบแจกจ่ายเพลง (Music Distribution)
- **แจกจ่ายฟรี**: ส่งเพลงไปยังแพลตฟอร์มสตรีมมิ่ง 150+ แพลตฟอร์ม
- **รายได้ 100%**: ไม่หักค่าบริการ รับเงินเต็มจำนวน
- **Multi-Step Upload**: ฟอร์มอัปโหลดแบบ 4 ขั้นตอน
- **OAC Request**: ระบบขอ Official Artist Channel
- **Track Status**: ติดตามสถานะการแจกจ่าย

#### 🎧 2. ระบบสตรีมเพลง (Music Streaming)
- **เล่นทันที**: อัปโหลดและเล่นเพลงได้ทันที
- **เครื่องเล่นเพลงแบบเต็มรูปแบบ**: Music Player ติดด้านล่างหน้าจอ
- **Playlist Management**: จัดการ Playlist ส่วนตัว
- **Advanced Controls**: Play, Pause, Next, Previous, Shuffle, Volume
- **Progress Control**: Seek ไปยังส่วนใดก็ได้ของเพลง
- **Local Storage**: เก็บข้อมูล Playlist ในเครื่อง

### 🛠 เทคโนโลยีที่ใช้

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Tailwind CSS
- **Icons**: Font Awesome 6.0
- **Fonts**: Kanit (Google Fonts)
- **Storage**: Local Storage API
- **Audio**: HTML5 Audio API
- **File**: File API, FileReader API

## 🚀 การใช้งาน

### การเรียกใช้เว็บไซต์

1. เปิดไฟล์ `index.html` ในเว็บเบราว์เซอร์
2. หรือ Deploy บน Web Server ใดก็ได้

### 📱 การนำทางในเว็บไซต์

เว็บไซต์แบ่งเป็น 6 หน้าหลัก:

#### 🏠 หน้าแรก (Home)
- ข้อมูลภาพรวมของแพลตฟอร์ม
- สถิติการให้บริการ
- ปุ่มเริ่มต้นใช้งาน

#### 🎵 เล่นเพลง (Streaming)
- อัปโหลดเพลงเพื่อเล่นทันที
- จัดการ Playlist
- เครื่องเล่นเพลงแบบเต็มรูปแบบ

#### ⚙️ บริการ (Services)
- รายละเอียดบริการทั้งหมด
- แพลตฟอร์มที่รองรับ

#### 💰 ราคา (Pricing)
- แผนฟรี 100% ตลอดชีพ
- เปรียบเทียบค่าบริการ

#### 📤 อัปโหลด (Upload)
- ฟอร์มอัปโหลดแบบ 4 ขั้นตอน:
  1. **ข้อมูลพื้นฐาน**: ชื่อศิลปิน, เพลง, ประเภท
  2. **ไฟล์เพลง**: อัปโหลดเพลงและภาพปก
  3. **OAC**: ขอ Official Artist Channel
  4. **สรุปข้อมูล**: ตรวจสอบก่อนส่ง

#### 🆘 ช่วยเหลือ (Support)
- FAQ คำถามที่พบบ่อย
- ฟอร์มติดต่อ

#### 📊 สถานะเพลง (Song Status)
- ตรวจสอบสถานะการแจกจ่าย
- ดูความคืบหน้าในแต่ละแพลตฟอร์ม

## 🎼 การใช้งานเครื่องเล่นเพลง

### อัปโหลดเพลง
1. ไปที่หน้า **"เล่นเพลง"**
2. คลิก **"เลือกไฟล์เพลง"** หรือ **Drag & Drop**
3. รองรับไฟล์: MP3, WAV, OGG (สูงสุด 50MB)
4. เครื่องเล่นจะปรากฏด้านล่างหน้าจออัตโนมัติ

### การควบคุมเพลง

#### ปุ่มหลัก
- **⏯ Play/Pause**: เล่น/หยุดเพลง (หรือกด Spacebar)
- **⏮ Previous**: เพลงก่อนหน้า (หรือกด ←)
- **⏭ Next**: เพลงถัดไป (หรือกด →)

#### ฟีเจอร์เพิ่มเติม
- **🔀 Shuffle**: สุ่มเพลง
- **🔊 Volume**: ปรับระดับเสียง
- **⏱ Progress Bar**: คลิกเพื่อข้ามไปยังจุดที่ต้องการ

### การจัดการ Playlist
- **ลบเพลง**: คลิกไอคอน 🗑 ข้างเพลง
- **เล่นเพลง**: คลิกที่เพลงใน Playlist
- **ลบทั้งหมด**: ปุ่ม "ลบทั้งหมด"

## 💾 การจัดเก็บข้อมูล

### Local Storage
- **Playlist**: เก็บรายการเพลงในเครื่อง
- **Settings**: การตั้งค่าต่างๆ
- **ข้อมูลเพลง**: ชื่อ, ศิลปิน, ระยะเวลา

### ข้อมูลที่เก็บ
```javascript
{
  "id": "timestamp + random",
  "title": "ชื่อเพลง",
  "artist": "ชื่อศิลปิน",
  "duration": "ระยะเวลา (วินาที)",
  "url": "Data URL ของไฟล์",
  "size": "ขนาดไฟล์",
  "type": "ประเภทไฟล์",
  "addedAt": "วันที่เพิ่ม (ISO String)"
}
```

## 🎨 UI/UX Features

### การตอบสนอง (Responsive Design)
- รองรับทุกขนาดหน้าจอ
- Mobile-First Design
- Touch-Friendly Interface

### แอนิเมชั่น
- **Smooth Transitions**: การเปลี่ยนหน้าแบบนุ่มนวล
- **Hover Effects**: เอฟเฟกต์เมื่อเมาส์ชี้
- **Loading States**: แสดงสถานะการโหลด
- **Toast Notifications**: แจ้งเตือนแบบสวยงาม

### สีสัน
- **Primary**: Purple (`#667eea` → `#764ba2`)
- **Secondary**: Green, Blue, Red สำหรับ Status
- **Neutral**: Gray สำหรับข้อความ

## 📱 การรองรับเบราว์เซอร์

### รองรับ
- ✅ Chrome 60+
- ✅ Firefox 60+
- ✅ Safari 12+
- ✅ Edge 79+

### API ที่ใช้
- HTML5 Audio
- File API
- Local Storage
- Drag & Drop API

## 🔧 การปรับแต่ง

### การเปลี่ยนสี
แก้ไขใน CSS:
```css
.gradient-bg { 
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
}
```

### การเปลี่ยนฟอนต์
แก้ไขใน `<head>`:
```html
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');
```

### การเพิ่ม Platform
แก้ไขในหน้า Services:
```html
<li><i class="fas fa-check text-green-500 mr-2"></i>Platform ใหม่</li>
```

## 🐛 การแก้ไขปัญหา

### เพลงไม่เล่น
1. ตรวจสอบรูปแบบไฟล์ (MP3, WAV, OGG)
2. ตรวจสอบขนาดไฟล์ (< 50MB)
3. รีเฟรชหน้าเว็บ

### Playlist หาย
1. ตรวจสอบ Local Storage
2. ไม่ได้ลบ Browser Data
3. ใช้เบราว์เซอร์เดิม

### การอัปโหลดไม่ได้
1. ตรวจสอบการอนุญาตไฟล์
2. ตรวจสอบพื้นที่ว่างในเครื่อง
3. ลองไฟล์อื่น

## 🎯 การพัฒนาต่อ

### ฟีเจอร์ที่สามารถเพิ่ม
- 🎤 **Lyrics Display**: แสดงเนื้อเพลง
- 🎨 **Visualizer**: Spectrum Analyzer
- ☁️ **Cloud Storage**: เก็บข้อมูลบน Server
- 👥 **User Accounts**: ระบบสมาชิก
- 📊 **Analytics**: สถิติการฟัง
- 🎵 **Playlists Sharing**: แชร์ Playlist
- 🔊 **Equalizer**: ปรับแต่งเสียง

### การเชื่อมต่อ Backend
- REST API สำหรับการอัปโหลด
- Database สำหรับเก็บข้อมูลเพลง
- File Storage Service
- Authentication System

## 📝 License

MIT License - ใช้งานได้อย่างอิสระ

## 👨‍💻 การพัฒนาโดย

**MiniMax Agent** - AI Assistant สำหรับการพัฒนาเว็บไซต์

## 📞 การติดต่อ

หากมีคำถามหรือข้อเสนอแนะ สามารถใช้ฟอร์มติดต่อในหน้า **"ช่วยเหลือ"** ของเว็บไซต์

---

**🎉 ขอบคุณที่ใช้บริการ The Music Maker Thailand Distribution & Streaming Platform!**
