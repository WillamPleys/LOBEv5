CREATE DATABASE IF NOT EXISTS lobe_v5_db;
USE lobe_v5_db;

-- Tabel Users (Untuk Admin & User)
CREATE TABLE users (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Masukkan Admin Default
INSERT INTO users (username, password, role) VALUES ('admin', 'admin321', 'admin');

-- Tabel Rooms (Ruangan kerja user)
CREATE TABLE rooms (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    user_id INT(11) NOT NULL,
    nama_room VARCHAR(100) NOT NULL,
    grid_settings JSON NULL, -- Menyimpan setting grid, ketebalan, tipe garis (putus/sambung)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================
-- TABEL 1 (SYARAT PAK DAVID): Tabel Master (Minimal 5 fields)
-- ==============================================================
CREATE TABLE master_items (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    nama_item VARCHAR(100) NOT NULL,
    deskripsi TEXT NOT NULL,
    gambar VARCHAR(255) NOT NULL, -- Menyimpan path/nama file gambar (SVG/PNG)
    tipe_item ENUM('input', 'output', 'api', 'tools', 'ui') NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert 15 Item Wajib untuk halaman awal (Welcome Screen)
INSERT INTO master_items (nama_item, deskripsi, gambar, tipe_item) VALUES 
('Create Sidebar', 'Modul sidebar yang bisa disesuaikan ukurannya.', 'sidebar_icon.svg', 'ui'),
('Grid Settings', 'Pengaturan ukuran dan gaya grid latar belakang.', 'grid_icon.svg', 'tools'),
('Output Field', 'Menampilkan hasil pemrosesan data atau AI.', 'output_icon.svg', 'output'),
('Gemini AI Assistant', 'Asisten AI pintar untuk merangkum, coding, dll.', 'gemini_icon.svg', 'api'),
('Rich Text Note', 'Catatan manual bergaya Word (CKEditor).', 'word_icon.svg', 'input'),
('Code Editor', 'Editor kode ala Sublime Text/VS Code.', 'code_icon.svg', 'input'),
('File to Summary', 'Ubah dokumen menjadi ringkasan cerdas.', 'summary_icon.svg', 'input'),
('Interactive Calendar', 'Kalender dengan custom CSS styling.', 'calendar_icon.svg', 'tools'),
('Media Player', 'Pemutar file musik/audio ala Windows.', 'player_icon.svg', 'output'),
('Flashcard Maker', 'Pembuat kartu memori otomatis.', 'flashcard_icon.svg', 'api'),
('Smart Search Bar', 'Pencarian dengan fitur autocomplete.', 'search_icon.svg', 'tools'),
('Image Viewer', 'Penampil gambar terintegrasi.', 'image_icon.svg', 'output'),
('Data Table', 'Tabel dinamis dengan fitur sortir.', 'table_icon.svg', 'ui'),
('Audio Transcript', 'Ubah audio menjadi teks secara otomatis.', 'transcript_icon.svg', 'api'),
('Sticky Notes', 'Catatan ringkas tempel di kanvas.', 'sticky_icon.svg', 'input');

-- ==============================================================
-- TABEL 2 (SYARAT PAK DAVID): Tabel Transaksi (Minimal 5 fields)
-- ==============================================================
-- Hanya diakses Admin, mencatat aktivitas (log/CRUD/Pendaftaran)
CREATE TABLE transactions (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    user_id INT(11) NOT NULL,
    jenis_aktivitas VARCHAR(50) NOT NULL, -- Contoh: 'login', 'create_room', 'update_profile'
    detail_aktivitas TEXT NOT NULL,
    ip_address VARCHAR(50) NOT NULL,
    waktu_transaksi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);