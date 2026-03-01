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
$ip = $_SERVER['REMOTE_ADDR'];

$stmt = $conn->prepare("INSERT INTO transactions (user_id, jenis_aktivitas, detail_aktivitas, ip_address) VALUES (?, ?, ?, ?)");
$stmt->bind_param("isss", $user_id, $type, $detail, $ip);

if ($stmt->execute()) {
    echo json_encode(['status' => 'success']);
} else {
    echo json_encode(['status' => 'error', 'message' => $conn->error]);
}

$conn->close();
?>