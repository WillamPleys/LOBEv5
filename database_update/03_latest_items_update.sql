USE lobe_v5_db;

-- 1. Pastikan tabel room_widgets sudah ada untuk menampung data 16 fitur
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

-- 2. Update Master Items dengan Ikon yang disesuaikan
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE master_items;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO master_items (nama_item, deskripsi, gambar, tipe_item) VALUES 
('Sidebar Navigation', 'Navigasi pindah antar room.', 'fa-indent', 'ui'),
('Rich Text Note', 'Catatan layaknya MS Word (CKEditor).', 'fa-file-signature', 'input'),
('Code Editor', 'Penulisan kode ala Sublime/VS Code.', 'fa-terminal', 'input'),
('AI Assistant', 'Gemini 2.5 Flash All-in-one.', 'fa-brain', 'api'),
('Output Field & Explorer', 'Layar penampil hasil & File Explorer.', 'fa-folder-tree', 'output'),
('Upload File', 'Upload dan deteksi otomatis file.', 'fa-file-upload', 'input'),
('Interactive Calendar', 'Kalender akademik custom CSS.', 'fa-calendar-check', 'tools'),
('Sticky Notes', 'Catatan darurat melayang.', 'fa-note-sticky', 'input'),
('Concept Mapper', 'Kanvas relasi konsep & silogisme.', 'fa-sitemap', 'tools'),
('Settings', 'Pengaturan UI dan Grid alternatif.', 'fa-sliders', 'ui'),
('Activity Tracker', 'Grafik interpretasi data aktivitas.', 'fa-chart-pie', 'tools'),
('Interactive Whiteboard', 'Kanvas coretan bebas.', 'fa-paint-brush', 'input'),
('To-Do List', 'Daftar tugas dengan tanggal, jam, dan checkbox.', 'fa-list-check', 'input'),
('Timer', 'Penghitung waktu fokus.', 'fa-stopwatch', 'tools'),
('Flashcard', 'Kartu hafalan dengan tombol Next/Prev.', 'fa-layer-group', 'output'),
('Voice Memo Recorder', 'Perekam suara instan via mic.', 'fa-microphone-lines', 'input');