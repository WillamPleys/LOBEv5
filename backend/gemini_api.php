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
$mode = $input['mode'] ?? 'chatbot';
$fileBase64 = $input['file']['data'] ?? null;
$fileMime = $input['file']['mimeType'] ?? null;

if (empty($userMessage) && empty($fileBase64)) {
    echo json_encode(['error' => ['message' => 'Pesan atau file tidak boleh kosong']]);
    exit;
}

// ==========================================
// GANTI STRING DI BAWAH DENGAN API KEY ANDA
// ==========================================
$apiKey = 'YOUR_GEMINI_API_KEY_HERE';

// Endpoint API Gemini 2.5 Flash
$url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' . $apiKey;

// Instruksi tambahan berdasarkan mode (sesuai spesifikasi AGENTS.md)
$systemInstruction = "";
if ($mode == 'transcript') {
    $systemInstruction = "You are a highly accurate transcriber. Your task is to convert any provided audio file or text into a clear, perfectly formatted transcript. Focus on capturing spoken words accurately and ignore filler words if appropriate. Only provide the transcript itself without conversational filler.";
} else if ($mode == 'summary') {
    $systemInstruction = "You are a professional summarizer. Analyze the provided file or text carefully and create a concise, structured summary that highlights the most important key points. Use bullet points for readability and ensure the tone is professional.";
} else if ($mode == 'note') {
    $systemInstruction = "You are an expert note-taker. Your goal is to transform the provided information into beautifully structured notes. Use hierarchy (headings, sub-headings) and bullet points. Make it ready to be studied.";
} else if ($mode == 'coding') {
    $systemInstruction = "You are a senior full-stack coding agent. Provide clean, optimized, and working code snippets based on the user's request. Include brief technical explanations only when necessary. Always format code using markdown blocks with the correct language tag.";
} else {
    $systemInstruction = "You are LOBE AI Assistant, a helpful and creative companion. You can process text and files to help the user with any task.";
}

// Struktur payload sesuai dokumentasi Gemini API
$parts = [];

if ($fileBase64 && $fileMime) {
    $parts[] = [
        "inlineData" => [
            "mimeType" => $fileMime,
            "data" => $fileBase64
        ]
    ];
}

if (!empty($userMessage)) {
    $parts[] = ["text" => $userMessage];
} else if (!empty($fileBase64)) {
    $parts[] = ["text" => "Tolong proses file ini berdasarkan mode Anda."];
}

$payloadData = [
    "contents" => [
        [
            "parts" => $parts
        ]
    ]
];

if (!empty($systemInstruction)) {
    $payloadData["systemInstruction"] = [
        "parts" => [
            ["text" => $systemInstruction]
        ]
    ];
}

$payload = json_encode($payloadData);

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