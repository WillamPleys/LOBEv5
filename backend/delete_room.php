<?php
session_start();
require '../koneksi.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit;
}

$room_id = $_POST['room_id'] ?? null;
$user_id = $_SESSION['user_id'];

if (!$room_id) {
    echo json_encode(['status' => 'error', 'message' => 'Room ID required']);
    exit;
}

// 1. Check ownership
$check = $conn->query("SELECT id, nama_room FROM rooms WHERE id = '$room_id' AND user_id = '$user_id'");
if ($check->num_rows === 0) {
    echo json_encode(['status' => 'error', 'message' => 'Room not found or access denied']);
    exit;
}

// 2. Prevent deleting the last room?
// User request: "jika hanya ada 1 room maka user dilarang menghapus".
$count_query = $conn->query("SELECT COUNT(*) as total FROM rooms WHERE user_id = '$user_id'");
$count = $count_query->fetch_assoc()['total'];

if ($count <= 1) {
    echo json_encode(['status' => 'error', 'message' => 'Cannot delete the last room.']);
    exit;
}

// 3. Delete related widgets first (though foreign key cascade might handle it, let's be safe)
$conn->query("DELETE FROM room_widgets WHERE room_id = '$room_id'");

// 4. Delete the room
if ($conn->query("DELETE FROM rooms WHERE id = '$room_id'")) {

    // Check if the deleted room was the active one
    $isActiveDeleted = isset($_SESSION['active_room_id']) && $_SESSION['active_room_id'] == $room_id;

    $new_room = null;
    if ($isActiveDeleted) {
        // Switch to the most recent room
        $new_room_q = $conn->query("SELECT id, nama_room FROM rooms WHERE user_id = '$user_id' ORDER BY created_at DESC LIMIT 1");
        if($new_room_q->num_rows > 0) {
            $new_room = $new_room_q->fetch_assoc();
            $_SESSION['active_room_id'] = $new_room['id'];
            $_SESSION['active_room_name'] = $new_room['nama_room'];
        }
    }

    // Log transaction
    $ip = $_SERVER['REMOTE_ADDR'];
    $detail = "Deleted room ID $room_id";
    $conn->query("INSERT INTO transactions (user_id, jenis_aktivitas, detail_aktivitas, ip_address) VALUES ('$user_id', 'Delete Room', '$detail', '$ip')");

    echo json_encode([
        'status' => 'success',
        'switched_to' => $new_room // Will be null if we didn't switch
    ]);

} else {
    echo json_encode(['status' => 'error', 'message' => 'Database error']);
}
$conn->close();
?>