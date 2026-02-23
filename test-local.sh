#!/bin/bash

# Tezkor Test Script - Local'da test qilish uchun

echo "🧪 Backup Scriptlarini Test Qilish"
echo "====================================="
echo ""

# 1. Syntax tekshirish
echo "1️⃣  Bash syntax tekshirish..."
bash -n scripts/backup.sh && echo "  ✅ backup.sh - syntax OK" || echo "  ❌ backup.sh - syntax ERROR"
bash -n scripts/manual-backup.sh && echo "  ✅ manual-backup.sh - syntax OK" || echo "  ❌ manual-backup.sh - syntax ERROR"
bash -n scripts/restore.sh && echo "  ✅ restore.sh - syntax OK" || echo "  ❌ restore.sh - syntax ERROR"
bash -n scripts/manual-restore.sh && echo "  ✅ manual-restore.sh - syntax OK" || echo "  ❌ manual-restore.sh - syntax ERROR"
bash -n droplet-fix.sh && echo "  ✅ droplet-fix.sh - syntax OK" || echo "  ❌ droplet-fix.sh - syntax ERROR"

echo ""
echo "2️⃣  Line endings tekshirish..."
file scripts/backup.sh | grep -q "CRLF" && echo "  ⚠️  backup.sh has CRLF (Windows line endings)" || echo "  ✅ backup.sh - OK"
file scripts/manual-backup.sh | grep -q "CRLF" && echo "  ⚠️  manual-backup.sh has CRLF" || echo "  ✅ manual-backup.sh - OK"

echo ""
echo "3️⃣  Shebang tekshirish..."
head -n 1 scripts/backup.sh | grep -q "^#!/bin/bash" && echo "  ✅ backup.sh" || echo "  ❌ backup.sh - shebang missing"
head -n 1 scripts/manual-backup.sh | grep -q "^#!/bin/bash" && echo "  ✅ manual-backup.sh" || echo "  ❌ manual-backup.sh - shebang missing"

echo ""
echo "4️⃣  Verbose output tekshirish (2>&1 bo'lmasligi kerak)..."
if grep -q "2>&1" scripts/backup.sh; then
  echo "  ❌ backup.sh - hali \"2>&1\" mavjud!"
else
  echo "  ✅ backup.sh - \"2>&1\" yo'q"
fi

if grep -q "2>&1" scripts/manual-backup.sh; then
  echo "  ❌ manual-backup.sh - hali \"2>&1\" mavjud!"
else
  echo "  ✅ manual-backup.sh - \"2>&1\" yo'q"
fi

echo ""
echo "====================================="
echo "✅ Test tugallandi!"
echo ""
echo "📝 Keyingi qadamlar:"
echo "  1. Git push: git add . && git commit -m 'fix: backup scripts' && git push"
echo "  2. Dropletda test: ssh root@your-droplet-ip 'cd ~/kinolarBot && git pull && ./droplet-fix.sh'"
echo ""
