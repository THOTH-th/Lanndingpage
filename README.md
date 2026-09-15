# Thai Audio Recording Project — Recruitment Landing Page

หน้า Landing Page สำหรับรับสมัครผู้เข้าร่วม **โครงการบันทึกเสียงภาษาไทย** (THOTH / AI THOTH)
ออกแบบมาเพื่อเป็น "ศูนย์กลางข้อมูล" และเปลี่ยนผู้เข้าชมที่มีคุณสมบัติให้กลายเป็นผู้ลงทะเบียน

- 🇹🇭 เนื้อหาภาษาไทย เข้าใจง่าย น่าเชื่อถือ
- 📱 Mobile-first (รองรับ 375 / 390 / 430 / 768 / 1440px)
- ⚡ Static site — ไม่มี build step, โหลดเร็ว, deploy ได้ทุกที่
- 🧩 แก้ไขข้อมูลทั้งหมดได้จากไฟล์เดียว: [`assets/js/config.js`](assets/js/config.js)
- 📊 รองรับ UTM / รหัสแคมเปญ, เหตุการณ์ analytics, GA4 / GTM / Google Ads
- 🔒 ไม่เก็บข้อมูลอ่อนไหว (บัตรประชาชน/บัญชีธนาคาร) ในขั้นตอนสมัคร

---

## 1) โครงสร้างไฟล์

```
.
├── index.html                 # โครงหน้าเว็บ (HTML เชิงความหมาย + เนื้อหาไทย)
├── assets/
│   ├── css/styles.css         # ดีไซน์ + design tokens (สี/ระยะห่าง)
│   ├── js/
│   │   ├── config.js          # ★ ไฟล์ตั้งค่ากลาง — แก้ทุกอย่างที่นี่
│   │   ├── tracking.js        # จับ UTM / รหัสแคมเปญ / แหล่งที่มา
│   │   ├── analytics.js       # GA4 / GTM / Google Ads + event tracking
│   │   └── app.js             # เรนเดอร์เนื้อหา, ฟอร์ม, FAQ, ปุ่มลอย
│   └── img/                   # favicon.svg, og-image.svg (placeholder)
├── .env.example               # ตัวแปรลับ (เมื่อเชื่อมฟอร์มกับบริการภายนอก)
├── LICENSE
└── README.md
```

## 2) รันในเครื่อง (Local setup)

ไม่ต้องติดตั้งอะไร — เปิดไฟล์ `index.html` ได้เลย หรือเปิดเซิร์ฟเวอร์ static เพื่อให้ใกล้เคียงจริง:

```bash
# ตัวเลือกใดก็ได้
python3 -m http.server 8000        # แล้วเปิด http://localhost:8000
# หรือ
npx serve .
```

## 3) แก้ไขข้อมูลโครงการ (สำคัญที่สุด)

เปิดไฟล์ **`assets/js/config.js`** ไฟล์เดียว แก้ได้ทั้งหมด เช่น:

| ต้องการเปลี่ยน | แก้ที่ |
|---|---|
| ค่าตอบแทน | `compensation.amount` |
| ระยะเวลา | `time.estimatedDuration` |
| เส้นตาย/เป้าหมาย | `project.deadline`, `project.targetPairs` |
| ข้อมูลติดต่อ | `contact.email / phone / line / hours` |
| คุณสมบัติผู้เข้าร่วม | `requirements[]`, `eligibility[]` |
| ข้อกำหนดอุปกรณ์ | `device.items[]` |
| คำถามที่พบบ่อย | `faq[]` |
| ขั้นตอนการทำงาน | `steps[]` |
| ตัวเลือกในฟอร์ม | `form.*` |

> ค่าที่อยู่ในวงเล็บเหลี่ยม เช่น `[COMPENSATION_AMOUNT]` คือ **placeholder** ที่ยังไม่ได้กำหนด
> ระบบจะขึ้นป้ายเตือนสีเหลืองในหน้าเว็บให้อัตโนมัติจนกว่าจะแก้เป็นค่าจริง

## 4) เปลี่ยนลิงก์แบบฟอร์มลงทะเบียน

ในไฟล์ `config.js` ที่ `registration`:

- **โหมด A — ฟอร์มภายนอก** (เช่น Google Form)
  ```js
  registration: { mode: "external" },
  links: { registrationFormUrl: "https://forms.gle/xxxxxxxx" }
  ```
  ปุ่ม "สมัคร" ทุกปุ่มจะพาไปที่ลิงก์นั้น (พร้อมแนบ UTM ให้อัตโนมัติ)

- **โหมด B — ฟอร์มในเว็บ** (ค่าเริ่มต้น)
  ```js
  registration: { mode: "native", endpoint: "https://your-endpoint" }
  ```
  ฟอร์มจะส่งข้อมูลแบบ `POST` (JSON) ไปยัง `endpoint`
  เชื่อมต่อได้กับ **Google Sheets (Apps Script) / Airtable / Supabase / Webhook / CRM**
  ถ้าเว้น `endpoint` ว่างไว้ = โหมดสาธิต (แสดงหน้าขอบคุณโดยไม่ส่งข้อมูลจริง)

  ตัวอย่าง Google Apps Script (วางใน Sheet → Extensions → Apps Script → Deploy as Web App):
  ```js
  function doPost(e) {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Registrations");
    sheet.appendRow([new Date(), data.name, data.email, data.phone,
                     data.province, data.age_group, data.device, data.pair_status,
                     data.utm_source, data.utm_medium, data.utm_campaign, data.internal_source]);
    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
                         .setMimeType(ContentService.MimeType.JSON);
  }
  ```

