<?php
session_start();
require '../koneksi.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit;
}

$user_id = $_SESSION['user_id'];
$plan = $_POST['plan'] ?? '';

if (!$plan) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid plan selected']);
    exit;
}

// Calculate expiration date
$now = time();
if ($plan === '1day') {
    $expire = date('Y-m-d H:i:s', strtotime('+1 day', $now));
} elseif ($plan === 'monthly') {
    $expire = date('Y-m-d H:i:s', strtotime('+1 month', $now));
} elseif ($plan === 'yearly') {
    $expire = date('Y-m-d H:i:s', strtotime('+1 year', $now));
} else {
    echo json_encode(['status' => 'error', 'message' => 'Unknown plan type']);
    exit;
}

$stmt = $conn->prepare("UPDATE users SET premium_until = ? WHERE id = ?");
$stmt->bind_param("si", $expire, $user_id);

if ($stmt->execute()) {
    echo json_encode(['status' => 'success', 'message' => 'Subscription successful!', 'premium_until' => $expire]);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Database update failed']);
}

$stmt->close();
$conn->close();
?>