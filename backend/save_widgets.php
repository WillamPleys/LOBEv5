<?php
session_start();
require '../koneksi.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit;
}

$room_id = $_SESSION['active_room_id'] ?? null;

if (!$room_id) {
    echo json_encode(['status' => 'error', 'message' => 'No active room']);
    exit;
}

// Check ownership
$check = $conn->query("SELECT id FROM rooms WHERE id = '$room_id' AND user_id = '{$_SESSION['user_id']}'");
if ($check->num_rows === 0) {
    echo json_encode(['status' => 'error', 'message' => 'Access denied']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$widgets = $input['widgets'] ?? [];

// Clear existing widgets for this room (Simple "Replace All" strategy for state sync)
// In a real prod app, you might want partial updates, but for this scale, this is robust.
$conn->query("DELETE FROM room_widgets WHERE room_id = '$room_id'");

if (!empty($widgets)) {
    $stmt = $conn->prepare("INSERT INTO room_widgets (room_id, widget_dom_id, master_item_id, pos_x, pos_y, width, height, content_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");

    foreach ($widgets as $w) {
        $data = json_encode($w['content_data'] ?? []); // Store internal state like text content
        $stmt->bind_param("isiiiiis",
            $room_id,
            $w['id'],
            $w['master_id'],
            $w['x'],
            $w['y'],
            $w['w'],
            $w['h'],
            $data
        );
        $stmt->execute();
    }
}

echo json_encode(['status' => 'success']);
$conn->close();
?>