## 5) เพิ่ม Google Analytics 4 (GA4)

ใน `config.js`:
```js
analytics: { ga4Id: "G-XXXXXXXXXX" }
```
สคริปต์ GA4 จะถูกโหลดอัตโนมัติเมื่อใส่ ID จริง (ไม่ใช่ `[GA4_ID]`)

## 6) เพิ่ม Google Tag Manager (GTM)

ใน `config.js`:
```js
analytics: { gtmId: "GTM-XXXXXXX" }
```
ทุกอีเวนต์ถูกส่งเข้า `window.dataLayer` อยู่แล้ว จึงพร้อมตั้ง Tag/Trigger ใน GTM ได้ทันที

**อีเวนต์ที่ยิงให้:** `page_view`, `cta_click`, `form_start`, `form_submit`,
`eligibility_click`, `faq_open`, `registration_complete`

**Google Ads conversion** (ไม่บังคับ): ตั้ง `analytics.adsConversionId` + `adsConversionLabel`
ระบบจะยิง conversion ตอนลงทะเบียนสำเร็จ

## 7) การติดตามแคมเปญ (UTM & แหล่งที่มา)

ระบบจับค่าเหล่านี้จาก URL อัตโนมัติและแนบไปกับทุกการลงทะเบียน:
`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`
รวมถึงรหัสภายใน เช่น `?src=FB01`, `?ref=PT02`

ตัวอย่าง URL แต่ละช่องทาง:
```
Facebook community : ?utm_source=facebook&utm_medium=community&utm_campaign=FB01
Google Ads (search): ?utm_source=google&utm_medium=cpc&utm_campaign=search01
พาร์ตเนอร์/มูลนิธิ  : ?utm_source=partner&utm_medium=referral&utm_campaign=foundation_a
มหาวิทยาลัย        : ?utm_source=partner&utm_medium=referral&utm_campaign=university_a
QR code (ออฟไลน์)   : ?utm_source=offline&utm_medium=qr&utm_campaign=event01
```
> **QR code:** สร้างจากภายนอก (เช่น เครื่องมือสร้าง QR ทั่วไป) โดยฝัง URL ที่ต่อ UTM ต่อแคมเปญ
> อย่าใช้ QR เดียวรวมทุกช่องทางเพราะจะวัดผลแยกไม่ได้

## 8) Deploy

### Vercel (แนะนำ)
1. Push โค้ดขึ้น GitHub (ทำแล้ว)
2. เข้า [vercel.com](https://vercel.com) → New Project → เลือก repo นี้
3. Framework Preset: **Other** (เป็น static, ไม่ต้อง build) → Deploy
4. ได้ URL เช่น `thai-audio.vercel.app`

### Netlify / Cloudflare Pages
- ลากโฟลเดอร์ทั้งหมดวาง หรือเชื่อม repo — ไม่ต้องตั้ง build command, publish directory = รากโปรเจกต์ (`/`)

### GitHub Pages
- Settings → Pages → Source: **Deploy from a branch** → `main` / `/ (root)` → Save
- ได้ URL `https://<owner>.github.io/<repo>/`

## 9) เชื่อมโดเมนของบริษัท (Custom domain)

- **ช่วงนำร่อง:** ใช้ URL ชั่วคราวของแพลตฟอร์ม (เช่น `thai-audio.vercel.app`) ได้
- **โปรดักชัน:** แนะนำโดเมน/ซับโดเมนที่บริษัทควบคุมเอง เช่น `audio.companydomain.com`
  - Vercel/Netlify/Cloudflare: Project → Domains → เพิ่มโดเมน → ตั้งค่า DNS (CNAME/A) ตามที่ระบบแจ้ง
  - ไม่ต้องซื้อ/ตั้งค่าโดเมนอัตโนมัติ — ทีมงานเป็นผู้ดำเนินการ

## 10) ความปลอดภัย

- ห้ามใส่คีย์ลับ/รหัสผ่านในโค้ดฝั่งหน้าเว็บ (ทุกอย่างใน `assets/` ผู้ใช้เห็นได้)
- คีย์ของ Supabase/Airtable/CRM ให้เก็บฝั่งเซิร์ฟเวอร์ (serverless function) เท่านั้น — ดู `.env.example`
- อย่า commit ไฟล์ `.env` จริง (มีใน `.gitignore` แล้ว)

## 11) เช็กลิสต์ก่อนเผยแพร่จริง

- [ ] แก้ทุก placeholder `[...]` ใน `config.js` ให้เป็นค่าจริง (ป้ายเหลืองต้องหายหมด)
- [ ] ตั้งค่าตอบแทน / ระยะเวลา / คุณสมบัติ / ช่วงอายุ ให้ตรงกับนโยบายโครงการ
- [ ] ใส่ลิงก์นโยบายความเป็นส่วนตัว + ข้อกำหนด
- [ ] เลือกโหมดฟอร์ม (external / native) และทดสอบส่งข้อมูลจริง
- [ ] ใส่ GA4 / GTM (ถ้าจะยิงโฆษณา) และทดสอบ event
- [ ] ทดสอบบนมือถือจริง + ตรวจว่าไม่มี scroll แนวนอน
- [ ] เปลี่ยน favicon และ og-image เป็นของจริง

---

## License

Released under the [MIT License](LICENSE).
