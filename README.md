# Quick Assist 🚀

**Quick Assist** adalah platform *live chat support* real-time modern yang dirancang untuk menjembatani komunikasi antara pelanggan dan agen *support*. Dibangun dengan Next.js, Tailwind CSS, dan Firebase (Realtime Database & Authentication), platform ini menawarkan pengalaman pengiriman pesan instan yang mulus beserta dashboard administratif yang komprehensif.

---

## ✨ Fitur Utama dan Panduan Penggunaan (Short Documentation)

Berikut adalah daftar semua fitur yang telah diimplementasikan beserta cara menggunakannya:

### 1. 💬 Live Chat & Dukungan Pelanggan
**Untuk Pelanggan (Widget Chat):**
- **Cara Penggunaan**: Di halaman utama (Landing Page), pelanggan dapat mengklik ikon *chat* di sudut kanan bawah. Mereka harus memasukkan Nama dan Email sebelum memulai sesi.
- **Fitur**: Pesan real-time dua arah, indikator status online/offline agen, dan sesi *persistent* (chat tidak hilang jika halaman direfresh).

**Untuk Agen (Inbox Dashboard):**
- **Cara Penggunaan**: Login ke `/admin/login`. Di menu **Inbox**, agen dapat melihat daftar chat yang masuk.
- **Fitur**:
  - **Terima Chat (Take Over/Accept)**: Agen dapat mengambil alih percakapan dengan pelanggan secara eksklusif.
  - **Balas Pesan**: Kirim pesan obrolan secara real-time ke pelanggan. Terdapat indikator "Typing..." untuk melihat kapan pelanggan sedang mengetik.
  - **Resolve Chat**: Jika masalah sudah selesai, agen dapat menekan tombol **Resolve** untuk menutup obrolan. Pelanggan akan diberitahu bahwa sesi telah ditutup dan bisa memberikan *rating* (jika diaktifkan) atau memulai obrolan baru.

### 2. 👥 Manajemen Tim & RBAC (Role-Based Access Control)
Sistem ini menggunakan dua peran utama: **Agent** (standar) dan **Superadmin**. Fitur Manajemen Tim **hanya dapat diakses secara eksklusif oleh Superadmin**.

- **Cara Penggunaan**: Login sebagai Superadmin, lalu buka navigasi menu **Team Directory**.
- **Fitur**:
  - **Lihat Status Tim**: Melihat daftar nama seluruh agen beserta status *Online* atau *Offline* agen secara real-time.
  - **Tambah Agen Baru**: Klik "Add New Agent", masukkan informasi (nama, email, password sementara), dan pilih peran (Agent/Superadmin). Akun agen akan langsung terbuat tanpa me-logout/memutus sesi admin yang membuatnya.
  - **Ubah Peran (Role)**: Superadmin dapat menaikkan/menurunkan peran ke Agen biasa atau Superadmin dengan menekan tombol aksi "Role".
  - **Hapus Agen**: Menghapus akses agen dari dashboard sepenuhnya (revoke access) melalui tombol "Remove".

### 3. 📈 CRM & Broadcast Email (Newsletter)
Modul CRM (Customer Relationship Management) membantu Anda membangun *audience* dari sistem chat. Sistem ini otomatis menyimpan info pelanggan yang telah chat sebagai subscriber aktif. **Hanya dapat diakses oleh Superadmin.**

- **Cara Penggunaan**: Buka opsi menu navigasi **CRM** di dashboard admin.
- **Fitur**:
  - **Daftar Subscriber**: Melihat dan menelusuri daftar nama pelanggan yang telah bergabung melalui widget live chat beserta email dan waktu bergabung mereka.
  - **Kirim Broadcast Campaign**: Superadmin dapat mengirim email/pesan blast ke seluruh audiens. Masukkan *Subject Line* dan *Message Body* untuk mengirim promo atau *newsletter* secara massal.

### 4. 📜 Audit Logs (Catatan Aktivitas Sistem)
Tindakan log kritikal dicatat oleh sistem guna menjaga transparansi dan manajemen kendali penuh untuk pengawasan keamanan tim. **Hanya dapat diakses oleh Superadmin.**

- **Cara Penggunaan**: Buka menu **Audit Logs** di *sidebar/bottom bar* dashboard admin.
- **Fitur**:
  - **Monitor Aktivitas Keamanan**: Melacak aktivitas masuk (login) secara rinci, termasuk perangkat/lokasi jika dimungkinkan.
  - **Rekaman Aksi Tim**: Melacak catatan waktu kapan pun agen baru dibuat, *role* diubah, dan agen dihapus, beserta nama admin yang mengeksekusinya.

### 5. ⚙️ Pengaturan Profil (Profile Settings)
Setiap akun secara independen, baik agen maupun superadmin, memiliki kendali privat penuh atas akun mereka sendiri di halaman terpisah.

- **Cara Penggunaan**: Buka menu **Profile** yang tersedia melalui navigasi dashboard (ikon bergerigi).
- **Fitur**:
  - **Ubah Nama Tampilan**: Mengatur atau mengedit identitas nama yang akan terlihat oleh pelanggan saat membalas pesan dan sesama anggota tim.
  - **Manajemen Password**: Mengganti password akses Firebase dengan praktis secara instan dalam UI web interface.

---

## 🏗️ Teknologi yang Digunakan
- **Frontend**: Next.js 15 (App Router), React, Tailwind CSS v4, Vanilla CSS
- **Library Ikon**: React Icons (Feather)
- **Backend & Database**: Firebase Realtime Database
- **Autentikasi**: Firebase Authentication

---

## 🚀 Cara Menjalankan Project Secara Lokal

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Konfigurasi Environment Variables:**
   Buat file `.env.local` di *root directory* lalu siapkan var enviroment berikut (contoh format dapat dilihat di `.env.example`).
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_value
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_value
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_value
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_value
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_value
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_value
   NEXT_PUBLIC_FIREBASE_APP_ID=your_value
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_value
   ```

3. **Jalankan Development Server:**
   ```bash
   npm run dev
   ```

4. **Eksplorasi Akses Dashboard:**
   - **Tampilan Pelanggan (Widget):** Buka [http://localhost:3000](http://localhost:3000) dan amati interaksi floating chat.
   - **Tampilan Admin (Sistem Backend):** Buka [http://localhost:3000/admin/login](http://localhost:3000/admin/login). Anda bebas meregistrasi secara temporer "Fake Superadmin" jika sistem pendaftaran *auth* masih terbuka untuk publik guna keperluan *testing*.
