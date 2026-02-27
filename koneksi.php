<?php
$host = "localhost";
$user = "root"; 
$pass = "";
$db   = "lobe_v5_db";
$socket = "/tmp/mysqld/mysql.sock";

$conn = new mysqli($host, $user, $pass, $db, 3306, $socket);

if ($conn->connect_error) {
    die(json_encode([
        "status" => "error", 
        "message" => "Database connection failed: " . $conn->connect_error
    ]));
}
?>