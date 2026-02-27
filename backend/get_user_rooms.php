<?php
// backend/get_user_rooms.php
session_start();
require '../koneksi.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit;
}

$user_id = $_SESSION['user_id'];

// Prevent SQL Injection
$user_id = $conn->real_escape_string($user_id);

$query = "SELECT id, nama_room, created_at FROM rooms WHERE user_id = '$user_id' ORDER BY created_at DESC";
$result = $conn->query($query);

$rooms = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $rooms[] = $row;
    }
    echo json_encode(['status' => 'success', 'data' => $rooms]);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Failed to fetch rooms']);
}

$conn->close();
?>