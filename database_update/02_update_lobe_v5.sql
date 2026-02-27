USE lobe_v5_db;

-- 1. Buat tabel room_widgets untuk menyimpan posisi dan isi modul
CREATE TABLE IF NOT EXISTS room_widgets (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    room_id INT(11) NOT NULL,
    master_item_id INT(11) NOT NULL,
    widget_dom_id VARCHAR(50) NOT NULL,
    pos_x INT(11) DEFAULT 100,
    pos_y INT(11) DEFAULT 100,
    width INT(11) DEFAULT 300,
    height INT(11) DEFAULT 250,
    content_data JSON NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (master_item_id) REFERENCES master_items(id) ON DELETE CASCADE
);

-- 2. Matikan pengecekan Foreign Key sementara, Kosongkan, lalu Hidupkan lagi
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE master_items;
SET FOREIGN_KEY_CHECKS = 1;

-- 3. Masukkan 16 Fitur Final LOBE
INSERT INTO master_items (nama_item, deskripsi, gambar, tipe_item) VALUES 
('Sidebar Navigation', 'Navigasi pindah antar room.', 'fa-columns', 'ui'),
('Rich Text Note', 'Catatan layaknya MS Word (CKEditor).', 'fa-file-word', 'input'),
('Code Editor', 'Penulisan kode ala Sublime/VS Code.', 'fa-code', 'input'),
('AI Assistant', 'Gemini 2.5 Flash All-in-one.', 'fa-robot', 'api'),
('Output Field & Explorer', 'Layar penampil hasil & File Explorer.', 'fa-folder-open', 'output'),
('Upload File', 'Upload dan deteksi otomatis file.', 'fa-cloud-upload-alt', 'input'),
('Interactive Calendar', 'Kalender akademik custom CSS.', 'fa-calendar-alt', 'tools'),
('Sticky Notes', 'Catatan darurat melayang.', 'fa-sticky-note', 'input'),
('Concept Mapper', 'Kanvas relasi konsep & silogisme.', 'fa-project-diagram', 'tools'),
('Settings', 'Pengaturan UI dan Grid alternatif.', 'fa-cog', 'ui'),
('Activity Tracker', 'Grafik interpretasi data aktivitas.', 'fa-chart-line', 'tools'),
('Interactive Whiteboard', 'Kanvas coretan bebas.', 'fa-chalkboard', 'input'),
('To-Do List', 'Daftar tugas dengan tanggal, jam, dan checkbox.', 'fa-tasks', 'input'),
('Timer', 'Penghitung waktu fokus.', 'fa-hourglass-half', 'tools'),
('Flashcard', 'Kartu hafalan dengan tombol Next/Prev.', 'fa-clone', 'output'),
('Voice Memo Recorder', 'Perekam suara instan via mic.', 'fa-microphone', 'input');