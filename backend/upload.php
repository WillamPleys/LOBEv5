<?php
// backend/upload.php
session_start();
header('Content-Type: application/json');

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['file'])) {
    $uploadDir = '../uploads/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    $file = $_FILES['file'];
    $fileType = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

    // Whitelist allowed extensions
    $allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'mp3', 'wav', 'txt'];

    if (!in_array($fileType, $allowedTypes)) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid file type. Allowed: ' . implode(', ', $allowedTypes)]);
        exit;
    }

    // Generate safe filename to prevent overwriting and directory traversal
    $fileName = time() . '_' . preg_replace('/[^a-zA-Z0-9_\-\.]/', '', basename($file['name']));
    $targetPath = $uploadDir . $fileName;

    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        echo json_encode([
            'status' => 'success',
            'message' => 'File uploaded successfully',
            'file_path' => 'uploads/' . $fileName,
            'original_name' => htmlspecialchars($file['name']), // Sanitize output
            'type' => $file['type']
        ]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Failed to move uploaded file']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'No file uploaded']);
}
?>