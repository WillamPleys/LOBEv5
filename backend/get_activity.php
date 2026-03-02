<?php
session_start();
require '../koneksi.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit;
}

$user_id = $_SESSION['user_id'];
$room_id = isset($_GET['room_id']) ? $_GET['room_id'] : null;
$scope = isset($_GET['scope']) ? $_GET['scope'] : 'all';

$whereClause = "WHERE user_id = ?";
$params = [$user_id];
$types = "i";

if ($scope === 'room' && $room_id) {
    // Check if room_id column exists
    $checkColumn = $conn->query("SHOW COLUMNS FROM transactions LIKE 'room_id'");
    if ($checkColumn->num_rows > 0) {
        $whereClause .= " AND room_id = ?";
        $params[] = $room_id;
        $types .= "i";
    } else {
        // Fallback: search for room ID in detail_aktivitas if column doesn't exist
        $whereClause .= " AND detail_aktivitas LIKE ?";
        $params[] = "%Room $room_id%";
        $types .= "s";
    }
}

// Get recent activity list
$stmtList = $conn->prepare("SELECT jenis_aktivitas, detail_aktivitas, waktu_transaksi FROM transactions $whereClause ORDER BY waktu_transaksi DESC LIMIT 20");
$stmtList->bind_param($types, ...$params);
$stmtList->execute();
$listRes = $stmtList->get_result();
$list = [];
while($row = $listRes->fetch_assoc()) {
    $list[] = $row;
}

// Get activity counts by day for chart
$stmtChart = $conn->prepare("SELECT DATE(waktu_transaksi) as date, COUNT(*) as count FROM transactions $whereClause GROUP BY DATE(waktu_transaksi) ORDER BY date DESC LIMIT 7");
$stmtChart->bind_param($types, ...$params);
$stmtChart->execute();
$chartRes = $stmtChart->get_result();
$chart = [];
while($row = $chartRes->fetch_assoc()) {
    $chart[] = $row;
}

echo json_encode([
    'status' => 'success',
    'list' => $list,
    'chart' => array_reverse($chart),
    'scope' => $scope
]);

$conn->close();
?>