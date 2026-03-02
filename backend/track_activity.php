<?php
session_start();
require '../koneksi.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$type = $input['type'] ?? 'unknown';
$detail = $input['detail'] ?? '';
$user_id = $_SESSION['user_id'];
$room_id = $_SESSION['active_room_id'] ?? null;
$ip = $_SERVER['REMOTE_ADDR'];

// Check if room_id column exists
$checkColumn = $conn->query("SHOW COLUMNS FROM transactions LIKE 'room_id'");
if ($checkColumn->num_rows > 0) {
    $stmt = $conn->prepare("INSERT INTO transactions (user_id, room_id, jenis_aktivitas, detail_aktivitas, ip_address) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("iisss", $user_id, $room_id, $type, $detail, $ip);
} else {
    // If we're filtering by text fallback in get_activity.php, we append room info to detail if not present
    if ($room_id && strpos($detail, "Room $room_id") === false) {
        $detail .= " (Room $room_id)";
    }
    $stmt = $conn->prepare("INSERT INTO transactions (user_id, jenis_aktivitas, detail_aktivitas, ip_address) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("isss", $user_id, $type, $detail, $ip);
}

if ($stmt->execute()) {
    echo json_encode(['status' => 'success']);
} else {
    echo json_encode(['status' => 'error', 'message' => $conn->error]);
}

$conn->close();
?>