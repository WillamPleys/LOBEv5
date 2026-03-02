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
        $username = $conn->real_escape_string($_GET['username'] ?? '');
        $uId = null;
        if ($username) {
            $uRes = $conn->query("SELECT id FROM users WHERE username = '$username'");
            if ($uRes && $uRes->num_rows > 0) {
                $uId = $uRes->fetch_assoc()['id'];
            }
        }

        // 1. Basic Counts
        $total_users = $conn->query("SELECT COUNT(*) as c FROM users")->fetch_assoc()['c'];
        $total_premium = $conn->query("SELECT COUNT(*) as c FROM users WHERE premium_until > NOW()")->fetch_assoc()['c'];

        $room_where = $uId ? "WHERE user_id = $uId" : "";
        $total_rooms = $conn->query("SELECT COUNT(*) as c FROM rooms $room_where")->fetch_assoc()['c'];

        // 2. Activity Trends (Last 7 days)
        $chart_data = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = date('Y-m-d', strtotime("-$i days"));
            $act_where = $uId ? "AND user_id = $uId" : "";
            $count = $conn->query("SELECT COUNT(*) as c FROM transactions WHERE DATE(waktu_transaksi) = '$date' $act_where")->fetch_assoc()['c'];
            $chart_data[] = ['date' => $date, 'count' => (int)$count];
        }

        // 3. Widget Instance Counts
        $widget_where = $uId ? "WHERE r.user_id = $uId" : "";
        $popular = [];
        // JOIN with rooms to filter by user if needed
        $res = $conn->query("SELECT mi.nama_item, COUNT(rw.id) as count FROM room_widgets rw JOIN master_items mi ON rw.master_item_id = mi.id JOIN rooms r ON rw.room_id = r.id $widget_where GROUP BY mi.id ORDER BY count DESC");
        while($row = $res->fetch_assoc()) {
            $popular[] = $row;
        }

        echo json_encode([
            'status' => 'success',
            'scope' => $uId ? $username : 'GLOBAL',
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
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
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

        // Prevent granting premium to admin accounts
        $check = $conn->query("SELECT role FROM users WHERE id = $uId")->fetch_assoc();
        if ($check && $check['role'] === 'admin') {
            echo json_encode(['status' => 'error', 'message' => 'Admin accounts cannot be given premium.']);
            exit;
        }

        $expiry = null;
        if ($days > 0) {
            $expiry = date('Y-m-d H:i:s', strtotime("+$days days"));
        } elseif ($days === -1) {
            $expiry = '2099-12-31 23:59:59';
        }

        $stmt = $conn->prepare("UPDATE users SET premium_until = ? WHERE id = ?");
        $stmt->bind_param("si", $expiry, $uId);

        if ($stmt->execute()) {
            // Also log this transaction
            $username_res = $conn->query("SELECT username FROM users WHERE id = $uId")->fetch_assoc();
            $target_user = $username_res['username'] ?? 'Unknown';
            $ip = $_SERVER['REMOTE_ADDR'];
            $detail = "Admin updated premium status for user $target_user until " . ($expiry ?? 'removed');
            $conn->query("INSERT INTO transactions (user_id, jenis_aktivitas, detail_aktivitas, ip_address) VALUES ({$_SESSION['user_id']}, 'Update Premium', '$detail', '$ip')");

            echo json_encode(['status' => 'success', 'message' => 'Premium status updated', 'expiry' => $expiry]);
        } else {
            echo json_encode(['status' => 'error', 'message' => $conn->error]);
        }
        break;

    case 'get_transactions':
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
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
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
        $offset = ($page - 1) * $limit;

        $total_query = "SELECT COUNT(*) as total FROM master_items";
        $total_res = $conn->query($total_query);
        $total = $total_res->fetch_assoc()['total'];

        $query = "SELECT * FROM master_items ORDER BY tipe_item, nama_item LIMIT $limit OFFSET $offset";
        $result = $conn->query($query);
        $items = [];
        while($row = $result->fetch_assoc()) {
            $items[] = $row;
        }
        echo json_encode([
            'status' => 'success',
            'data' => $items,
            'pagination' => [
                'current_page' => $page,
                'total_pages' => ceil($total / $limit),
                'total_records' => $total
            ]
        ]);
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