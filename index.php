<?php
session_start();
$isLoggedIn = isset($_SESSION['user_id']) ? 'true' : 'false';
$username = isset($_SESSION['username']) ? $_SESSION['username'] : 'Guest';
$role = isset($_SESSION['role']) ? $_SESSION['role'] : 'user';
$isPremium = false;

if (isset($_SESSION['user_id'])) {
    require 'koneksi.php';
    $uId = $_SESSION['user_id'];
    $stmt = $conn->prepare("SELECT premium_until FROM users WHERE id = ?");
    $stmt->bind_param("i", $uId);
    $stmt->execute();
    $res = $stmt->get_result();
    if ($row = $res->fetch_assoc()) {
        if ($row['premium_until'] && strtotime($row['premium_until']) > time()) {
            $isPremium = true;
        }
    }
}

$activeRoomId = isset($_SESSION['active_room_id']) ? $_SESSION['active_room_id'] : 'null';
$activeRoomName = isset($_SESSION['active_room_name']) ? $_SESSION['active_room_name'] : '';
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LOBE - Design Your Needs</title>
    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <!-- CSS -->
    <link rel="stylesheet" href="https://code.jquery.com/ui/1.13.2/themes/base/jquery-ui.css">
    <link rel="stylesheet" href="assets/css/style.css">
    <!-- Libraries -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://code.jquery.com/ui/1.13.2/jquery-ui.min.js"></script>
    <script src="https://cdn.ckeditor.com/ckeditor5/39.0.1/classic/ckeditor.js"></script> <!-- CKEditor -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.12/ace.js"></script> <!-- Ace Editor -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script> <!-- Chart.js -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js"></script> <!-- Mammoth.js for .docx -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script> <!-- html2canvas for exports -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js"></script> <!-- Fabric.js for Concept Mapper -->

    <script>
        const APP_IS_LOGGED_IN = <?php echo $isLoggedIn; ?>;
        const APP_USERNAME = "<?php echo htmlspecialchars($username); ?>";
        const INITIAL_STATE = {
            isLoggedIn: APP_IS_LOGGED_IN,
            username: APP_USERNAME,
            role: "<?php echo $role; ?>",
            isPremium: <?php echo $isPremium ? 'true' : 'false'; ?>,
            activeRoomId: <?php echo $activeRoomId; ?>,
            activeRoomName: "<?php echo htmlspecialchars($activeRoomName); ?>"
        };
    </script>
