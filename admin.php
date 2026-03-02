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
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="stylesheet" href="https://code.jquery.com/ui/1.13.2/themes/base/jquery-ui.css">
    <link rel="stylesheet" href="assets/css/style.css">
    <style>
        body { margin: 0; overflow-y: auto; background-color: #f0f2f5; min-height: 100vh; padding-top: 60px; }

        /* Admin Overlay Layer */
        #admin-layer {
            position: relative;
            padding: 20px; display: grid;
            grid-template-columns: 400px 1fr 1fr;
            grid-template-rows: repeat(2, minmax(450px, auto));
            gap: 20px; pointer-events: none; z-index: 100;
            padding-bottom: 80px;
        }

        .admin-window {
            background: white; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            display: flex; flex-direction: column; border: 1px solid #ddd;
            pointer-events: all; height: 100%;
        }

        .window-header {
            background: #343a40; color: white; padding: 10px 15px;
            font-weight: bold; display: flex; justify-content: space-between; align-items: center;
        }

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
        .search-bar input { flex: 1; padding: 6px 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 0.8rem; }
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
    </style>

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
                    <i class="fas fa-chevron-down"></i>
                </div>
                <div class="custom-options">
                    <span class="custom-option" data-value="new">+ Create New Room</span>
                    <!-- Rooms will be loaded here via updateRoomLists -->
                </div>
            </div>
        </div>
        <div class="nav-profile">
            <i class="fas fa-user-shield" style="font-size: 1.2rem; margin-right: 5px; color:#007bff;"></i>
            <span id="display-user" style="font-weight: 500; margin-right: 15px;"><?php echo $username; ?></span>
            <button id="btn-logout" style="padding: 5px 10px; font-size: 12px; border-radius: 4px; border: 1px solid #ddd; background: #fff; cursor: pointer;">Logout</button>
        </div>
    </nav>

    <div id="workspace-screen" class="screen" style="display: block; position: fixed; z-index: -1;">
        <div id="canvas" class="grid-background active"></div>
    </div>

    <div style="position: relative; z-index: 10;">
        <div id="admin-layer">
                <!-- Dashboard & Stats -->
                <div class="admin-window" style="grid-row: 1 / 3;">
                    <div class="window-header">
                        <span><i class="fas fa-tachometer-alt"></i> Dashboard Overview</span>
                        <i class="fas fa-sync" style="cursor:pointer; font-size:0.8rem;" onclick="loadDashboard()"></i>
                    </div>
                    <div class="window-content">
                        <div class="metrics-grid">
                            <div class="metric-card"><h4 title="Total Users">Users</h4><div class="value" id="stat-users">-</div></div>
                            <div class="metric-card" style="border-left-color:#ffc107;"><h4 title="Active Premium">Premium</h4><div class="value" id="stat-premium">-</div></div>
                            <div class="metric-card" style="border-left-color:#28a745;"><h4 title="Total Rooms">Rooms</h4><div class="value" id="stat-rooms">-</div></div>
                        </div>
                        <div style="height: 180px; margin-bottom: 20px;">
                            <canvas id="admin-activity-chart"></canvas>
                        </div>
                        <h5 style="margin-bottom:10px; font-size:0.8rem; color:#666;">POPULAR WIDGETS</h5>
                        <div id="popular-widgets-list"></div>
                    </div>
                </div>

                <!-- User Management -->
                <div class="admin-window">
                    <div class="window-header">
                        <span><i class="fas fa-users-cog"></i> User Management</span>
                    </div>
                    <div class="window-content">
                        <div class="search-bar">
                            <input type="text" id="user-search" placeholder="Search username..." oninput="loadUsers(1)">
                            <select id="user-limit" onchange="loadUsers(1)">
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </select>
                        </div>
                        <div id="user-list-container">Loading...</div>
                    </div>
                    <div style="padding: 5px; border-top: 1px solid #eee;">
                         <div class="pagination" id="user-pagination"></div>
                    </div>
                </div>

                <!-- Transaction Logs -->
                <div class="admin-window">
                    <div class="window-header">
                        <span><i class="fas fa-stream"></i> Live Activity Feed</span>
                    </div>
                    <div class="window-content">
                        <div class="search-bar">
                            <div style="font-size:0.7rem; color:#888;">Recent Activity Logs</div>
                            <select id="trans-limit" onchange="loadTransactions(1)" style="margin-left:auto;">
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </select>
                        </div>
                        <div id="transaction-list-container">Loading...</div>
                    </div>
                     <div style="padding: 5px; border-top: 1px solid #eee;">
                         <div class="pagination" id="trans-pagination"></div>
                    </div>
                </div>

                <!-- Master Items -->
                <div class="admin-window" style="grid-column: 2 / 4;">
                    <div class="window-header">
                        <span><i class="fas fa-th-list"></i> Catalog Control (Master Items)</span>
                        <button class="btn btn-primary" style="padding:2px 10px; font-size:0.7rem;" onclick="openItemModal()">+ Add New</button>
                    </div>
                    <div class="window-content" id="item-list-container">
                        Loading...
                    </div>
                </div>

            </div>
    </div>

    <!-- MODAL BOXES -->
    <div id="item-modal" class="modal-overlay" style="display: none; z-index: 10000;">
        <div class="windows-style" style="width: 400px;">
            <div class="modal-header">
                <span id="item-modal-title">Item Editor</span>
                <button class="close-btn" onclick="$('#item-modal').hide()">&times;</button>
            </div>
            <form id="item-form">
                <div class="modal-body">
                    <input type="hidden" id="item-id">
                    <div class="form-group"><label>Name</label><input type="text" id="item-name" required></div>
                    <div class="form-group"><label>Description</label><input type="text" id="item-desc" style="width:100%; border:1px solid #ddd; padding:8px; border-radius:4px; font-size:14px;"></div>
                    <div class="form-group">
                        <label>Type</label>
                        <select id="item-type">
                            <option value="ui">UI</option><option value="input">Input</option>
                            <option value="output">Output</option><option value="tools">Tools</option>
                            <option value="api">API</option>
                        </select>
                    </div>
                    <div class="form-group"><label>Icon (fa-xxx)</label><input type="text" id="item-icon" required></div>
                    <div class="modal-actions">
                        <button type="button" class="btn btn-secondary" onclick="$('#item-modal').hide()">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save Changes</button>
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
        <div class="context-item" id="toggle-close-btn"><i class="fas fa-power-off"></i> Toggle Close Button</div>
    </div>

    <script src="assets/js/widgets.js"></script>
    <script src="assets/js/app.js"></script>
    <script>
        let activityChart = null;

        $(document).ready(function() {
            loadDashboard();
            loadUsers(1);
            loadTransactions(1);
            loadItems();

            // Sync room list in navbar
            if (window.updateRoomLists) updateRoomLists();

            // Auto refresh logs
            setInterval(() => loadTransactions(1), 30000);
        });

        function loadDashboard() {
            $.get('backend/admin_api.php?action=get_dashboard_stats', function(res) {
                if(res.status === 'success') {
                    $('#stat-users').text(res.metrics.users);
                    $('#stat-premium').text(res.metrics.premium);
                    $('#stat-rooms').text(res.metrics.rooms);

                    // Chart
                    const ctx = document.getElementById('admin-activity-chart').getContext('2d');
                    if (activityChart) activityChart.destroy();
                    activityChart = new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: res.activity_chart.map(d => d.date.split('-').slice(1).join('/')),
                            datasets: [{
                                label: 'Global Activity',
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
                        popHtml += `<div style="display:flex; justify-content:space-between; font-size:0.75rem; margin-bottom:5px;">
                            <span>${w.nama_item}</span>
                            <span style="font-weight:bold;">${w.count} instances</span>
                        </div>`;
                    });
                    $('#popular-widgets-list').html(popHtml || '<p style="color:#888;">No widgets spawned yet.</p>');
                }
            });
        }

        function loadUsers(page) {
            let q = $('#user-search').val();
            let limit = $('#user-limit').val();
            $.get(`backend/admin_api.php?action=get_users&page=${page}&search=${q}&limit=${limit}`, function(res) {
                if(res.status === 'success') {
                    let html = '<table><thead><tr><th>User</th><th>Role</th><th>Premium</th><th>Action</th></tr></thead><tbody>';
                    res.data.forEach(u => {
                        let premBadge = u.is_premium ? `<span class="badge badge-premium">Active</span>` : `<span style="color:#ccc;">None</span>`;
                        let roleBadge = u.role === 'admin' ? `<span class="badge badge-admin">Admin</span>` : 'User';

                        html += `<tr>
                            <td style="font-weight:bold;">${u.username}</td>
                            <td>${roleBadge}</td>
                            <td>${premBadge}</td>
                            <td>
                                <button class="btn" style="padding:2px 5px; font-size:0.6rem; background:#28a745;" onclick="givePremium(${u.id})">Grant</button>
                                <button class="btn" style="padding:2px 5px; font-size:0.6rem; background:#dc3545;" onclick="givePremium(${u.id}, 0)">Strip</button>
                            </td>
                        </tr>`;
                    });
                    html += '</tbody></table>';
                    $('#user-list-container').html(html);
                    renderPagination('user', res.pagination, loadUsers);
                }
            });
        }

        function givePremium(id, days = 30) {
            $.ajax({
                url: 'backend/admin_api.php?action=update_user_premium',
                type: 'POST',
                data: JSON.stringify({ id: id, days: days }),
                success: function(res) {
                    if (res.status === 'error') {
                        if (window.showCustomModal) window.showCustomModal('Error', res.message);
                        else alert(res.message);
                    }
                    loadUsers(1);
                    loadDashboard();
                }
            });
        }

        function loadTransactions(page) {
            let limit = $('#trans-limit').val();
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

        function loadItems() {
            $.get('backend/admin_api.php?action=get_items', function(res) {
                if(res.status === 'success') {
                    let html = '<table><thead><tr><th>Icon</th><th>Name</th><th>Type</th><th>Status</th><th>Action</th></tr></thead><tbody>';
                    res.data.forEach(i => {
                        let activeText = i.is_active == 1 ? 'Active' : 'Disabled';
                        let activeColor = i.is_active == 1 ? 'green' : 'red';
                        let btnText = i.is_active == 1 ? 'Disable' : 'Enable';
                        let itemJson = JSON.stringify(i).replace(/'/g, "&#39;");

                        html += `<tr>
                            <td><i class="fas ${i.gambar}"></i></td>
                            <td><span style="font-weight:bold;">${i.nama_item}</span></td>
                            <td>${i.tipe_item}</td>
                            <td style="color:${activeColor}; font-weight:bold;">${activeText}</td>
                            <td>
                                <button class="btn btn-secondary" style="padding:2px 5px; font-size:0.6rem;" onclick='editItem(${itemJson})'>Edit</button>
                                <button class="btn" style="padding:2px 5px; font-size:0.6rem; background:#6c757d;" onclick="toggleItem(${i.id}, ${i.is_active == 1 ? 0 : 1})">${btnText}</button>
                            </td>
                        </tr>`;
                    });
                    html += '</tbody></table>';
                    $('#item-list-container').html(html);
                }
            });
        }

        function toggleItem(id, status) {
            $.get(`backend/admin_api.php?action=toggle_item_status&id=${id}&status=${status}`, () => loadItems());
        }

        function renderPagination(prefix, meta, callback) {
            let html = '';
            const currentPage = meta.current_page;
            const totalPages = meta.total_pages;

            // First page
            html += `<button class="${currentPage === 1 ? 'active' : ''}" onclick="${callback.name}(1)">1</button>`;

            if (currentPage > 3) {
                html += `<span>...</span>`;
            }

            // Middle pages
            let start = Math.max(2, currentPage - 1);
            let end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                html += `<button class="${i === currentPage ? 'active' : ''}" onclick="${callback.name}(${i})">${i}</button>`;
            }

            if (currentPage < totalPages - 2) {
                html += `<span>...</span>`;
            }

            // Last page
            if (totalPages > 1) {
                html += `<button class="${currentPage === totalPages ? 'active' : ''}" onclick="${callback.name}(${totalPages})">${totalPages}</button>`;
            }

            // Jump to page input
            html += `<div style="display:flex; align-items:center; margin-left:10px; gap:5px;">
                <input type="number" id="${prefix}-jump-page" min="1" max="${totalPages}" placeholder="Go" style="width:40px; padding:2px; font-size:0.7rem; border:1px solid #ddd; border-radius:3px;">
                <button style="padding:2px 5px; font-size:0.7rem;" onclick="let p = $('#${prefix}-jump-page').val(); if(p >= 1 && p <= ${totalPages}) ${callback.name}(p);">Jump</button>
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