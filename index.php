<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LOBE - Design Your Needs</title>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/style.css">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <script src="https://code.jquery.com/ui/1.13.2/jquery-ui.min.js"></script>
    <link rel="stylesheet" href="https://code.jquery.com/ui/1.13.2/themes/base/jquery-ui.css">
</head>
<body>

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
            <input type="text" id="room-name" placeholder="Nama Room..." required>
            <button type="button" id="btn-create-room" class="btn-primary" style="width: 100%;">Mulai Membangun</button>
        </div>
    </div>

    <div id="workspace-screen" class="screen" style="display: none;">
        <div id="canvas" class="grid-background">
            
    <nav id="up-nav-bar" class="navbar" style="display: none;">
                    <div class="nav-logo">LOBE</div>
                    <div class="nav-center">
                        <select id="room-selector">
                            <option value="new">+ Create New Room</option>
                        </select>
                    </div>
                    <div class="nav-profile">
                        <i class="fas fa-user-circle" style="font-size: 1.2rem;"></i> 
                        <span id="display-user">Guest</span>
                        <button id="btn-logout" style="padding: 5px 10px; font-size: 12px; border-radius: 4px; border: 1px solid #ddd; background: #fff; cursor: pointer;">Logout</button>
                    </div>
    </nav>

            <div id="welcome-screen" style="display: none;">
                <h1 class="ikea-font">Let’s create your room!</h1>
                <div class="item-grid-container" id="welcome-items">
                    </div>
            </div>
            
        </div>

        <div id="context-menu" class="context-menu" style="display: none;">
            <ul id="menu-items-list">
                <li class="menu-item" id="menu-login" style="display:none;">Login / Register</li>
            </ul>
        </div>

        <div id="widget-context-menu" class="context-menu" style="display: none;">
                <div class="context-item" id="toggle-close-btn"><i class="fas fa-power-off"></i> Toggle Close Button</div>
                <div class="context-divider ai-feature" style="display:none;"></div>
                <div class="context-item ai-feature" style="display:none;"><i class="fas fa-link"></i> Set as Output of...</div>
            </div>
    </div>

    <script src="assets/js/app.js"></script>
</body>
</html>