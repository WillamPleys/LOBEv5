<?php
// Salin berkas ini menjadi koneksi.php, lalu sesuaikan dengan kredensial MySQL kamu.
// koneksi.php sengaja tidak dilacak git agar kredensial tidak ikut ter-commit.

$host = "localhost";
$user = "root";
$pass = "";
$db   = "lobe_v5_db";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die(json_encode([
        "status" => "error",
        "message" => "Database connection failed: " . $conn->connect_error
    ]));
}
?>
