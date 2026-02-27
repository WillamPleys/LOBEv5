<?php
session_start();
require '../koneksi.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit;
}

$room_id = $_POST['room_id'] ?? null;
$room_name = $_POST['room_name'] ?? null;

if (!$room_id) {
    echo json_encode(['status' => 'error', 'message' => 'Room ID required']);
    exit;
}

// Verify ownership
$check = $conn->query("SELECT id, nama_room FROM rooms WHERE id = '$room_id' AND user_id = '{$_SESSION['user_id']}'");
if ($check->num_rows === 0) {
    echo json_encode(['status' => 'error', 'message' => 'Access denied']);
    exit;
}

// If name wasn't provided, fetch it
if (!$room_name) {
    $row = $check->fetch_assoc();
    $room_name = $row['nama_room'];
}

$_SESSION['active_room_id'] = $room_id;
$_SESSION['active_room_name'] = $room_name;

echo json_encode(['status' => 'success', 'room_id' => $room_id]);
$conn->close();
?>