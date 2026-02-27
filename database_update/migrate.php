<?php
// koneksi khusus untuk migration
$host = "localhost";
$user = "root"; // Sesuaikan jika ada password db
$pass = "";
$db   = "lobe_v5_db";

$conn = new mysqli($host, $user, $pass);
if ($conn->connect_error) die("Koneksi gagal: " . $conn->connect_error);

// Buat database jika belum ada
$conn->query("CREATE DATABASE IF NOT EXISTS $db");
$conn->select_db($db);

// Buat tabel untuk mencatat versi migration agar tidak dijalankan 2 kali
$conn->query("CREATE TABLE IF NOT EXISTS migration_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)");

$files = glob("*.sql");
sort($files); // Pastikan berurutan (01_init, 02_update, dst)

foreach ($files as $file) {
    $check = $conn->query("SELECT id FROM migration_history WHERE filename = '$file'");
    if ($check->num_rows == 0) {
        $sql = file_get_contents($file);
        // Eksekusi multi query karena isi file SQL biasanya banyak baris
        if ($conn->multi_query($sql)) {
            do {
                if ($result = $conn->store_result()) {
                    $result->free();
                }
            } while ($conn->more_results() && $conn->next_result());
            
            // Catat ke history
            $conn->query("INSERT INTO migration_history (filename) VALUES ('$file')");
            echo "Berhasil update: $file <br>";
        } else {
            echo "Error pada $file: " . $conn->error . "<br>";
        }
    }
}
echo "Database up to date!";
$conn->close();
?>