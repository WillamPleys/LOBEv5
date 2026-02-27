<?php
session_start();
require '../koneksi.php';

header('Content-Type: application/json');

// Pastikan user sudah login
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Akses ditolak. Silakan login terlebih dahulu.']);
    exit;
}

$room_name = $_POST['room_name'] ?? 'Ruang Kosong';

// Limit Room Name Length to 50 Characters
if (strlen($room_name) > 50) {
    echo json_encode(['status' => 'error', 'message' => 'Nama room terlalu panjang (maksimal 50 karakter).']);
    exit;
}

$room_name = $conn->real_escape_string($room_name);
$user_id = $_SESSION['user_id'];
$ip = $_SERVER['REMOTE_ADDR'];

// Simpan room ke database
$query = "INSERT INTO rooms (user_id, nama_room) VALUES ('$user_id', '$room_name')";
if ($conn->query($query)) {
    $room_id = $conn->insert_id;
    
    // Set Current Active Room in Session
    $_SESSION['active_room_id'] = $room_id;
    $_SESSION['active_room_name'] = $room_name;

    // Log transaksi aktivitas
    $detail = "Membuat room baru bernama: $room_name";
    $conn->query("INSERT INTO transactions (user_id, jenis_aktivitas, detail_aktivitas, ip_address) VALUES ('$user_id', 'Create Room', '$detail', '$ip')");

    echo json_encode(['status' => 'success', 'room_id' => $room_id, 'room_name' => $room_name]);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Gagal membuat room.']);
}
$conn->close();
?>