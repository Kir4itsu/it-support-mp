# 🔧 SUPABASE SETUP INSTRUCTIONS

Ikuti langkah-langkah ini untuk menyelesaikan konfigurasi Supabase.

---

## ✅ STEP 1: Setup Database Schema

1. **Buka Supabase Dashboard**: https://supabase.com/dashboard
2. Pilih project Anda: `frhctzhtjfewjsenldwu`
3. Klik **SQL Editor** di sidebar kiri
4. Klik **New Query**
5. **Copy seluruh isi file `supabase-schema.sql`** dan paste ke editor
6. Klik **Run** atau tekan `Ctrl+Enter`
7. Pastikan muncul pesan "Success. No rows returned"

**Apa yang dilakukan:**
- Membuat tabel `tickets` untuk menyimpan tiket mahasiswa
- Membuat tabel `admin_profiles` untuk menyimpan data admin
- Membuat RLS policies agar mahasiswa bisa create/read tiket TANPA login
- Membuat trigger untuk auto-create admin profile saat registrasi

---

## ✅ STEP 2: Setup Email Authentication (PENTING!)

### Kenapa Email Verifikasi Tidak Masuk?
Secara default, Supabase menggunakan email system internal yang sering masuk ke spam atau tidak terkirim. Anda perlu mengkonfigurasi email provider.

### Pilihan 1: Nonaktifkan Email Verification (Untuk Testing)

**⚠️ HANYA UNTUK DEVELOPMENT/TESTING!**

1. Buka **Authentication** > **Providers** > **Email**
2. Scroll ke bawah ke **Email Settings**
3. **MATIKAN** toggle **"Enable email confirmations"**
4. Klik **Save**

**Efeknya:** Admin bisa langsung login tanpa verifikasi email (good for testing).

---

### Pilihan 2: Setup Custom SMTP (Production Ready)

**Recommended untuk production!** Gunakan Gmail SMTP atau Resend.

#### Option A: Gmail SMTP

1. Buka **Authentication** > **Settings** > **SMTP Settings**
2. Enable **"Enable Custom SMTP"**
3. Isi konfigurasi:
   ```
   Host: smtp.gmail.com
   Port: 587
   Username: youremail@gmail.com
   Password: [App Password - lihat cara dibawah]
   Sender Email: youremail@gmail.com
   Sender Name: IT Support Kampus
   ```

**Cara Membuat Gmail App Password:**
1. Buka https://myaccount.google.com/security
2. Enable **2-Step Verification** jika belum
3. Klik **App passwords**
4. Pilih **Mail** dan **Other (Custom name)**
5. Copy password yang dihasilkan (16 karakter)
6. Paste ke Supabase SMTP Password field

#### Option B: Resend (Recommended)

Resend lebih mudah dan reliable untuk transactional emails.

1. Daftar di https://resend.com (Free tier: 100 emails/day)
2. Buat API Key
3. Di Supabase **Authentication** > **Settings** > **SMTP Settings**:
   ```
   Host: smtp.resend.com
   Port: 587
   Username: resend
   Password: [Your Resend API Key]
   Sender Email: onboarding@resend.dev
   Sender Name: IT Support Kampus
   ```

---

### Pilihan 3: Tambahkan Redirect URL (Wajib untuk Production)

Jika deploy ke web (Vercel/Netlify):

1. Buka **Authentication** > **URL Configuration**
2. Di **Redirect URLs**, tambahkan:
   ```
   http://localhost:8081/admin/login
   https://yourdomain.com/admin/login
   ```
3. Klik **Save**

---

## ✅ STEP 3: Test Database Connection

Setelah menjalankan SQL schema, test dengan:

### Test 1: Create Ticket
1. Buka app mahasiswa
2. Isi form "Create Ticket"
3. Klik "Kirim Tiket"
4. **Seharusnya berhasil!** ✅

Jika masih error, cek Console log dan kirim error messagenya.

### Test 2: Admin Register
1. Buka Admin Register page
2. Isi form registrasi
3. Klik "Daftar"
4. **Jika email verification DISABLED**: Langsung bisa login
5. **Jika email verification ENABLED**: Cek email inbox/spam

---

## 🔍 Troubleshooting

### Error: "new row violates row-level security policy"
- **Solusi**: Pastikan RLS policies sudah dibuat dengan benar (lihat STEP 1)
- Cek di Supabase Dashboard > **Authentication** > **Policies**

### Error: "relation 'tickets' does not exist"
- **Solusi**: Tabel belum dibuat. Jalankan `supabase-schema.sql` (STEP 1)

### Email verification tidak masuk
- **Quick Fix**: Nonaktifkan email confirmation (STEP 2 - Pilihan 1)
- **Production Fix**: Setup SMTP dengan Gmail/Resend (STEP 2 - Pilihan 2)

### "Unable to validate email address: invalid format"
- **Solusi**: Pastikan format email benar (contoh: user@example.com)

### Tickets tidak muncul di dashboard admin
- **Solusi**: Pastikan admin sudah login dan RLS policies benar

---

## 📝 Verification Checklist

Setelah setup, pastikan ini semua ✅:

- [ ] SQL Schema sudah dijalankan di SQL Editor
- [ ] Tabel `tickets` dan `admin_profiles` sudah ada
- [ ] RLS Policies sudah aktif
- [ ] Email configuration sudah dipilih (disable atau SMTP)
- [ ] Test create ticket berhasil
- [ ] Test admin register berhasil
- [ ] Admin bisa login

---

## 🆘 Masih Error?

Kirim screenshot error message + console logs untuk debugging lebih lanjut.

Pastikan sertakan:
1. Error message yang muncul di Alert
2. Console.error output (buka Developer Tools)
3. Screenshot Supabase Dashboard > Table Editor > tickets
