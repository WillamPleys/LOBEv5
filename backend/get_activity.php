<?php
session_start();
require '../koneksi.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit;
}

$user_id = $_SESSION['user_id'];

// Get recent activity list
$listRes = $conn->query("SELECT jenis_aktivitas, detail_aktivitas, waktu_transaksi FROM transactions WHERE user_id = '$user_id' ORDER BY waktu_transaksi DESC LIMIT 20");
$list = [];
while($row = $listRes->fetch_assoc()) {
    $list[] = $row;
}

// Get activity counts by day for chart
$chartRes = $conn->query("SELECT DATE(waktu_transaksi) as date, COUNT(*) as count FROM transactions WHERE user_id = '$user_id' GROUP BY DATE(waktu_transaksi) ORDER BY date DESC LIMIT 7");
$chart = [];
while($row = $chartRes->fetch_assoc()) {
    $chart[] = $row;
}

echo json_encode([
    'status' => 'success',
    'list' => $list,
    'chart' => array_reverse($chart)
]);

$conn->close();
?>