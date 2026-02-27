<?php
// backend/admin_api.php
session_start();
require '../koneksi.php';

header('Content-Type: application/json');

// Check admin authorization
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized access']);
    exit;
}

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'get_users':
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 25;
        $offset = ($page - 1) * $limit;

        $total_query = "SELECT COUNT(*) as total FROM users";
        $total_res = $conn->query($total_query);
        $total_row = $total_res->fetch_assoc();
        $total = $total_row['total'];

        $query = "SELECT id, username, role, created_at FROM users LIMIT $limit OFFSET $offset";
        $result = $conn->query($query);

        $users = [];
        while($row = $result->fetch_assoc()) {
            $users[] = $row;
        }

        echo json_encode([
            'status' => 'success',
            'data' => $users,
            'pagination' => [
                'current_page' => $page,
                'total_pages' => ceil($total / $limit),
                'total_records' => $total
            ]
        ]);
        break;

    case 'get_transactions':
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 25;
        $offset = ($page - 1) * $limit;

        $total_query = "SELECT COUNT(*) as total FROM transactions";
        $total_res = $conn->query($total_query);
        $total_row = $total_res->fetch_assoc();
        $total = $total_row['total'];

        $query = "SELECT t.*, u.username FROM transactions t LEFT JOIN users u ON t.user_id = u.id ORDER BY t.waktu_transaksi DESC LIMIT $limit OFFSET $offset";
        $result = $conn->query($query);

        $transactions = [];
        while($row = $result->fetch_assoc()) {
            $transactions[] = $row;
        }

        echo json_encode([
            'status' => 'success',
            'data' => $transactions,
            'pagination' => [
                'current_page' => $page,
                'total_pages' => ceil($total / $limit),
                'total_records' => $total
            ]
        ]);
        break;

    case 'get_items':
        $query = "SELECT * FROM master_items";
        $result = $conn->query($query);
        $items = [];
        while($row = $result->fetch_assoc()) {
            $items[] = $row;
        }
        echo json_encode(['status' => 'success', 'data' => $items]);
        break;

    case 'create_item':
        // Handle Create Item
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data) {
             $data = $_POST; // Fallback to POST if not JSON
        }

        $nama = $conn->real_escape_string($data['nama_item']);
        $deskripsi = $conn->real_escape_string($data['deskripsi']);
        $tipe = $conn->real_escape_string($data['tipe_item']);
        // For simplicity, we might just use a default icon string if not provided
        $gambar = $conn->real_escape_string($data['gambar'] ?? 'fa-cube');

        $sql = "INSERT INTO master_items (nama_item, deskripsi, tipe_item, gambar) VALUES ('$nama', '$deskripsi', '$tipe', '$gambar')";

        if($conn->query($sql)) {
            echo json_encode(['status' => 'success', 'message' => 'Item created']);
        } else {
            echo json_encode(['status' => 'error', 'message' => $conn->error]);
        }
        break;

    case 'update_item':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data) {
             $data = $_POST;
        }

        $id = (int)$data['id'];
        $nama = $conn->real_escape_string($data['nama_item']);
        $deskripsi = $conn->real_escape_string($data['deskripsi']);
        $tipe = $conn->real_escape_string($data['tipe_item']);
        $gambar = $conn->real_escape_string($data['gambar']);

        $sql = "UPDATE master_items SET nama_item='$nama', deskripsi='$deskripsi', tipe_item='$tipe', gambar='$gambar' WHERE id=$id";

        if($conn->query($sql)) {
            echo json_encode(['status' => 'success', 'message' => 'Item updated']);
        } else {
            echo json_encode(['status' => 'error', 'message' => $conn->error]);
        }
        break;

    case 'delete_item':
        $id = (int)$_GET['id'];
        $sql = "DELETE FROM master_items WHERE id=$id";
        if($conn->query($sql)) {
            echo json_encode(['status' => 'success', 'message' => 'Item deleted']);
        } else {
            echo json_encode(['status' => 'error', 'message' => $conn->error]);
        }
        break;

    default:
        echo json_encode(['status' => 'error', 'message' => 'Invalid action']);
        break;
}

$conn->close();
?>