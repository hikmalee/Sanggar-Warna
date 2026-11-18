# Sanggar Warna Creative Hub

Aplikasi web responsif untuk ekosistem pembelajaran seni: kelas, materi, tugas, jadwal, portofolio, Competition Hub, Scholarship Hub, laporan, dan pengelolaan pengguna.

## Isi paket

- `index.html` — struktur halaman dan komponen aplikasi.
- `styles.css` — desain kids-friendly, responsif, animasi, dashboard, tabel, modal.
- `app.js` — navigasi, autentikasi, mode demo, formulir CRUD, dan koneksi Supabase.
- `supabase-schema.sql` — skema database awal dan kebijakan keamanan dasar.

## Menjalankan mode demo

1. Unduh dan ekstrak folder ini.
2. Buka folder dengan VS Code.
3. Jalankan menggunakan ekstensi Live Server atau server lokal.
4. Klik **Coba Demo** pada halaman masuk.
5. Untuk mencoba tampilan role lain, klik **Pengaturan** di sidebar dan pilih `student`, `parent`, `tutor`, atau `admin`.

Mode demo menyimpan data pada `localStorage` browser. Data ini hanya ada di browser/perangkat yang digunakan dan bukan database bersama.

## Mengaktifkan backend Supabase

1. Buat project di https://supabase.com.
2. Buka **SQL Editor**, lalu jalankan isi `supabase-schema.sql`.
3. Buka **Project Settings → API** dan salin Project URL serta anon/public key.
4. Isi dua konstanta berikut di bagian atas `app.js`:

```js
const SUPABASE_URL = "https://PROJECT-ID.supabase.co";
const SUPABASE_ANON_KEY = "SUPABASE_ANON_KEY";
```

5. Pada Supabase Authentication, aktifkan metode Email.
6. Atur URL redirect sesuai alamat GitHub Pages yang digunakan.
7. Buat akun admin awal. Untuk keamanan, ubah role admin melalui SQL Editor sebagai pemilik project, bukan dari form pendaftaran publik:

```sql
update public.profiles
set role = 'admin'
where email = 'email-admin-anda@example.com';
```

8. Uji login dengan akun dari setiap role.

## Deploy ke GitHub Pages

1. Buat repository GitHub, misalnya `Sanggar-Warna`.
2. Unggah seluruh isi folder ini ke root repository.
3. Buka **Settings → Pages**.
4. Pilih **Deploy from a branch**, branch `main`, folder `/ (root)`.
5. Simpan dan tunggu proses deployment.
6. Buka URL GitHub Pages yang diberikan GitHub.

## Fitur yang tersedia pada starter ini

- Login, registrasi, logout, dan mode demo.
- Role siswa, orang tua/wali, tutor, dan admin (role demo dapat diganti melalui Pengaturan).
- Dashboard ringkasan.
- Katalog kelas dan pendaftaran.
- Pengelolaan materi/modul.
- Pengelolaan tugas.
- Jadwal.
- Portofolio digital dengan status visibilitas dan moderasi.
- Competition Hub dan Scholarship Hub dengan sumber dan tanggal verifikasi.
- Pencapaian, laporan perkembangan, pusat bantuan.
- Manajemen pengguna dasar.
- CRUD tambah, edit, hapus untuk modul data yang tersedia.

## Catatan penting sebelum digunakan sungguhan

Paket ini adalah fondasi aplikasi GitHub-ready. Mode demo berjalan tanpa backend. Supabase menyediakan autentikasi dan penyimpanan data saat dikonfigurasi, tetapi beberapa proses lanjutan masih perlu dikembangkan: unggah file langsung ke Supabase Storage, relasi akun wali-anak, pengumpulan tugas per siswa, absensi per pertemuan, chat real-time, notifikasi email/push, pembayaran, sertifikat PDF, serta kebijakan RLS granular untuk produksi.

Jangan gunakan data anak sungguhan atau membuka aplikasi ke publik sebelum kebijakan akses Supabase diuji. Khususnya, jangan memberikan role admin melalui registrasi publik.
