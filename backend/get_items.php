<?php
session_start();
require '../koneksi.php';

header('Content-Type: application/json');

// Ambil semua item yang aktif dari tabel master_items
$query = "SELECT * FROM master_items WHERE is_active = 1";
$result = $conn->query($query);

$items = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $items[] = $row;
    }
}

echo json_encode([
    'status' => 'success',
    'data' => $items
]);

$conn->close();
?>