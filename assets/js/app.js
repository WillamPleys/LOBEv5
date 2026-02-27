$(document).ready(function() {
    const contextMenu = $('#context-menu');
    const loginScreen = $('#login-screen');
    const roomScreen = $('#room-setup-screen');
    const workspaceScreen = $('#workspace-screen');

// FUNGSI UNTUK MEMUAT 15 ITEM DARI DATABASE
function loadMasterItems() {
        $.ajax({
            url: 'backend/get_items.php',
            type: 'GET',
            dataType: 'json',
            success: function(res) {
                if (res.status === 'success') {
                    const welcomeContainer = $('#welcome-items');
                    const contextList = $('#menu-items-list');
                    
                    welcomeContainer.empty();
                    contextList.append('<div class="context-divider"></div><div class="context-title">Tambah Item:</div>');

                    res.data.forEach(item => {
                        // Mengambil class ikon (gambar) langsung dari database
                        let iconClass = item.gambar; 

                        // Render ke Welcome Screen
                        welcomeContainer.append(`
                            <div class="item-btn" data-id="${item.id}" data-type="${item.tipe_item}">
                                <i class="fas ${iconClass}"></i>
                                <span>${item.nama_item}</span>
                            </div>
                        `);

                        // Render ke Context Menu
                        contextList.append(`
                            <li class="menu-item spawn-item" data-id="${item.id}" data-type="${item.tipe_item}">
                                <i class="fas ${iconClass}" style="width: 25px;"></i> ${item.nama_item}
                            </li>
                        `);
                    });
                }
            }
        });
    }

    // Panggil fungsi saat aplikasi dimulai
    loadMasterItems();

    // --- 5. LOGIKA MEMBUAT (SPAWN) WIDGET KE KANVAS ---
    let widgetCount = 0;
    let currentTargetWidget = null;

    function spawnWidget(id, name, type) {
        // Hilangkan layar perkenalan IKEA beserta kotak menunya (sesuai instruksimu)
        if ($('#welcome-screen').is(':visible')) {
            $('#welcome-screen').fadeOut(300);
        }

        widgetCount++;
        let wId = `widget-${widgetCount}`;
        
        // Identifikasi apakah ini item AI/Output untuk memunculkan menu khusus
        let isAI = (type === 'api' || type === 'output') ? 'true' : 'false';
        
        // Ukuran default jendela
        let w = 300; let h = 250;

        let html = `
            <div class="lobe-widget" id="${wId}" data-isai="${isAI}" style="width:${w}px; height:${h}px; left: 100px; top: 100px;">
                <div class="widget-header">
                    <span>${name}</span>
                    <span class="widget-close" style="display: none;">&times;</span>
                </div>
                <div class="widget-content">Modul: ${name} (Data ID: ${id})<br><br><small>Konten dinamis akan dimuat di sini.</small></div>
            </div>
        `;
        
        $('#workspace-screen').append(html);
        
        let newWidget = $(`#${wId}`);

        // Jadikan Draggable (Bisa dipindah) & Resizable (Bisa diubah ukuran)
        // Fitur snap akan menempelkan widget ke garis grid
        newWidget.draggable({ 
            handle: ".widget-header", 
            snap: true, 
            snapTolerance: 15,
            containment: "#workspace-screen" // Agar tidak keluar dari layar
        }).resizable();

        // Bawa widget ke depan saat di-klik (Z-Index logic)
        newWidget.on('mousedown', function() {
            $('.lobe-widget').css('z-index', 500);
            $(this).css('z-index', 501);
        });

        // Event Klik Kanan khusus pada Widget ini
        newWidget.on('contextmenu', function(e) {
            e.preventDefault();
            e.stopPropagation(); // Mencegah klik kanan tembus ke kanvas utama
            
            currentTargetWidget = wId;
            
            // Cek apakah ini modul AI / Output Field
            if($(this).data('isai') == true || $(this).data('isai') == 'true') { 
                $('.ai-feature').show(); 
            } else { 
                $('.ai-feature').hide(); 
            }
            
            // Sembunyikan menu utama, munculkan menu widget
            $('#context-menu').hide();
            $('#widget-context-menu').css({ display: 'block', left: e.clientX, top: e.clientY });
        });

        // Logika tombol silang (Hapus widget)
        newWidget.find('.widget-close').on('click', function() {
            newWidget.remove();
        });
    }

    // Tangkap klik pada kotak item di Welcome Screen
    $(document).on('click', '.item-btn', function() {
        let id = $(this).data('id');
        let type = $(this).data('type');
        let name = $(this).find('span').text().trim();
        spawnWidget(id, name, type);
    });

    // Tangkap klik pada menu items di Context Menu (Klik Kanan Layar Utama)
    $(document).on('click', '.spawn-item', function() {
        let id = $(this).data('id');
        let type = $(this).data('type');
        let name = $(this).text().trim();
        spawnWidget(id, name, type);
        $('#context-menu').hide(); // Tutup context menu setelah klik
    });

    // Menutup widget-context-menu jika klik sembarang
    $(document).on('click', function(e) {
        if (!$(e.target).closest('.context-menu').length) {
            $('#widget-context-menu').hide();
        }
    });

    // Logika "Toggle Close Button" dari Context Menu Widget
    $('#toggle-close-btn').on('click', function() {
        if(currentTargetWidget) {
            const closeBtn = $(`#${currentTargetWidget} .widget-close`);
            closeBtn.toggle(); // Munculkan / Sembunyikan
        }
        $('#widget-context-menu').hide();
    });

    // --- 1. LOGIKA CONTEXT MENU (KLIK KANAN DI KANVAS) ---
    $(document).on('contextmenu', function(e) {
        e.preventDefault();
        
        // Hanya aktif di workspace
        if (workspaceScreen.is(':visible')) {
            contextMenu.css({
                display: 'block',
                left: e.clientX + 'px',
                top: e.clientY + 'px'
            });
        }
    });

    $(document).on('click', function(e) {
        if (!$(e.target).closest('.context-menu').length) {
            contextMenu.hide();
        }
    });

// --- 2. LOGIKA AJAX LOGIN / REGISTER ---
    function handleAuth(action, btn) {
        let username = $('#username').val();
        let password = $('#password').val();

        if(username === '' || password === '') {
            $('#auth-message').html('<span style="color:red; font-size:12px;">Username dan password wajib diisi!</span>');
            return;
        }

        let originalText = btn.text();
        btn.text('Memproses...').prop('disabled', true);

        $.ajax({
            url: 'backend/auth.php',
            type: 'POST',
            dataType: 'json',
            data: { action: action, username: username, password: password },
            success: function(res) {
                btn.text(originalText).prop('disabled', false);
                
                if(res.status === 'success') {
                    if (action === 'register') {
                        // Jika register berhasil, beri tahu user dan kosongkan password
                        $('#auth-message').html('<span style="color:green; font-size:12px; font-weight:bold;">' + res.message + '</span>');
                        $('#password').val('');
                    } else {
                        // Jika login berhasil
                        $('#display-user').text(username);
                        
                        if(res.role === 'admin') {
                            alert('Selamat datang Admin! (Panel Admin akan segera dibuat)');
                        } else {
                            // Transisi Layar: Login -> Setup Room
                            loginScreen.fadeOut(300, function() {
                                roomScreen.css('display', 'flex').hide().fadeIn(300);
                            });
                        }
                    }
                } else {
                    $('#auth-message').html('<span style="color:red; font-size:12px;">' + res.message + '</span>');
                }
            },
            error: function() {
                btn.text(originalText).prop('disabled', false);
                $('#auth-message').html('<span style="color:red; font-size:12px;">Koneksi ke server gagal.</span>');
            }
        });
    }

    // Pisahkan event klik berdasarkan tombol
    $('#btn-login').on('click', function(e) {
        e.preventDefault();
        handleAuth('login', $(this));
    });

    $('#btn-register').on('click', function(e) {
        e.preventDefault();
        handleAuth('register', $(this));
    });

    // --- 3. LOGIKA AJAX BUAT ROOM ---
    $('#btn-create-room').on('click', function() {
        let roomName = $('#room-name').val() || 'Ruang Kosong';
        let btn = $(this);
        let originalText = btn.text();
        btn.text('Menyiapkan...').prop('disabled', true);

        $.ajax({
            url: 'backend/create_room.php',
            type: 'POST',
            dataType: 'json',
            data: { room_name: roomName },
            success: function(res) {
                if(res.status === 'success') {
                    
                    $('#room-selector').html(`<option value="${res.room_id}">${res.room_name}</option><option value="new">+ Create New Room</option>`);

                    // Transisi Layar: Setup Room -> Workspace
                    roomScreen.fadeOut(300, function() {
                        workspaceScreen.fadeIn(300);
                        $('#up-nav-bar').slideDown(300);
                        setTimeout(() => $('#welcome-screen').fadeIn(500), 200);
                    });

                } else {
                    alert(res.message);
                    btn.text(originalText).prop('disabled', false);
                }
            },
            error: function() {
                alert("Gagal menghubungi server.");
                btn.text(originalText).prop('disabled', false);
            }
        });
    });

    // --- 4. LOGIKA LOGOUT ---
        $('#btn-logout').on('click', function() {
            if(confirm('Apakah kamu yakin ingin keluar?')) {
                $.ajax({
                    url: 'backend/logout.php',
                    type: 'POST',
                    success: function() {
                        location.reload(); // Reload halaman untuk kembali ke layar login
                    }
                });
            }
        });



});