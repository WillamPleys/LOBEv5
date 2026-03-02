<?php
session_start();
require '../koneksi.php';

header('Content-Type: application/json');

// Tangkap action untuk membedakan Login dan Register
$action = $_POST['action'] ?? ''; 
$username = $_POST['username'] ?? '';
$password = $_POST['password'] ?? '';

if (empty($username) || empty($password) || empty($action)) {
    echo json_encode(['status' => 'error', 'message' => 'Data tidak lengkap.']);
    exit;
}

$username = $conn->real_escape_string($username);
$password = $conn->real_escape_string($password);
$ip = $_SERVER['REMOTE_ADDR'];

$query = "SELECT * FROM users WHERE username = '$username'";
$result = $conn->query($query);

// JIKA KLIK TOMBOL LOGIN
if ($action === 'login') {
    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        if ($user['password'] === $password) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['role'] = $user['role'];
            $_SESSION['username'] = $user['username'];

            // Log Transaction
            $detail = "User {$user['username']} berhasil login.";
            $conn->query("INSERT INTO transactions (user_id, jenis_aktivitas, detail_aktivitas, ip_address) VALUES ('{$user['id']}', 'Login', '$detail', '$ip')");

            // ENSURE ADMIN HAS ADMIN PANEL ROOM
            if ($user['role'] === 'admin') {
                $check_admin_room = $conn->query("SELECT id FROM rooms WHERE user_id = '{$user['id']}' AND nama_room = 'Admin Panel'");
                if ($check_admin_room->num_rows === 0) {
                    $conn->query("INSERT INTO rooms (user_id, nama_room) VALUES ('{$user['id']}', 'Admin Panel')");
                }
            }

            // CHECK IF USER HAS EXISTING ROOMS (excluding Admin Panel for redirect logic)
            $room_check = $conn->query("SELECT id, nama_room FROM rooms WHERE user_id = '{$user['id']}' AND nama_room != 'Admin Panel' ORDER BY created_at DESC LIMIT 1");
            $existing_room = null;
            if ($room_check && $room_check->num_rows > 0) {
                $existing_room = $room_check->fetch_assoc();
                $_SESSION['active_room_id'] = $existing_room['id'];
                $_SESSION['active_room_name'] = $existing_room['nama_room'];
            } else {
                // If only Admin Panel exists, set it as active but keep existing_room null to trigger redirect
                if ($user['role'] === 'admin') {
                    $admin_room_res = $conn->query("SELECT id, nama_room FROM rooms WHERE user_id = '{$user['id']}' AND nama_room = 'Admin Panel' LIMIT 1");
                    if ($admin_room_res && $admin_room_res->num_rows > 0) {
                        $admin_room = $admin_room_res->fetch_assoc();
                        $_SESSION['active_room_id'] = $admin_room['id'];
                        $_SESSION['active_room_name'] = $admin_room['nama_room'];
                    }
                }
            }

            // Special check for admin redirect: if admin and no "real" workspace rooms exist
            $redirect_url = null;
            if ($user['role'] === 'admin' && !$existing_room) {
                $redirect_url = 'admin.php';
            }

            echo json_encode([
                'status' => 'success',
                'role' => $user['role'],
                'message' => 'Login berhasil.',
                'active_room' => $existing_room,
                'redirect_url' => $redirect_url
            ]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Password salah.']);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Akun tidak ditemukan. Silakan daftar.']);
    }
} 
// JIKA KLIK TOMBOL REGISTER
elseif ($action === 'register') {
    if ($result->num_rows > 0) {
        echo json_encode(['status' => 'error', 'message' => 'Username sudah terpakai.']);
    } else {
        if ($username === 'admin') {
            echo json_encode(['status' => 'error', 'message' => 'Username admin tidak diizinkan untuk daftar.']);
            exit;
        }
        $insert = "INSERT INTO users (username, password, role) VALUES ('$username', '$password', 'user')";
        if ($conn->query($insert)) {
            $new_id = $conn->insert_id;
            
            $detail = "User baru {$username} mendaftar ke sistem.";
            $conn->query("INSERT INTO transactions (user_id, jenis_aktivitas, detail_aktivitas, ip_address) VALUES ('$new_id', 'Register', '$detail', '$ip')");

            echo json_encode(['status' => 'success', 'message' => 'Akun berhasil dibuat! Silakan Login.']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Gagal mendaftar user.']);
        }
    }
}
$conn->close();
?>