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
        if ($row['premium_until'] && (strtotime($row['premium_until']) > time())) {
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

    <script src="assets/js/icons.js"></script>
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
                <span id="ad-toast-title">LOBE Premium</span>
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
                <span id="premium-modal-title-text">Upgrade to LOBE Premium</span>
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
            <div class="modal-list-item" onclick="window.selectAiMode('chatbot')"><span class="icon-wrap"></span> Chatbot</div>
            <div class="modal-list-item" onclick="window.selectAiMode('transcript')"><span class="icon-wrap"></span> Transcript</div>
            <div class="modal-list-item" onclick="window.selectAiMode('summary')"><span class="icon-wrap"></span> File to Summary</div>
            <div class="modal-list-item" onclick="window.selectAiMode('note')"><span class="icon-wrap"></span> Note Generator</div>
            <div class="modal-list-item" onclick="window.selectAiMode('coding')"><span class="icon-wrap"></span> Coding Agent</div>
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
            <div class="modal-list-item" onclick="window.selectSortBy('newest')"><span class="icon-wrap"></span> From Newest</div>
            <div class="modal-list-item" onclick="window.selectSortBy('oldest')"><span class="icon-wrap"></span> From Oldest</div>
            <div class="modal-list-item" onclick="window.selectSortBy('asc')"><span class="icon-wrap"></span> Ascending (A-Z)</div>
            <div class="modal-list-item" onclick="window.selectSortBy('desc')"><span class="icon-wrap"></span> Descending (Z-A)</div>
        </div>
    </div>

    <!-- ACTIVITY SCOPE MODAL (FLOATING CONTEXT MENU STYLE) -->
    <div id="activity-scope-modal" class="windows-style floating-submenu" style="display: none; position: absolute; z-index: 9999;">
        <div class="modal-body" style="padding: 5px;">
            <div class="modal-list-item" onclick="window.selectActivityScope('all')"><span class="icon-wrap"></span> All Room (Account)</div>
            <div class="modal-list-item" onclick="window.selectActivityScope('room')"><span class="icon-wrap"></span> This Room Only</div>
        </div>
    </div>

    <!-- CLOCK MODE MODAL (FLOATING CONTEXT MENU STYLE) -->
    <div id="clock-mode-modal" class="windows-style floating-submenu" style="display: none; position: absolute; z-index: 9999;">
        <div class="modal-body" style="padding: 5px;">
            <div class="modal-list-item" onclick="window.selectClockMode('clock')"><span class="icon-wrap"></span> Clock</div>
            <div class="modal-list-item" onclick="window.selectClockMode('timer')"><span class="icon-wrap"></span> Timer</div>
            <div class="modal-list-item" onclick="window.selectClockMode('stopwatch')"><span class="icon-wrap"></span> Stopwatch</div>
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
                    <span id="admin-badge" class="badge-admin-global" style="display:none;">ADMIN</span>
                    <span id="premium-badge" style="display:none; margin-left:10px; background:linear-gradient(45deg, #FFD700, #FFA500); color:white; font-size:10px; padding:2px 8px; border-radius:20px; font-weight:900; box-shadow:0 2px 5px rgba(255,165,0,0.3); text-transform:uppercase; letter-spacing:1px;">Premium</span>
                </div>
                <div class="nav-center">
                    <!-- CUSTOM SELECT REPLACEMENT -->
                    <div class="custom-select-wrapper">
                        <div class="custom-select-trigger">
                            <span id="current-room-name">+ Create New Room</span>
                            <span id="room-select-chevron"></span>
                        </div>
                        <div class="custom-options">
                            <span class="custom-option" data-value="new">+ Create New Room</span>
                            <!-- Rooms loaded dynamically here -->
                        </div>
                    </div>
                </div>
                <div class="nav-profile">
                    <span style="margin-right:5px;" id="nav-user-icon"></span>
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
            <div class="context-item" id="toggle-close-btn"><span class="icon-wrap"></span> Toggle Close Button</div>

            <div class="context-divider ai-feature" style="display:none;"></div>

            <div class="context-item ai-feature" id="menu-ai-mode" style="display:none;"><span class="icon-wrap"></span> AI Mode</div>
            <div class="context-item ai-feature" id="menu-set-output" style="display:none;"><span class="icon-wrap"></span> Set as Output of</div>
            <div class="context-item ai-feature" id="menu-sort-by" style="display:none;"><span class="icon-wrap"></span> Sort by</div>

            <div class="context-item" id="menu-clock-mode" style="display:none;"><span class="icon-wrap"></span> Set as</div>

            <div class="context-item ai-feature" id="menu-toggle-search" style="display:none;"><span class="icon-wrap"></span> Toggle Search Autocomplete</div>

            <div class="context-item" id="menu-show-data" style="display:none;"><span class="icon-wrap"></span> Show Data</div>

            <div class="context-item" id="menu-full-screen" style="display:none; justify-content: space-between; align-items: center;">
                <span><span class="icon-wrap"></span> Full screen</span>
                <span class="checkmark" style="display:none; color: #28a745;"><span class="icon-wrap"></span></span>
            </div>

            <div class="context-item" id="menu-detach-image" style="display:none;">
                <span class="icon-wrap"></span> Detach image
            </div>
        </div>
    </div>

    <script src="assets/js/widgets.js"></script>
    <script src="assets/js/app.js"></script>
</body>
</html>