<?php
session_start();
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    header("Location: index.php");
    exit;
}
require 'koneksi.php';
$username = $_SESSION['username'];
$activeRoomId = $_SESSION['active_room_id'] ?? 'null';
$activeRoomName = $_SESSION['active_room_name'] ?? '';
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LOBE - Admin Workspace</title>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://code.jquery.com/ui/1.13.2/themes/base/jquery-ui.css">
    <link rel="stylesheet" href="assets/css/style.css">
    <style>
        * { font-family: 'Roboto', sans-serif !important; }
        body { margin: 0; overflow-y: auto; background-color: #f0f2f5; min-height: 100vh; padding-top: 60px; }

        /* Admin Overlay Layer */
        #admin-layer {
            position: relative;
            padding: 20px; display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px; pointer-events: none; z-index: 100;
            padding-bottom: 80px;
        }

        .admin-window {
            background: white; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            display: flex; flex-direction: column; border: 1px solid #ddd;
            pointer-events: all; height: 100%; min-height: 500px;
        }

        .window-header {
            background: #343a40; color: white; padding: 10px 15px;
            font-weight: bold; display: flex; justify-content: space-between; align-items: center;
        }
        .window-header svg { vertical-align: middle; margin-right: 8px; }

        .window-content { flex: 1; padding: 15px; overflow-y: auto; }

        /* Metric Cards */
        .metrics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 15px; }
        .metric-card { background: #f8f9fa; padding: 15px; border-radius: 6px; text-align: center; border-left: 4px solid #007bff; }
        .metric-card h4 { margin: 0; font-size: 0.7rem; color: #888; text-transform: uppercase; }
        .metric-card .value { font-size: 1.5rem; font-weight: 900; color: #333; }

        table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
        th, td { text-align: left; padding: 8px; border-bottom: 1px solid #eee; }
        th { background-color: #fff; color: #333; position: sticky; top: 0px; z-index: 10; border-bottom: 2px solid #eee; }

        .badge { padding: 2px 6px; border-radius: 10px; font-size: 0.7rem; font-weight: bold; }
        .badge-premium { background: #fff3cd; color: #856404; border: 1px solid #ffeeba; }
        .badge-admin { background: #d1ecf1; color: #0c5460; }

        .pagination { display: flex; justify-content: center; margin-top: 10px; gap: 3px; }
        .pagination button { padding: 4px 8px; border: 1px solid #ddd; background: white; cursor: pointer; border-radius: 4px; font-size: 0.75rem; }
        .pagination button.active { background: #007bff; color: white; border-color: #007bff; }

        .search-bar { margin-bottom: 10px; display: flex; gap: 5px; align-items: center; }
        .search-bar input, .form-group input, .pagination input {
            padding: 6px 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 0.8rem;
            background: #fff; transition: all 0.2s; outline: none;
        }
        .search-bar input:focus, .form-group input:focus { border-color: #007bff; box-shadow: 0 0 0 2px rgba(0,123,255,0.1); }

        /* Hide Number Spinners */
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }

        .search-bar select, .form-group select {
            padding: 6px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 0.8rem;
            background: #f8f9fa;
            cursor: pointer;
            outline: none;
            transition: border-color 0.2s;
            appearance: none;
            -webkit-appearance: none;
            background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
            background-repeat: no-repeat;
            background-position: right 8px center;
            background-size: 12px;
            padding-right: 30px;
        }
        .search-bar select:hover, .form-group select:hover { border-color: #007bff; background-color: #fff; }

        /* Custom scrollbar for admin */
        .window-content::-webkit-scrollbar { width: 6px; }
        .window-content::-webkit-scrollbar-track { background: #f1f1f1; }
        .window-content::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }
        .window-content::-webkit-scrollbar-thumb:hover { background: #999; }

        svg { fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
    </style>

    <script src="assets/js/icons.js"></script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://code.jquery.com/ui/1.13.2/jquery-ui.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js"></script>
    <script src="https://cdn.ckeditor.com/ckeditor5/39.0.1/classic/ckeditor.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.12/ace.js"></script>

    <script>
        const APP_IS_LOGGED_IN = true;
        const APP_USERNAME = "<?php echo htmlspecialchars($username); ?>";
        const INITIAL_STATE = {
            isLoggedIn: true,
            username: APP_USERNAME,
            activeRoomId: <?php echo $activeRoomId; ?>,
            activeRoomName: "Admin Panel"
        };
        window.IS_ADMIN_PAGE = true;
    </script>
</head>
<body>

    <nav id="up-nav-bar" class="navbar" style="position: fixed;">
        <div class="nav-logo" style="display:flex; align-items:center;">
            LOBE <span id="admin-badge" class="badge-admin-global">ADMIN</span>
        </div>
        <div class="nav-center">
            <div class="custom-select-wrapper">
                <div class="custom-select-trigger">
                    <span id="current-room-name">Admin Panel</span>
                    <script>document.write(ICONS.chevronDown);</script>
                </div>
                <div class="custom-options">
                    <span class="custom-option" data-value="new">+ Create New Room</span>
                    <!-- Rooms will be loaded here via updateRoomLists -->
                </div>
            </div>
        </div>
        <div class="nav-profile">
            <span style="color:#007bff; margin-right:5px;"><script>document.write(ICONS.shield);</script></span>
            <span id="display-user" style="font-weight: 500; margin-right: 15px;"><?php echo $username; ?></span>
            <button id="btn-logout" style="padding: 5px 10px; font-size: 12px; border-radius: 4px; border: 1px solid #ddd; background: #fff; cursor: pointer;">Logout</button>
        </div>
    </nav>

    <div id="workspace-screen" class="screen" style="display: block; position: fixed; z-index: -1;">
        <div id="canvas" class="grid-background active"></div>
    </div>

    <div style="position: relative; z-index: 10;">
        <div id="admin-layer">
                <!-- 1. Dashboard Overview -->
                <div class="admin-window">
                    <div class="window-header">
                        <span><script>document.write(ICONS.dashboard);</script> Dashboard Overview</span>
                    </div>
                    <div class="window-content">
                        <div class="search-bar">
                            <input type="text" id="dash-user-search" placeholder="Search user...">
                            <button class="btn btn-secondary" style="padding:5px 10px; font-size:0.7rem;" title="Reset Dashboard" onclick="resetDashboard()"><script>document.write(ICONS.undo);</script></button>
                        </div>
                        <div id="dash-scope-badge" style="font-size:0.7rem; color:#007bff; margin-bottom:10px; font-weight:bold;">SCOPE: GLOBAL</div>

                        <div class="metrics-grid">
                            <div class="metric-card"><h4 title="Total Users">Users</h4><div class="value" id="stat-users">-</div></div>
                            <div class="metric-card" style="border-left-color:#ffc107;"><h4 title="Active Premium">Premium</h4><div class="value" id="stat-premium">-</div></div>
                            <div class="metric-card" style="border-left-color:#28a745;"><h4 title="Total Rooms">Rooms</h4><div class="value" id="stat-rooms">-</div></div>
                        </div>

                        <div style="height: 180px; margin-bottom: 20px;">
                            <canvas id="admin-activity-chart"></canvas>
                        </div>

                        <h5 style="margin-bottom:10px; font-size:0.8rem; color:#333; border-bottom:1px solid #eee; padding-bottom:5px;">WIDGET INSTANCE COUNTS</h5>
                        <div id="popular-widgets-list" style="max-height:200px; overflow-y:auto;"></div>
                    </div>
                </div>

                <!-- 2. Role Management -->
                <div class="admin-window">
                    <div class="window-header">
                        <span><script>document.write(ICONS.roles);</script> Role Management</span>
                    </div>
                    <div class="window-content">
                        <div class="search-bar">
                            <input type="text" id="role-search" placeholder="Search user..." oninput="loadRoles(1)">
                            <select id="role-limit" onchange="loadRoles(1)">
                                <option value="10">10</option><option value="25">25</option><option value="50">50</option><option value="100">100</option>
                            </select>
                        </div>
                        <div id="role-list-container">Loading...</div>
                    </div>
                    <div style="padding: 5px; border-top: 1px solid #eee;">
                         <div class="pagination" id="role-pagination"></div>
                    </div>
                </div>

                <!-- 3. History -->
                <div class="admin-window">
                    <div class="window-header">
                        <span><script>document.write(ICONS.history);</script> History</span>
                        <span style="cursor:pointer;" onclick="loadTransactions(1)"><script>document.write(ICONS.sync);</script></span>
                    </div>
                    <div class="window-content">
                        <div class="search-bar">
                            <select id="trans-limit" onchange="loadTransactions(1)" style="margin-left:auto;">
                                <option value="10">10</option><option value="25">25</option><option value="50">50</option><option value="100">100</option>
                            </select>
                        </div>
                        <div id="transaction-list-container">Loading...</div>
                    </div>
                     <div style="padding: 5px; border-top: 1px solid #eee;">
                         <div class="pagination" id="trans-pagination"></div>
                    </div>
                </div>

                <!-- 5. Account Management -->
                <div class="admin-window">
                    <div class="window-header">
                        <span><script>document.write(ICONS.accounts);</script> Account Management</span>
                    </div>
                    <div class="window-content">
                        <div class="search-bar">
                            <input type="text" id="acc-search" placeholder="Search user..." oninput="loadAccounts(1)">
                            <select id="acc-limit" onchange="loadAccounts(1)">
                                <option value="10">10</option><option value="25">25</option><option value="50">50</option><option value="100">100</option>
                            </select>
                        </div>
                        <div id="acc-list-container">Loading...</div>
                        <button class="btn btn-primary" style="width:100%; margin-top:10px;" onclick="openCreateAccModal()"><script>document.write(ICONS.plus);</script> Create Account</button>
                    </div>
                    <div style="padding: 5px; border-top: 1px solid #eee;">
                         <div class="pagination" id="acc-pagination"></div>
                    </div>
                </div>

                <!-- 4. Master Items (Colspan 2) -->
                <div class="admin-window" style="grid-column: span 2;">
                    <div class="window-header">
                        <span><script>document.write(ICONS.items);</script> Master Items</span>
                    </div>
                    <div class="window-content">
                        <div class="search-bar">
                            <select id="item-limit" onchange="loadItems(1)">
                                <option value="10">10</option><option value="25">25</option><option value="50">50</option><option value="100">100</option>
                            </select>
                        </div>
                        <div id="item-list-container">Loading...</div>
                    </div>
                    <div style="padding: 5px; border-top: 1px solid #eee;">
                         <div class="pagination" id="item-pagination"></div>
                    </div>
                </div>


            </div>
    </div>

    <!-- MODAL BOXES -->
    <div id="user-modal" class="modal-overlay" style="display: none; z-index: 10001;">
        <div class="windows-style" style="width: 400px;">
            <div class="modal-header">
                <span id="user-modal-title">Create Account</span>
                <button class="close-btn" onclick="$('#user-modal').hide()"><script>document.write(ICONS.x);</script></button>
            </div>
            <form id="user-form">
                <div class="modal-body">
                    <input type="hidden" id="edit-user-id">
                    <div class="form-group"><label>Username</label><input type="text" id="edit-username" required></div>
                    <div class="form-group"><label>Password</label><input type="text" id="edit-password" required></div>
                    <div class="modal-actions">
                        <button type="button" class="btn btn-secondary" title="Cancel" onclick="$('#user-modal').hide()"><script>document.write(ICONS.x);</script></button>
                        <button type="submit" class="btn btn-primary" title="Save Changes"><script>document.write(ICONS.check);</script></button>
                    </div>
                </div>
            </form>
        </div>
    </div>

    <div id="item-modal" class="modal-overlay" style="display: none; z-index: 10000;">
        <div class="windows-style" style="width: 400px;">
            <div class="modal-header">
                <span id="item-modal-title">Item Editor</span>
                <button class="close-btn" onclick="$('#item-modal').hide()"><script>document.write(ICONS.x);</script></button>
            </div>
            <form id="item-form">
                <div class="modal-body">
                    <input type="hidden" id="item-id">
                    <input type="hidden" id="item-type">
                    <div class="form-group"><label>Name</label><input type="text" id="item-name" required></div>
                    <div class="form-group"><label>Description</label><input type="text" id="item-desc"></div>
                    <div class="form-group"><label>Icon (fa-xxx, try: columns, list-ul, layer-group, robot, code, marker, whiteboard, hammer, clock)</label><input type="text" id="item-icon" required></div>
                    <div class="modal-actions">
                        <button type="button" class="btn btn-secondary" title="Cancel" onclick="$('#item-modal').hide()"><script>document.write(ICONS.x);</script></button>
                        <button type="submit" class="btn btn-primary" title="Save Changes"><script>document.write(ICONS.check);</script></button>
                    </div>
                </div>
            </form>
        </div>
    </div>

    <!-- Context Menus (Standard for spawning) -->
    <div id="context-menu" class="context-menu" style="display: none;">
        <ul id="menu-items-list"></ul>
    </div>
    <div id="widget-context-menu" class="context-menu" style="display: none;">
        <div class="context-item" id="toggle-close-btn"><script>document.write(ICONS.logout);</script> Toggle Close Button</div>
    </div>

    <script src="assets/js/widgets.js"></script>
    <script src="assets/js/app.js"></script>
    <script>
        let activityChart = null;

        $(document).ready(function() {
            // Disable right-click menu globally in admin page
            $(document).on('contextmenu', function(e) {
                e.preventDefault();
            });

            loadDashboard();
            loadRoles(1);
            loadTransactions(1);
            loadItems(1);
            loadAccounts(1);

            // Sync room list in navbar
            if (window.updateRoomLists) updateRoomLists();

            // Auto refresh logs
            setInterval(() => loadTransactions(1), 30000);
        });

        let currentDashUser = '';

        function loadDashboard() {
            $.get(`backend/admin_api.php?action=get_dashboard_stats&username=${currentDashUser}`, function(res) {
                if(res.status === 'success') {
                    $('#stat-users').text(res.metrics.users);
                    $('#stat-premium').text(res.metrics.premium);
                    $('#stat-rooms').text(res.metrics.rooms);
                    $('#dash-scope-badge').text('SCOPE: ' + res.scope);

                    // Chart
                    const ctx = document.getElementById('admin-activity-chart').getContext('2d');
                    if (activityChart) activityChart.destroy();
                    activityChart = new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: res.activity_chart.map(d => d.date.split('-').slice(1).join('/')),
                            datasets: [{
                                label: res.scope === 'GLOBAL' ? 'Global Activity' : `${res.scope} Activity`,
                                data: res.activity_chart.map(d => d.count),
                                borderColor: '#007bff',
                                tension: 0.3,
                                fill: true,
                                backgroundColor: 'rgba(0, 123, 255, 0.1)'
                            }]
                        },
                        options: { maintainAspectRatio: false, plugins: { legend: { display: false } } }
                    });

                    // Popular Widgets
                    let popHtml = '';
                    res.popular_widgets.forEach(w => {
                        popHtml += `<div style="display:flex; justify-content:space-between; font-size:0.75rem; margin-bottom:5px; border-bottom:1px solid #f9f9f9; padding-bottom:3px;">
                            <span>${w.nama_item}</span>
                            <span style="font-weight:bold;">${w.count} instances</span>
                        </div>`;
                    });
                    $('#popular-widgets-list').html(popHtml || '<p style="color:#888; text-align:center; padding-top:20px;">No widget data found for this scope.</p>');
                }
            });
        }

        function resetDashboard() {
            currentDashUser = '';
            $('#dash-user-search').val('');
            loadDashboard();
        }

        $('#dash-user-search').on('keypress', function(e) {
            if(e.which == 13) {
                currentDashUser = $(this).val().trim();
                loadDashboard();
            }
        });

        function openCreateAccModal() {
            $('#user-modal-title').text('Create New Account');
            $('#edit-user-id').val('');
            $('#user-form')[0].reset();
            $('#user-modal').show();
        }

        function openEditAccModal(user) {
            $('#user-modal-title').text('Edit Account: ' + user.username);
            $('#edit-user-id').val(user.id);
            $('#edit-username').val(user.username);
            $('#edit-password').val(user.password);
            $('#user-modal').show();
        }

        $('#user-form').on('submit', function(e) {
            e.preventDefault();
            let id = $('#edit-user-id').val();
            let data = {
                id: id,
                username: $('#edit-username').val(),
                password: $('#edit-password').val()
            };
            $.ajax({
                url: 'backend/admin_api.php?action=' + (id ? 'update_user_account' : 'create_user'),
                type: 'POST', data: JSON.stringify(data), contentType: 'application/json',
                success: function(res) {
                    if (res.status === 'success') {
                        $('#user-modal').hide();
                        loadAccounts(1); loadRoles(1); loadDashboard();
                    } else {
                        window.showCustomModal('Error', res.message);
                    }
                }
            });
        });


        function loadRoles(page) {
            let q = $('#role-search').val();
            let limit = $('#role-limit').val() || 10;
            $.get(`backend/admin_api.php?action=get_users&page=${page}&search=${q}&limit=${limit}`, function(res) {
                if(res.status === 'success') {
                    let html = '<table><thead><tr><th>User</th><th>Role</th><th>Premium</th><th>Action</th></tr></thead><tbody>';
                    res.data.forEach(u => {
                        let isPrem = u.is_premium;
                        let premBadge = isPrem ? `<span class="badge badge-premium">Active</span>` : `<span style="color:#ccc;">None</span>`;
                        let roleBadge = u.role === 'admin' ? `<span class="badge badge-admin">Admin</span>` : 'User';
                        html += `<tr>
                            <td style="font-weight:bold;">${u.username}</td>
                            <td>${roleBadge}</td>
                            <td>${premBadge}</td>
                            <td>
                                <div style="display:flex; gap:3px;">
                                    <button class="btn ${isPrem ? 'btn-danger' : 'btn-success'}" style="padding:4px 8px; font-size:0.7rem;" title="${isPrem ? 'Strip Premium' : 'Grant Premium'}" onclick="givePremium(${u.id}, ${isPrem ? 0 : 30})">${isPrem ? ICONS.toggleOn : ICONS.toggleOff}</button>
                                </div>
                            </td>
                        </tr>`;
                    });
                    html += '</tbody></table>';
                    $('#role-list-container').html(html);
                    renderPagination('role', res.pagination, loadRoles);
                }
            });
        }

        function loadAccounts(page) {
            let q = $('#acc-search').val();
            let limit = $('#acc-limit').val() || 10;
            $.get(`backend/admin_api.php?action=get_users&page=${page}&search=${q}&limit=${limit}`, function(res) {
                if(res.status === 'success') {
                    let html = '<table><thead><tr><th>User</th><th>Password</th><th>Action</th></tr></thead><tbody>';
                    res.data.forEach(u => {
                        html += `<tr>
                            <td style="font-weight:bold;">${u.username}</td>
                            <td><span style="font-family:password;">••••••</span></td>
                            <td>
                                <div style="display:flex; gap:3px;">
                                    <button class="btn btn-secondary" style="padding:4px 8px; font-size:0.7rem;" title="Edit Account" onclick='openEditAccModal(${JSON.stringify(u)})'>${ICONS.edit}</button>
                                    <button class="btn btn-danger" style="padding:4px 8px; font-size:0.7rem;" title="Delete Account" onclick="deleteUser(${u.id}, '${u.username}')">${ICONS.trash}</button>
                                </div>
                            </td>
                        </tr>`;
                    });
                    html += '</tbody></table>';
                    $('#acc-list-container').html(html);
                    renderPagination('acc', res.pagination, loadAccounts);
                }
            });
        }

        function deleteUser(id, name) {
            window.showConfirmModal('Delete User', `Are you sure you want to delete user "<b>${name}</b>"? This is a permanent removal.`, function() {
                $.get(`backend/admin_api.php?action=delete_user&id=${id}`, function(res) {
                    if (res.status === 'success') {
                        loadAccounts(1); loadRoles(1); loadDashboard();
                    } else {
                        window.showCustomModal('Error', res.message);
                    }
                });
            });
        }

        function givePremium(id, days = 30) {
            $.ajax({
                url: 'backend/admin_api.php?action=update_user_premium',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ id: id, days: days }),
                success: function(res) {
                    if (res.status === 'error') {
                        if (window.showCustomModal) window.showCustomModal('Error', res.message);
                        else alert(res.message);
                    }
                    loadRoles(1);
                    loadDashboard();
                }
            });
        }

        function loadTransactions(page) {
            let limit = $('#trans-limit').val() || 10;
            $.get(`backend/admin_api.php?action=get_transactions&page=${page}&limit=${limit}`, function(res) {
                if(res.status === 'success') {
                    let html = '<table><thead><tr><th>User</th><th>Act</th><th>Time</th></tr></thead><tbody>';
                    res.data.forEach(t => {
                        let time = new Date(t.waktu_transaksi.replace(/-/g,'/')).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
                        html += `<tr>
                            <td style="color:#666;">${t.username || 'Guest'}</td>
                            <td title="${t.detail_aktivitas}">${t.jenis_aktivitas}</td>
                            <td>${time}</td>
                        </tr>`;
                    });
                    html += '</tbody></table>';
                    $('#transaction-list-container').html(html);
                    renderPagination('trans', res.pagination, loadTransactions);
                }
            });
        }

        function loadItems(page = 1) {
            let limit = $('#item-limit').val() || 10;
            $.get(`backend/admin_api.php?action=get_items&page=${page}&limit=${limit}`, function(res) {
                if(res.status === 'success') {
                    let html = '<table><thead><tr><th>Name</th><th>Description</th><th>Status</th><th>Action</th></tr></thead><tbody>';
                    res.data.forEach(i => {
                        let activeText = i.is_active == 1 ? 'Active' : 'Disabled';
                        let activeColor = i.is_active == 1 ? 'green' : 'red';
                        let btnText = i.is_active == 1 ? 'Disable' : 'Enable';
                        let itemJson = JSON.stringify(i).replace(/'/g, "&#39;");

                        html += `<tr>
                            <td><span style="font-weight:bold;">${i.nama_item}</span></td>
                            <td style="font-size:0.7rem; color:#666;">${i.deskripsi}</td>
                            <td style="color:${activeColor}; font-weight:bold;">${activeText}</td>
                            <td>
                                <div style="display:flex; gap:3px;">
                                    <button class="btn btn-secondary" style="padding:4px 8px; font-size:0.7rem;" title="Edit Item" onclick='editItem(${itemJson})'>${ICONS.edit}</button>
                                    <button class="btn" style="padding:4px 8px; font-size:0.7rem; background:#6c757d;" title="${btnText}" onclick="toggleItem(${i.id}, ${i.is_active == 1 ? 0 : 1})">${i.is_active == 1 ? ICONS.eyeOff : ICONS.eye}</button>
                                </div>
                            </td>
                        </tr>`;
                    });
                    html += '</tbody></table>';
                    $('#item-list-container').html(html);
                    renderPagination('item', res.pagination, loadItems);
                }
            });
        }

        function toggleItem(id, status) {
            $.get(`backend/admin_api.php?action=toggle_item_status&id=${id}&status=${status}`, () => loadItems());
        }

        function renderPagination(prefix, meta, callback) {
            let html = '';
            const currentPage = parseInt(meta.current_page);
            const totalPages = parseInt(meta.total_pages);

            // 1, 2, 3, 4
            for (let i = 1; i <= Math.min(4, totalPages); i++) {
                html += `<button class="${currentPage === i ? 'active' : ''}" onclick="${callback.name}(${i})">${i}</button>`;
            }

            if (totalPages > 5) {
                html += `<span style="padding:0 5px; color:#ccc;">...</span>`;
            }

            // Last page
            if (totalPages > 4) {
                html += `<button class="${currentPage === totalPages ? 'active' : ''}" onclick="${callback.name}(${totalPages})">${totalPages}</button>`;
            }

            // Search/Jump Field 1 with padding (at least 20px)
            html += `<div style="display:flex; align-items:center; margin-left:40px; gap:5px;">
                <input type="number" id="${prefix}-jump-page" min="1" max="${totalPages}" placeholder="Go" style="width:50px; padding:0; height:24px; text-align:center;">
                <button class="btn btn-secondary" style="padding:0; width:24px; height:24px; font-size:0.6rem;" title="Go" onclick="let p = $('#${prefix}-jump-page').val(); if(p >= 1 && p <= ${totalPages}) ${callback.name}(p);">${ICONS.search}</button>
            </div>`;

            $('#' + prefix + '-pagination').html(html);

            // Allow enter key on jump input
            $(`#${prefix}-jump-page`).on('keypress', function(e) {
                if(e.which == 13) {
                    let p = $(this).val();
                    if(p >= 1 && p <= totalPages) callback(p);
                }
            });
        }

        function openItemModal() {
            $('#item-modal-title').text('Add New Catalog Item');
            $('#item-id').val('');
            $('#item-form')[0].reset();
            $('#item-modal').show();
        }

        function editItem(item) {
            $('#item-modal-title').text('Edit Catalog Item');
            $('#item-id').val(item.id);
            $('#item-name').val(item.nama_item);
            $('#item-desc').val(item.deskripsi);
            $('#item-type').val(item.tipe_item);
            $('#item-icon').val(item.gambar);
            $('#item-modal').show();
        }

        $('#item-form').on('submit', function(e) {
            e.preventDefault();
            let id = $('#item-id').val();
            let data = {
                id: id,
                nama_item: $('#item-name').val(),
                deskripsi: $('#item-desc').val(),
                tipe_item: $('#item-type').val(),
                gambar: $('#item-icon').val()
            };
            $.ajax({
                url: 'backend/admin_api.php?action=' + (id ? 'update_item' : 'create_item'),
                type: 'POST', data: JSON.stringify(data), contentType: 'application/json',
                success: function() { $('#item-modal').hide(); loadItems(); }
            });
        });
    </script>
</body>
</html>