<?php
require '../koneksi.php';

// Cek dan buat tabel migration_history jika belum ada
$conn->query("CREATE TABLE IF NOT EXISTS migration_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    migration_name VARCHAR(255) NOT NULL UNIQUE,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)");

// Cek apakah update ini sudah pernah dijalankan
$migration_name = '001_update_master_item_name_output_field.sql';
$check = $conn->query("SELECT id FROM migration_history WHERE migration_name = '$migration_name'");

if ($check && $check->num_rows > 0) {
    echo "Update $migration_name sudah pernah dijalankan.<br>";
} else {
    // Jalankan update: Ubah nama "Output Field & Explorer" menjadi "Output Field"
    $sql = "UPDATE master_items SET nama_item = 'Output Field' WHERE nama_item = 'Output Field & Explorer'";

    if ($conn->query($sql) === TRUE) {
        $conn->query("INSERT INTO migration_history (migration_name) VALUES ('$migration_name')");
        echo "Update $migration_name berhasil dijalankan!<br>";
    } else {
        echo "Error saat menjalankan update: " . $conn->error . "<br>";
    }
}

$conn->close();
?>
<a href="../index.php">Kembali ke aplikasi</a>