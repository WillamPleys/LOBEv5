<?php
// backend/delete_file.php
session_start();
header('Content-Type: application/json');

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['file_path'])) {
    $filePath = $data['file_path'];

    // Security: Prevent directory traversal
    $baseUploadDir = realpath('../uploads/') . DIRECTORY_SEPARATOR;
    $targetPath = realpath('../' . $filePath);

    if ($targetPath && strpos($targetPath, $baseUploadDir) === 0 && file_exists($targetPath)) {
        if (unlink($targetPath)) {
            echo json_encode(['status' => 'success', 'message' => 'File deleted successfully']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Failed to delete file from server']);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'File not found or invalid path']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'No file path provided']);
}
?>