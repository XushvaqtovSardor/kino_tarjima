# 🔄 Ma'lumotlarni Backupdan Tiklash - Oddiy Qo'llanma

## 📋 Vaziyat

PostgreSQL ma'lumotlaringiz yo'qolgan yoki buzilgan. Backups papkasida saqlangan backupdan tiklashingiz kerak.

---

## ⚡ TEZKOR TIKLASH (5 DAQIQA)

### 1️⃣ Mavjud Backuplarni Ko'rish

```bash
# Backuplar papkasiga o'tish
cd ~/kinolarBot
ls -lht backups/

# Natija ko'rinishi:
# -rw-r--r-- 1 root root 8.0K Feb 23 10:00 kino_db_backup_20260223_100000.sql.gz
# -rw-r--r-- 1 root root 7.8K Feb 22 18:00 kino_db_backup_20260222_180000.sql.gz
```

**Eng so'nggi backupni tanlang** (birinchi qatordagi fayl).

### 2️⃣ Botni To'xtatish

```bash
docker compose stop app
```

**⚠️ MUHIM:** Restore paytida bot ishlamasligi kerak!

### 3️⃣ Backupdan Tiklash

```bash
# Backup fayl nomini kiriting (yuqoridan ko'rib)
./scripts/manual-restore.sh kino_db_backup_20260223_100000.sql.gz
```

**Script so'raydi:**
```
⚠️  DIQQAT: Bu amal bazadagi hamma ma'lumotlarni o'chiradi!
Davom etishni xohlaysizmi? (yes/no):
```

**Javob:** `yes` yozing va ENTER bosing

### 4️⃣ Botni Qayta Ishga Tushirish

```bash
docker compose restart app

# Loglarni kuzatish
docker compose logs -f app
```

**Kutilayotgan natija:**
```
✅ Started successfully
✅ Bot connected
```

### 5️⃣ Tekshirish

Telegram'da botga `/start` yuboring. Agar javob bersa - **muvaffaqiyatli!** ✅

---

## 📝 BATAFSIL QADAMLAR

### Preparation (Tayyorgarlik)

#### 1. Serverga SSH orqali kirish

```bash
ssh root@your-server-ip
cd ~/kinolarBot
```

#### 2. Backuplar mavjudligini tekshirish

```bash
# Backuplar sonini ko'rish
ls backups/*.sql.gz | wc -l

# Agar 0 bo'lsa - backuplar yo'q!
# Agar 1+ bo'lsa - davom eting
```

**Agar backuplar yo'q bo'lsa:**
```bash
echo "❌ Backuplar topilmadi!"
echo "Eski server yoki backup source kerak."
exit 1
```

#### 3. Backup faylini tanlash

```bash
# Eng so'nggi backupni ko'rish
ls -lht backups/ | head -3

# Misol natija:
# Feb 23 10:00 kino_db_backup_20260223_100000.sql.gz  <- ENG YANGI
# Feb 22 18:00 kino_db_backup_20260222_180000.sql.gz
# Feb 21 12:00 kino_db_backup_20260221_120000.sql.gz
```

**Qaysi backupni tanlash kerak?**

- ✅ **Eng so'nggi** (birinchi qator) - eng ko'p ma'lumot
- ⚠️ **Eski backup** - agar eng so'nggisi buzilgan bo'lsa

#### 4. Backup integrity test (ixtiyoriy)

```bash
# Backup fayl to'g'ri ekanligini tekshirish
BACKUP_FILE="kino_db_backup_20260223_100000.sql.gz"
gzip -t "backups/$BACKUP_FILE"

# Agar xatolik bo'lmasa - backup to'g'ri
# Agar xatolik bo'lsa - boshqa backupni tanlang
```

---

### Restore Process (Tiklash Jarayoni)

#### 1. Botni to'xtatish

```bash
# Bot containerini to'xtatish
docker compose stop app

# Tekshirish
docker ps | grep kino_bot
# Natija bo'sh bo'lishi kerak
```

#### 2. Restore scriptini ishga tushirish

```bash
# Backup fayl nomini kiriting
BACKUP_FILE="kino_db_backup_20260223_100000.sql.gz"

# Restore qilish
./scripts/manual-restore.sh "$BACKUP_FILE"
```

**Jarayon:**

```
🔍 Backup faylini tekshirish...
✅ Backup fayli to'g'ri

⚠️  DIQQAT: Bu amal bazadagi hamma ma'lumotlarni o'chiradi!
📁 Restore qilinadigan fayl: kino_db_backup_20260223_100000.sql.gz (8.0K)

Davom etishni xohlaysizmi? (yes/no): yes  <-- YES yozing

🔄 Restore boshlandi: Sun Feb 23 12:00:00 UTC 2026
🔌 Database connectionlarni yopish...
🗑️  Mavjud bazani o'chirish...
📦 Yangi baza yaratish...
📥 Ma'lumotlarni tiklash...
✅ Restore tugallandi: Sun Feb 23 12:00:15 UTC 2026

📊 Statistika:
  • Jadvallar soni: 17
  • Foydalanuvchilar: 142
  • Database hajmi: 2.5MB

🎉 Muvaffaqiyatli tiklandi!

⚠️  ESLATMA: Bot qayta ishga tushirilganda Prisma migratsiyalari avtomatik tekshiriladi.
```

