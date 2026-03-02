-- Update Flashcard description to reflect the new Google Form-style functionality
UPDATE master_items
SET deskripsi = 'Kartu hafalan interaktif dengan editor ala Google Form, mendukung gambar dan kustomisasi set.'
WHERE nama_item = 'Flashcard';
