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
    case 'get_dashboard_stats':
        // 1. Basic Counts
        $total_users = $conn->query("SELECT COUNT(*) as c FROM users")->fetch_assoc()['c'];
        $total_premium = $conn->query("SELECT COUNT(*) as c FROM users WHERE premium_until > NOW()")->fetch_assoc()['c'];
        $total_rooms = $conn->query("SELECT COUNT(*) as c FROM rooms")->fetch_assoc()['c'];

        // 2. Activity Trends (Last 7 days)
        $chart_data = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = date('Y-m-d', strtotime("-$i days"));
            $count = $conn->query("SELECT COUNT(*) as c FROM transactions WHERE DATE(waktu_transaksi) = '$date'")->fetch_assoc()['c'];
            $chart_data[] = ['date' => $date, 'count' => (int)$count];
        }

        // 3. Popular Widgets (based on room_widgets occurrences)
        $popular = [];
        $res = $conn->query("SELECT mi.nama_item, COUNT(rw.id) as count FROM room_widgets rw JOIN master_items mi ON rw.master_item_id = mi.id GROUP BY mi.id ORDER BY count DESC LIMIT 5");
        while($row = $res->fetch_assoc()) {
            $popular[] = $row;
        }

        echo json_encode([
            'status' => 'success',
            'metrics' => [
                'users' => $total_users,
                'premium' => $total_premium,
                'rooms' => $total_rooms
            ],
            'activity_chart' => $chart_data,
            'popular_widgets' => $popular
        ]);
        break;

    case 'get_users':
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 25;
        $search = $conn->real_escape_string($_GET['search'] ?? '');
        $offset = ($page - 1) * $limit;

        $where = $search ? "WHERE username LIKE '%$search%'" : "";

        $total_query = "SELECT COUNT(*) as total FROM users $where";
        $total_res = $conn->query($total_query);
        $total_row = $total_res->fetch_assoc();
        $total = $total_row['total'];

        $query = "SELECT id, username, role, premium_until, created_at FROM users $where ORDER BY id DESC LIMIT $limit OFFSET $offset";
        $result = $conn->query($query);

        $users = [];
        while($row = $result->fetch_assoc()) {
            $row['is_premium'] = ($row['premium_until'] && strtotime($row['premium_until']) > time());
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

    case 'update_user_premium':
        $data = json_decode(file_get_contents("php://input"), true);
        $uId = (int)$data['id'];
        $days = (int)$data['days']; // 0 for remove, -1 for permanent (far future)

        $expiry = null;
        if ($days > 0) {
            $expiry = date('Y-m-d H:i:s', strtotime("+$days days"));
        } elseif ($days === -1) {
            $expiry = '2099-12-31 23:59:59';
        }

        $stmt = $conn->prepare("UPDATE users SET premium_until = ? WHERE id = ?");
        $stmt->bind_param("si", $expiry, $uId);

        if ($stmt->execute()) {
            echo json_encode(['status' => 'success', 'message' => 'Premium status updated']);
        } else {
            echo json_encode(['status' => 'error', 'message' => $conn->error]);
        }
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
        $query = "SELECT * FROM master_items ORDER BY tipe_item, nama_item";
        $result = $conn->query($query);
        $items = [];
        while($row = $result->fetch_assoc()) {
            $items[] = $row;
        }
        echo json_encode(['status' => 'success', 'data' => $items]);
        break;

    case 'toggle_item_status':
        $id = (int)$_GET['id'];
        $status = (int)$_GET['status']; // 1 or 0
        $conn->query("UPDATE master_items SET is_active = $status WHERE id = $id");
        echo json_encode(['status' => 'success']);
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