#### 3. Botni qayta ishga tushirish

```bash
# Bot containerini ishga tushirish
docker compose start app

# Yoki to'liq restart
docker compose restart app
```

#### 4. Loglarni kuzatish

```bash
# Bot loglarini real-timeda ko'rish
docker compose logs -f app

# Kutilayotgan loglar:
# ✅ Prisma Client initialized
# ✅ Database connected
# ✅ Bot started successfully
# ✅ Bot username: @YourBot
```

**Ctrl+C** bosib loglardan chiqing.

---

### Verification (Tekshirish)

#### 1. Database holatini tekshirish

```bash
# Jadvallar soni
docker exec kino_database psql -U postgres -d kino_db -c \
  "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';"

# Foydalanuvchilar soni
docker exec kino_database psql -U postgres -d kino_db -c \
  "SELECT COUNT(*) FROM \"User\";"

# Filmlar soni
docker exec kino_database psql -U postgres -d kino_db -c \
  "SELECT COUNT(*) FROM \"Movie\";"
```

#### 2. Bot holatini tekshirish

```bash
# Bot ishlab turganini tekshirish
docker ps | grep kino_bot

# Status OK bo'lishi kerak:
# kino_bot   Up 2 minutes   3098/tcp
```

#### 3. Telegram'da test qilish

1. Telegram'da botga o'ting
2. `/start` yuboring
3. Bot javob berishi kerak
4. Menuni tekshiring
5. Film qidirishni sinab ko'ring

**Agar hammasi ishlasa - muvaffaqiyat!** 🎉

---

## 🆘 MUAMMOLAR VA YECHIMLAR

### ❌ Muammo 1: "Backup fayl topilmadi"

**Sabab:** Fayl nomi noto'g'ri yoki backuplar yo'q.

**Yechim:**
```bash
# To'g'ri fayl nomini ko'rish
ls -1 backups/
# Ko'ringan nomni aynan ko'chirib oling

# Misol:
./scripts/manual-restore.sh kino_db_backup_20260223_100000.sql.gz
```

### ❌ Muammo 2: "Database connection refused"

**Sabab:** PostgreSQL container ishlamayapti.

**Yechim:**
```bash
# Database containerini tekshirish
docker ps | grep kino_database

# Agar yo'q bo'lsa, ishga tushirish
docker compose up -d db

# Kutish (5 soniya)
sleep 5

# Qayta restore qilish
./scripts/manual-restore.sh kino_db_backup_20260223_100000.sql.gz
```

### ❌ Muammo 3: Restore qilindi, lekin bot ishlamayapti

**Sabab:** Bot qayta ishga tushirilmagan yoki migration xatoligi.

**Yechim:**
```bash
# Botni to'liq qayta build qilish
docker compose down
docker compose up -d

# Loglarni kuzatish
docker compose logs -f app

# Agar migration xatosi bo'lsa:
docker compose exec app npx prisma migrate deploy
docker compose restart app
```

### ❌ Muammo 4: "Backup fayli buzilgan"

**Sabab:** Backup fayl to'liq yuklanmagan yoki xotirada xatolik.

**Yechim:**
```bash
# Integrity test
gzip -t backups/kino_db_backup_20260223_100000.sql.gz

# Agar FAIL:
# - Boshqa (eski) backupni sinab ko'ring
ls -lht backups/ | head -5

# Ikkinchi eng so'nggi backupni tanlang
./scripts/manual-restore.sh kino_db_backup_20260222_180000.sql.gz
```

### ❌ Muammo 5: "Permission denied"

**Sabab:** Script executable emas.

**Yechim:**
```bash
chmod +x scripts/*.sh
./scripts/manual-restore.sh kino_db_backup_20260223_100000.sql.gz
```

### ❌ Muammo 6: Ma'lumotlar eski

**Sabab:** Eski backupdan tiklangan.

**Yechim:**
```bash
# Eng so'nggi backupni aniqlash
LATEST=$(ls -t backups/*.sql.gz | head -1)
echo "Eng so'nggi: $LATEST"

# Shu backupdan tiklash
./scripts/manual-restore.sh $(basename "$LATEST")

# Bot restart
docker compose restart app
```

---

## 📊 RESTORE STSENARIYLAR

### Ssenariy 1: Server yangi o'rnatilgan, ma'lumotlar yo'q

```bash
# 1. Backuplarni ko'chirish (agar boshqa serverdan)
scp -r old-server:/root/kinolarBot/backups/* ~/kinolarBot/backups/

# 2. Eng so'nggi backupni tiklash
cd ~/kinolarBot
LATEST=$(ls -t backups/*.sql.gz | head -1)
./scripts/manual-restore.sh $(basename "$LATEST")

# 3. Bot ishga tushirish
docker compose up -d
```

### Ssenariy 2: Database buzilgan, restore kerak

