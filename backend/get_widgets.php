<?php
session_start();
require '../koneksi.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || !isset($_SESSION['active_room_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'No active room or session']);
    exit;
}

$room_id = $_SESSION['active_room_id'];
$user_id = $_SESSION['user_id'];

// Verify access
$check = $conn->query("SELECT id FROM rooms WHERE id = '$room_id' AND user_id = '$user_id'");
if ($check->num_rows === 0) {
    echo json_encode(['status' => 'error', 'message' => 'Access denied']);
    exit;
}

// Fetch widgets
// Join with master_items to get the name/type for re-rendering
$query = "
    SELECT rw.*, mi.nama_item, mi.tipe_item
    FROM room_widgets rw
    JOIN master_items mi ON rw.master_item_id = mi.id
    WHERE rw.room_id = '$room_id'
";

$result = $conn->query($query);
$widgets = [];

while ($row = $result->fetch_assoc()) {
    $row['content_data'] = json_decode($row['content_data'], true);
    $widgets[] = $row;
}

echo json_encode(['status' => 'success', 'data' => $widgets]);
$conn->close();
?>