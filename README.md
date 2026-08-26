# LOBE — Design Your Needs (v5)

Aplikasi workspace berbasis web dengan tampilan ala desktop: pengguna membuat "ruangan" (room), lalu menyusun widget di dalamnya seperti menata jendela di komputer. Dibuat dengan PHP, MySQL, dan jQuery, dijalankan secara lokal lewat XAMPP.

## Fitur

- Ruang kerja multi-room per pengguna, dengan pengaturan grid yang bisa disesuaikan
- 16 widget, termasuk asisten AI (Google Gemini), code editor, flashcard, jam, dan file viewer
- Panel admin (`admin.php`) untuk mengelola pengguna, transaksi, dan produk
- Sistem langganan premium (Monthly Pro / Yearly Elite)
- Unggah dan pratinjau berkas per ruangan
- Pelacakan aktivitas pengguna

## Kebutuhan

- PHP 7.4 atau lebih baru
- MySQL / MariaDB
- Server lokal seperti XAMPP atau Laragon

## Cara Pasang

1. Taruh folder proyek di direktori web server (misalnya `htdocs` pada XAMPP).
2. Nyalakan Apache dan MySQL.
3. Salin `koneksi.example.php` menjadi `koneksi.php`, lalu sesuaikan isinya dengan kredensial MySQL milikmu.
4. Jalankan `php database_update/migrate.php` untuk memasang skema database (`lobe_v5_db`).
5. Buka `index.php` lewat browser.

### Asisten AI (opsional)

Widget asisten AI memerlukan API key Google Gemini. Buka `backend/gemini_api.php` dan ganti nilai `YOUR_GEMINI_API_KEY_HERE` dengan key milikmu.

## Akun Default

Instalasi baru membuat satu akun admin:

| Username | Password |
|----------|----------|
| admin    | admin321 |

Kredensial ini ditujukan untuk instalasi lokal. Ganti password admin sebelum aplikasi ditaruh di server yang bisa diakses publik.

## Struktur Folder

```
assets/           CSS, JavaScript, dan ikon
backend/          Endpoint PHP (autentikasi, room, widget, upload, AI)
database_update/  Skema SQL dan skrip migrasi
uploads/          Berkas unggahan pengguna (tidak dilacak git)
admin.php         Panel admin
index.php         Halaman utama aplikasi
koneksi.php       Konfigurasi koneksi database (tidak dilacak git)
```

## Lisensi

MIT — lihat berkas [LICENSE](LICENSE).