```bash
# 1. Bot to'xtatish
docker compose stop app

# 2. Hozirgi holatdan backup olish (ehtiyot uchun)
./scripts/manual-backup.sh

# 3. Yaxshi backupdan tiklash
./scripts/manual-restore.sh kino_db_backup_20260223_100000.sql.gz

# 4. Bot ishga tushirish
docker compose restart app
```

### Ssenariy 3: Kechagi holatga qaytish kerak

```bash
# 1. Kechagi backupni topish
ls backups/ | grep $(date -d "yesterday" +%Y%m%d)

# Natija: kino_db_backup_20260222_100000.sql.gz

# 2. Restore
docker compose stop app
./scripts/manual-restore.sh kino_db_backup_20260222_100000.sql.gz
docker compose restart app
```

### Ssenariy 4: Serverlar o'rtasida migratsiya

```bash
# ESKI SERVER:
cd ~/kinolarBot
./scripts/manual-backup.sh
# Backup yaratiladi va backups/ papkasiga saqlanadi

# Backupni yuklab olish (local kompyuter)
scp root@old-server:~/kinolarBot/backups/kino_db_backup_*.sql.gz ./

# YANGI SERVER:
# Backupni yuklash
scp kino_db_backup_*.sql.gz root@new-server:~/kinolarBot/backups/

# Restore qilish
ssh root@new-server
cd ~/kinolarBot
./scripts/manual-restore.sh kino_db_backup_20260223_100000.sql.gz
docker compose up -d
```

---

## ✅ RESTORE MUVAFFAQIYATLI BO'LGANINI QANDAY BILISH?

### 1. Script natijasi

✅ Ko'rish kerak:
```
🎉 Muvaffaqiyatli tiklandi!
📊 Statistika:
  • Jadvallar soni: 15+
  • Foydalanuvchilar: 100+
  • Database hajmi: 1MB+
```

### 2. Bot loglari

✅ Ko'rish kerak:
```bash
docker compose logs app | grep -i "start\|connect\|error"

# Yaxshi loglar:
✅ Database connected
✅ Bot started successfully
✅ Listening for updates

# Yomon loglar:
❌ Database connection error
❌ Table does not exist
```

### 3. Telegram test

✅ Ishlashi kerak:
- Bot `/start` ga javob beradi
- Menular ko'rinadi
- Film qidirish ishlaydi
- Admin panel ochiladi (admin uchun)

---

## 🔒 XAVFSIZLIK VA BEST PRACTICES

### 1. Restore oldidan ALBATTA backup yarating

```bash
# Agar database hozir ishlayotgan bo'lsa
./scripts/manual-backup.sh

# Nusxa oling
cp backups/kino_db_backup_*.sql.gz /safe/location/
```

### 2. Test environmentda sinab ko'ring

Agar mumkin bo'lsa, avval test serverda sinab ko'ring.

### 3. Downtime rejalashtiring

Production'da restore paytida:
- Foydalanuvchilarni ogohlantiring
- Bot'ga maintenance xabari qo'ying
- Tez orada (10-15 daqiqa) qaytishni va'da qiling

### 4. Backup tartibi

- Kunlik backup: Avtomatik (har 6 soatda)
- Haftalik backup: Manual (muhim o'zgarishlar oldidan)
- Oylik backup: Archive (cloud storage'ga)

---

## 📞 YORDAM

Agar muammo hal bo'lmasa:

### Loglarni to'plash

```bash
# Database logs
docker logs kino_database --tail 100 > db_logs.txt

# Bot logs
docker logs kino_bot --tail 100 > bot_logs.txt

# System info
docker ps > containers.txt
df -h > disk_space.txt
```

### Debug restore

```bash
# Restore process bilan muammo bo'lsa
# Manual qadam-baqadam restore:

# 1. Database tozalash
docker exec kino_database psql -U postgres -d postgres -c "DROP DATABASE IF EXISTS kino_db;"
docker exec kino_database psql -U postgres -d postgres -c "CREATE DATABASE kino_db;"

# 2. Backupni dekompressiya qilish va yuklash
gunzip -c backups/kino_db_backup_20260223_100000.sql.gz | \
  docker exec -i kino_database psql -U postgres -d kino_db

# 3. Natijani tekshirish
docker exec kino_database psql -U postgres -d kino_db -c "\dt"
```

---

## 🎓 XULOSA

### Oddiy restore (5 daqiqa):

```bash
cd ~/kinolarBot
docker compose stop app
./scripts/manual-restore.sh kino_db_backup_20260223_100000.sql.gz
docker compose restart app
```

### Tekshirish:

```bash
docker compose logs app | tail -20
# Telegram'da /start
```

### Muammo bo'lsa:

```bash
docker compose down
docker compose up -d
docker compose logs -f app
```

---

**Muvaffaqiyat!** 🚀

Restore jarayoni oddiy. Asosiy qoidalar:
1. ✅ To'g'ri backupni tanlash
2. ✅ Botni to'xtatish
3. ✅ Restore qilish
4. ✅ Botni qayta ishga tushirish

**Esda tuting:** Restore qilgandan keyin **ALBATTA** botni qayta ishga tushiring!
