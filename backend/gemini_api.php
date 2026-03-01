<?php
session_start();
header('Content-Type: application/json');

// Keamanan: pastikan user sudah login
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => ['message' => 'Unauthorized']]);
    exit;
}

// Terima payload dari frontend
$input = json_decode(file_get_contents('php://input'), true);
$userMessage = $input['message'] ?? '';

if (empty($userMessage)) {
    echo json_encode(['error' => ['message' => 'Pesan tidak boleh kosong']]);
    exit;
}

// ==========================================
// GANTI STRING DI BAWAH DENGAN API KEY ANDA
// ==========================================
$apiKey = 'YOUR_GEMINI_API_KEY_HERE';

// Endpoint API Gemini 2.5 Flash
$url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' . $apiKey;

// Struktur payload sesuai dokumentasi Gemini API
$payload = json_encode([
    "contents" => [
        [
            "parts" => [
                ["text" => $userMessage]
            ]
        ]
    ]
]);

// Gunakan cURL untuk mengirim request HTTP POST ke server Google
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curl_error = curl_error($ch);
curl_close($ch);

if ($response === false) {
    echo json_encode(['error' => ['message' => 'cURL Error: ' . $curl_error]]);
    exit;
}

// Teruskan respon dari Google Gemini ke frontend (sudah dalam format JSON)
echo $response;
?>