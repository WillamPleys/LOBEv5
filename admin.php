<?php
session_start();
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    header("Location: index.php");
    exit;
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LOBE - Admin Panel</title>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        body {
            background-color: #f0f2f5;
            font-family: 'Roboto', sans-serif;
            margin: 0;
            overflow: hidden; /* Fix for window system */
        }

        .admin-workspace {
            width: 100vw;
            height: 100vh;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            grid-template-rows: repeat(2, 1fr);
            gap: 20px;
            padding: 20px;
            box-sizing: border-box;
        }

        .admin-window {
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            border: 1px solid #ddd;
        }

        .window-header {
            background: #f8f9fa;
            padding: 10px 15px;
            border-bottom: 1px solid #eee;
            font-weight: bold;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .window-content {
            flex: 1;
            padding: 15px;
            overflow-y: auto;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.9rem;
        }

        th, td {
            text-align: left;
            padding: 10px;
            border-bottom: 1px solid #eee;
        }

        th {
            background-color: #fafafa;
            color: #555;
        }

        .pagination {
            display: flex;
            justify-content: flex-end;
            margin-top: 10px;
            gap: 5px;
        }

        .pagination button {
            padding: 5px 10px;
            border: 1px solid #ddd;
            background: white;
            cursor: pointer;
            border-radius: 4px;
        }

        .pagination button:hover {
            background: #f0f0f0;
        }

        .pagination button.active {
            background: #007bff;
            color: white;
            border-color: #007bff;
        }

        /* Modal Styles */
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.5);
            justify-content: center;
            align-items: center;
        }

        .modal-content {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            width: 400px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }

        .form-group {
            margin-bottom: 15px;
        }

        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-size: 0.9rem;
        }

        .form-group input, .form-group select, .form-group textarea {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-sizing: border-box;
        }

        .btn {
            padding: 8px 15px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.9rem;
        }

        .btn-primary { background: #007bff; color: white; }
        .btn-danger { background: #dc3545; color: white; }
        .btn-secondary { background: #6c757d; color: white; }

    </style>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
</head>
<body>

    <div class="admin-workspace">

        <!-- Window 1: User Management -->
        <div class="admin-window" style="grid-column: 1 / 2; grid-row: 1 / 3;">
            <div class="window-header">
                <span><i class="fas fa-users"></i> User Management</span>
            </div>
            <div class="window-content" id="user-list-container">
                Loading...
            </div>
            <div style="padding: 10px; border-top: 1px solid #eee;">
                 <div class="pagination" id="user-pagination"></div>
            </div>
        </div>

        <!-- Window 2: Transaction Logs -->
        <div class="admin-window" style="grid-column: 2 / 4; grid-row: 1 / 2;">
            <div class="window-header">
                <span><i class="fas fa-history"></i> Transaction Logs</span>
            </div>
            <div class="window-content" id="transaction-list-container">
                Loading...
            </div>
             <div style="padding: 10px; border-top: 1px solid #eee;">
                 <div class="pagination" id="trans-pagination"></div>
            </div>
        </div>

        <!-- Window 3: Master Items (Products) -->
        <div class="admin-window" style="grid-column: 2 / 4; grid-row: 2 / 3;">
            <div class="window-header">
                <span><i class="fas fa-cubes"></i> Master Items (Products)</span>
                <button class="btn btn-primary" onclick="openItemModal()">+ Add New Item</button>
            </div>
            <div class="window-content" id="item-list-container">
                Loading...
            </div>
        </div>

    </div>

    <!-- Modal for Create/Edit Item -->
    <div id="item-modal" class="modal">
        <div class="modal-content">
            <h3 id="modal-title">Add New Item</h3>
            <form id="item-form">
                <input type="hidden" id="item-id">
                <div class="form-group">
                    <label>Nama Item</label>
                    <input type="text" id="item-name" required>
                </div>
                <div class="form-group">
                    <label>Deskripsi</label>
                    <textarea id="item-desc" rows="3" required></textarea>
                </div>
                <div class="form-group">
                    <label>Tipe Item</label>
                    <select id="item-type">
                        <option value="ui">UI Component</option>
                        <option value="input">Input Tool</option>
                        <option value="output">Output Display</option>
                        <option value="tools">Utility Tool</option>
                        <option value="api">AI / API Feature</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Icon Class (FontAwesome)</label>
                    <input type="text" id="item-icon" placeholder="fa-cube" required>
                </div>
                <div style="text-align: right;">
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save</button>
                </div>
            </form>
        </div>
    </div>

    <script>
        $(document).ready(function() {
            loadUsers(1);
            loadTransactions(1);
            loadItems();
        });

        function escapeHtml(text) {
            if (text == null) return '';
            return String(text)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        // --- USERS ---
        function loadUsers(page) {
            $.get('backend/admin_api.php?action=get_users&page=' + page, function(res) {
                if(res.status === 'success') {
                    let html = '<table><thead><tr><th>ID</th><th>Username</th><th>Role</th></tr></thead><tbody>';
                    res.data.forEach(u => {
                        html += `<tr><td>${u.id}</td><td>${escapeHtml(u.username)}</td><td><span class="badge">${escapeHtml(u.role)}</span></td></tr>`;
                    });
                    html += '</tbody></table>';
                    $('#user-list-container').html(html);
                    renderPagination('user', res.pagination, loadUsers);
                }
            });
        }

        // --- TRANSACTIONS ---
        function loadTransactions(page) {
            $.get('backend/admin_api.php?action=get_transactions&page=' + page, function(res) {
                if(res.status === 'success') {
                    let html = '<table><thead><tr><th>Date</th><th>User</th><th>Activity</th><th>Detail</th></tr></thead><tbody>';
                    res.data.forEach(t => {
                        html += `<tr>
                            <td>${t.waktu_transaksi}</td>
                            <td>${escapeHtml(t.username || 'Guest')}</td>
                            <td>${escapeHtml(t.jenis_aktivitas)}</td>
                            <td>${escapeHtml(t.detail_aktivitas)}</td>
                        </tr>`;
                    });
                    html += '</tbody></table>';
                    $('#transaction-list-container').html(html);
                    renderPagination('trans', res.pagination, loadTransactions);
                }
            });
        }

        // --- ITEMS ---
        function loadItems() {
            $.get('backend/admin_api.php?action=get_items', function(res) {
                if(res.status === 'success') {
                    let html = '<table><thead><tr><th>Icon</th><th>Name</th><th>Type</th><th>Actions</th></tr></thead><tbody>';
                    res.data.forEach(i => {
                        // We serialize the item object for the onclick handler, but be careful with quotes
                        // Ideally we fetch details by ID when clicking edit, but for simplicity here:
                        let itemJson = JSON.stringify(i).replace(/'/g, "&#39;");

                        html += `<tr>
                            <td><i class="fas ${escapeHtml(i.gambar)}"></i></td>
                            <td>${escapeHtml(i.nama_item)}<br><small>${escapeHtml(i.deskripsi)}</small></td>
                            <td>${escapeHtml(i.tipe_item)}</td>
                            <td>
                                <button class="btn btn-secondary" onclick='editItem(${itemJson})'><i class="fas fa-edit"></i></button>
                                <button class="btn btn-danger" onclick="deleteItem(${i.id})"><i class="fas fa-trash"></i></button>
                            </td>
                        </tr>`;
                    });
                    html += '</tbody></table>';
                    $('#item-list-container').html(html);
                }
            });
        }

        // --- PAGINATION HELPER ---
        function renderPagination(prefix, meta, callback) {
            let html = '';
            for(let i=1; i<=meta.total_pages; i++) {
                let active = i === meta.current_page ? 'active' : '';
                html += `<button class="${active}" onclick="${callback.name}(${i})">${i}</button>`;
            }
            $('#' + prefix + '-pagination').html(html);
        }

        // --- MODAL LOGIC ---
        function openItemModal() {
            $('#modal-title').text('Add New Item');
            $('#item-id').val('');
            $('#item-form')[0].reset();
            $('#item-modal').css('display', 'flex');
        }

        function closeModal() {
            $('#item-modal').hide();
        }

        function editItem(item) {
            $('#modal-title').text('Edit Item');
            $('#item-id').val(item.id);
            $('#item-name').val(item.nama_item);
            $('#item-desc').val(item.deskripsi);
            $('#item-type').val(item.tipe_item);
            $('#item-icon').val(item.gambar);
            $('#item-modal').css('display', 'flex');
        }

        function deleteItem(id) {
            if(confirm('Are you sure you want to delete this item?')) {
                $.get('backend/admin_api.php?action=delete_item&id=' + id, function(res) {
                    loadItems();
                });
            }
        }

        $('#item-form').on('submit', function(e) {
            e.preventDefault();
            let id = $('#item-id').val();
            let action = id ? 'update_item' : 'create_item';

            let data = {
                id: id,
                nama_item: $('#item-name').val(),
                deskripsi: $('#item-desc').val(),
                tipe_item: $('#item-type').val(),
                gambar: $('#item-icon').val()
            };

            $.ajax({
                url: 'backend/admin_api.php?action=' + action,
                type: 'POST',
                data: JSON.stringify(data),
                contentType: 'application/json',
                success: function(res) {
                    closeModal();
                    loadItems();
                }
            });
        });

        // Close modal on click outside
        $(window).on('click', function(e) {
            if ($(e.target).is('.modal')) {
                closeModal();
            }
        });

    </script>
</body>
</html>