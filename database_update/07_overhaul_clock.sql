-- Update Timer to Clock and update description
UPDATE master_items
SET nama_item = 'Clock',
    deskripsi = 'Widget jam multifungsi: Jam Live, Timer (hitung mundur), dan Stopwatch.',
    gambar = 'fa-clock'
WHERE nama_item = 'Timer';