</head>
<body>

    <!-- ADVERTISEMENT NOTIFICATION (TOAST) -->
    <div id="ad-notification" style="cursor: pointer;">
        <div class="ad-toast">
            <div class="ad-header">
                <span><i class="fas fa-crown"></i> LOBE Premium</span>
                <span class="ad-close" onclick="event.stopPropagation(); $('#ad-notification').fadeOut()">&times;</span>
            </div>
            <div class="ad-body">
                <p>Unlock exclusive features with LOBE Premium! <br><strong>Subscribe now to unlock all modes!</strong></p>
                <button class="btn btn-primary" style="margin-top:10px; font-size:0.8rem; padding:5px; pointer-events:none;">View Plans</button>
            </div>
        </div>
    </div>

    <!-- PREMIUM SUBSCRIPTION MODAL -->
    <div id="premium-modal" class="modal-overlay" style="display: none; z-index: 21000;">
        <div class="windows-style" style="width: 450px;">
            <div class="modal-header">
                <span><i class="fas fa-crown"></i> Upgrade to LOBE Premium</span>
                <button class="close-btn" onclick="$('#premium-modal').hide()">&times;</button>
            </div>
            <div class="modal-body" style="gap: 10px;">
                <p style="text-align:center; color:#666; font-size:0.9rem; margin-bottom:10px;">Choose a plan that fits your needs.</p>

                <div class="premium-plan" onclick="window.subscribePremium('1day')" style="border: 1px solid #ddd; padding: 15px; border-radius: 8px; cursor: pointer; transition: 0.3s; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h4 style="margin:0;">1 Day Pass</h4>
                        <small style="color:#888;">Trial all features for 24 hours.</small>
                    </div>
                    <div style="font-weight:900; color:#28a745;">$0.99</div>
                </div>

                <div class="premium-plan" onclick="window.subscribePremium('monthly')" style="border: 1px solid #ddd; padding: 15px; border-radius: 8px; cursor: pointer; transition: 0.3s; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h4 style="margin:0;">Monthly Pro</h4>
                        <small style="color:#888;">Full access for 30 days.</small>
                    </div>
                    <div style="font-weight:900; color:#28a745;">$9.99</div>
                </div>

                <div class="premium-plan" onclick="window.subscribePremium('yearly')" style="border: 1px solid #673ab7; background: #f3e5f5; padding: 15px; border-radius: 8px; cursor: pointer; transition: 0.3s; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h4 style="margin:0; color:#673ab7;">Yearly Elite <span style="font-size:0.6rem; background:#673ab7; color:white; padding:2px 5px; border-radius:10px; margin-left:5px;">BEST VALUE</span></h4>
                        <small style="color:#888;">Full access for 365 days.</small>
                    </div>
                    <div style="font-weight:900; color:#28a745;">$79.99</div>
                </div>

                <button class="btn btn-secondary" onclick="$('#premium-modal').hide()" style="margin-top:10px;">Maybe Later</button>
            </div>
        </div>
    </div>

    <!-- FILE OPENER MODAL -->
    <div id="file-opener-modal" class="modal-overlay" style="display: none; z-index: 9999;">
        <div class="windows-style" style="width: 80%; max-width: 800px; height: 80vh; display: flex; flex-direction: column;">
            <div class="modal-header" style="cursor: move;" id="file-opener-header">
                <span id="file-opener-title">File Viewer</span>
                <button class="close-btn" onclick="$('#file-opener-modal').hide()">&times;</button>
            </div>
            <div class="modal-body" id="file-opener-content" style="flex: 1; overflow: auto; padding: 0; background: #fff; display: flex; flex-direction: column;">
                <!-- Content loaded here -->
            </div>
        </div>
    </div>

    <!-- AI MODE MODAL (FLOATING CONTEXT MENU STYLE) -->
    <div id="ai-mode-modal" class="windows-style floating-submenu" style="display: none; position: absolute; z-index: 9999;">
        <div class="modal-body" style="padding: 5px;">
            <div class="modal-list-item" onclick="window.selectAiMode('chatbot')"><i class="fas fa-comments"></i> Chatbot</div>
            <div class="modal-list-item" onclick="window.selectAiMode('transcript')"><i class="fas fa-closed-captioning"></i> Transcript</div>
            <div class="modal-list-item" onclick="window.selectAiMode('summary')"><i class="fas fa-file-alt"></i> File to Summary</div>
            <div class="modal-list-item" onclick="window.selectAiMode('note')"><i class="fas fa-sticky-note"></i> Note Generator</div>
            <div class="modal-list-item" onclick="window.selectAiMode('coding')"><i class="fas fa-code"></i> Coding Agent</div>
        </div>
    </div>

    <!-- SET OUTPUT SOURCE MODAL (FLOATING CONTEXT MENU STYLE) -->
    <div id="output-source-modal" class="windows-style floating-submenu" style="display: none; width: 280px; max-height: 350px; position: absolute; z-index: 9999; flex-direction: column;">
        <div class="modal-body" style="padding: 5px; overflow-y: auto; flex: 1;" id="output-source-list">
            <!-- Sources loaded here -->
        </div>
    </div>

    <!-- SORT BY MODAL (FLOATING CONTEXT MENU STYLE) -->
    <div id="sort-by-modal" class="windows-style floating-submenu" style="display: none; position: absolute; z-index: 9999;">
        <div class="modal-body" style="padding: 5px;">
            <div class="modal-list-item" onclick="window.selectSortBy('newest')"><i class="fas fa-clock"></i> From Newest</div>
            <div class="modal-list-item" onclick="window.selectSortBy('oldest')"><i class="fas fa-history"></i> From Oldest</div>
            <div class="modal-list-item" onclick="window.selectSortBy('asc')"><i class="fas fa-sort-alpha-down"></i> Ascending (A-Z)</div>
            <div class="modal-list-item" onclick="window.selectSortBy('desc')"><i class="fas fa-sort-alpha-up"></i> Descending (Z-A)</div>
        </div>
    </div>

    <!-- ACTIVITY SCOPE MODAL (FLOATING CONTEXT MENU STYLE) -->
    <div id="activity-scope-modal" class="windows-style floating-submenu" style="display: none; position: absolute; z-index: 9999;">
        <div class="modal-body" style="padding: 5px;">
            <div class="modal-list-item" onclick="window.selectActivityScope('all')"><i class="fas fa-globe"></i> All Room (Account)</div>
            <div class="modal-list-item" onclick="window.selectActivityScope('room')"><i class="fas fa-door-open"></i> This Room Only</div>
        </div>
    </div>

    <!-- CLOCK MODE MODAL (FLOATING CONTEXT MENU STYLE) -->
    <div id="clock-mode-modal" class="windows-style floating-submenu" style="display: none; position: absolute; z-index: 9999;">
        <div class="modal-body" style="padding: 5px;">
            <div class="modal-list-item" onclick="window.selectClockMode('clock')"><i class="fas fa-clock"></i> Clock</div>
            <div class="modal-list-item" onclick="window.selectClockMode('timer')"><i class="fas fa-hourglass-start"></i> Timer</div>
            <div class="modal-list-item" onclick="window.selectClockMode('stopwatch')"><i class="fas fa-stopwatch"></i> Stopwatch</div>
        </div>
    </div>

    <!-- CUSTOM ALERT MODAL -->
    <div id="custom-modal" class="modal-overlay" style="display: none;">
        <div class="windows-style">
            <div class="modal-header">
                <span id="modal-title">Notification</span>
                <button class="close-btn" onclick="$('#custom-modal').hide()">&times;</button>
            </div>
            <div class="modal-body">
                <p id="modal-message"></p>
                <div class="modal-actions" id="modal-actions-default">
                    <button class="btn" onclick="$('#custom-modal').hide()">OK</button>
                </div>
                <div class="modal-actions" id="modal-actions-confirm" style="display:none; gap: 10px;">
                    <button class="btn btn-secondary" onclick="$('#custom-modal').hide()">Cancel</button>
                    <button class="btn btn-primary" id="btn-confirm-yes">Confirm</button>
                </div>
            </div>
        </div>
    </div>

    <div id="login-screen" class="screen full-screen-flex">
        <div class="box-container">
            <h1>LOBE</h1>
            <p class="subtitle">Design Your Needs</p>
            <form id="auth-form">
                <input type="text" id="username" placeholder="Username" required>
                <input type="password" id="password" placeholder="Password" required>
                <div class="auth-buttons">
                    <button type="button" id="btn-login" class="btn-primary">Masuk</button>
                    <button type="button" id="btn-register" class="btn-secondary">Daftar</button>
                </div>
            </form>
            <div id="auth-message" style="margin-top: 15px;"></div>
        </div>
    </div>

    <div id="room-setup-screen" class="screen full-screen-flex" style="display: none;">
        <div class="box-container">
            <h2>Beri Nama Ruanganmu</h2>
            <p class="subtitle">Contoh: Ruang Belajar, Basecamp LOBE</p>
            <input type="text" id="room-name" placeholder="Nama Room..." required maxlength="50">
            <button type="button" id="btn-create-room" class="btn-primary" style="width: 100%;">Mulai Membangun</button>
        </div>
    </div>

    <div id="workspace-screen" class="screen" style="display: none;">
        <div id="canvas" class="grid-background">
            
            <nav id="up-nav-bar" class="navbar" style="display: none;">
                <div class="nav-logo" style="display:flex; align-items:center;">
                    LOBE
                    <span id="admin-badge" style="display:none; margin-left:10px; background:#343a40; color:white; font-size:10px; padding:2px 8px; border-radius:20px; font-weight:900; text-transform:uppercase; letter-spacing:1px;">Admin</span>
                    <span id="premium-badge" style="display:none; margin-left:10px; background:linear-gradient(45deg, #FFD700, #FFA500); color:white; font-size:10px; padding:2px 8px; border-radius:20px; font-weight:900; box-shadow:0 2px 5px rgba(255,165,0,0.3); text-transform:uppercase; letter-spacing:1px;">Premium</span>
                </div>
                <div class="nav-center">
                    <!-- CUSTOM SELECT REPLACEMENT -->
                    <div class="custom-select-wrapper">
                        <div class="custom-select-trigger">
                            <span id="current-room-name">+ Create New Room</span>
                            <i class="fas fa-chevron-down"></i>
                        </div>
                        <div class="custom-options">
                            <span class="custom-option" data-value="new">+ Create New Room</span>
                            <!-- Rooms loaded dynamically here -->
                        </div>
                    </div>
                </div>
                <div class="nav-profile">
                    <i class="fas fa-user-circle" style="font-size: 1.2rem; margin-right: 5px;"></i>
                    <span id="display-user" style="font-weight: 500; margin-right: 15px;">Guest</span>
                    <button id="btn-logout" style="padding: 5px 10px; font-size: 12px; border-radius: 4px; border: 1px solid #ddd; background: #fff; cursor: pointer;">Logout</button>
                </div>
            </nav>

            <div id="welcome-screen" style="display: none;">
                <h1 class="ikea-font">Let’s create your room!</h1>
                <div class="item-grid-container" id="welcome-items">
                    <!-- Items will be loaded here -->
                </div>
            </div>
            
        </div>

        <!-- Global Context Menu -->
        <div id="context-menu" class="context-menu" style="display: none;">
            <ul id="menu-items-list">
                <!-- Items loaded here dynamically -->
            </ul>
        </div>

        <!-- Widget Context Menu -->
        <div id="widget-context-menu" class="context-menu" style="display: none;">
            <div class="context-item" id="toggle-close-btn"><i class="fas fa-power-off"></i> Toggle Close Button</div>

            <div class="context-divider ai-feature" style="display:none;"></div>

            <div class="context-item ai-feature" id="menu-ai-mode" style="display:none;"><i class="fas fa-robot"></i> AI Mode</div>
            <div class="context-item ai-feature" id="menu-set-output" style="display:none;"><i class="fas fa-link"></i> Set as Output of</div>
            <div class="context-item ai-feature" id="menu-sort-by" style="display:none;"><i class="fas fa-sort"></i> Sort by</div>

            <div class="context-item" id="menu-clock-mode" style="display:none;"><i class="fas fa-stopwatch"></i> Set as</div>

            <div class="context-item ai-feature" id="menu-toggle-search" style="display:none;"><i class="fas fa-search"></i> Toggle Search Autocomplete</div>

            <div class="context-item" id="menu-show-data" style="display:none;"><i class="fas fa-chart-line"></i> Show Data</div>

            <div class="context-item" id="menu-full-screen" style="display:none; justify-content: space-between; align-items: center;">
                <span><i class="fas fa-expand"></i> Full screen</span>
                <i class="fas fa-check checkmark" style="display:none; font-size: 0.8rem; color: #28a745;"></i>
            </div>

            <div class="context-item" id="menu-detach-image" style="display:none;">
                <i class="fas fa-unlink"></i> Detach image
            </div>
        </div>
    </div>

    <script src="assets/js/widgets.js"></script>
    <script src="assets/js/app.js"></script>
</body>
</html>