<?php
$host = "localhost";
$user = "root"; 
$pass = "";
$db   = "lobe_v5_db";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die(json_encode([
        "status" => "error", 
        "message" => "Database connection failed: " . $conn->connect_error
    ]));
}
?>