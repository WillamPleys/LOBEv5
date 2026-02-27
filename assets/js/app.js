$(document).ready(function() {
    const contextMenu = $('#context-menu');
    const loginScreen = $('#login-screen');
    const roomScreen = $('#room-setup-screen');
    const workspaceScreen = $('#workspace-screen');

    // --- ADVERTISEMENT SYSTEM ---
    // Start automatic ads timer (Every 5 minutes = 300000ms)
    setInterval(showAdOverlay, 300000);

    function showAdOverlay() {
        // Only show if user is in workspace
        if(workspaceScreen.is(':visible')) {
            $('#ad-overlay').fadeIn();
            let timeLeft = 5; // 5 seconds ad
            const $timer = $('#ad-timer-count');
            const $btn = $('#ad-close-btn');

            $timer.text(timeLeft);
            $btn.prop('disabled', true).removeClass('active').text(`Wait ${timeLeft}s`);

            let interval = setInterval(() => {
                timeLeft--;
                $timer.text(timeLeft);
                if(timeLeft > 0) {
                     $btn.text(`Wait ${timeLeft}s`);
                } else {
                    clearInterval(interval);
                    $btn.prop('disabled', false).addClass('active').text('Close Advertisement');
                }
            }, 1000);
        }
    }

    // --- LOAD MASTER ITEMS ---
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
                    contextList.append('<div class="context-divider"></div><div class="context-title">Add Item:</div>');

                    res.data.forEach(item => {
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

    loadMasterItems();

    // --- WIDGET SPAWNING LOGIC ---
    let widgetCount = 0;
    let currentTargetWidget = null;

    function spawnWidget(id, name, type) {
        if ($('#welcome-screen').is(':visible')) {
            $('#welcome-screen').fadeOut(300);
        }

        widgetCount++;
        let wId = `widget-${widgetCount}`;
        let isAI = (type === 'api' || type === 'output') ? 'true' : 'false';
        
        // Default size, overridden by widget specific render if needed,
        // but for now keeping it simple. Can be enhanced in widgets.js
        let w = 350; let h = 300;

        let widgetContent = `Modul: ${name} (ID: ${id})<br><small>Loading content...</small>`;

        if (typeof WidgetRegistry !== 'undefined' && WidgetRegistry[name]) {
            if (WidgetRegistry[name].render) {
                widgetContent = WidgetRegistry[name].render(wId);
            }
        } else {
             // Fallback generic content
             widgetContent = `<div style="padding:20px; text-align:center;">
                <i class="fas fa-hammer" style="font-size:3rem; color:#eee; margin-bottom:10px;"></i>
                <p>Feature <b>${name}</b> is ready to use!</p>
             </div>`;
        }

        let html = `
            <div class="lobe-widget" id="${wId}" data-isai="${isAI}" style="width:${w}px; height:${h}px; left: 100px; top: 100px;">
                <div class="widget-header">
                    <span>${name}</span>
                    <span class="widget-close" style="display: none;">&times;</span>
                </div>
                <div class="widget-content" id="content-${wId}">${widgetContent}</div>
            </div>
        `;
        
        $('#workspace-screen').append(html);
        
        // Init Script
        if (typeof WidgetRegistry !== 'undefined' && WidgetRegistry[name]) {
            if (WidgetRegistry[name].init) {
                // Small delay to ensure DOM is ready
                setTimeout(() => {
                    WidgetRegistry[name].init(wId);
                }, 10);
            }
        }

        let newWidget = $(`#${wId}`);

        newWidget.draggable({ 
            handle: ".widget-header", 
            snap: true, 
            snapTolerance: 15,
            containment: "#workspace-screen"
        }).resizable();

        newWidget.on('mousedown', function() {
            $('.lobe-widget').css('z-index', 500);
            $(this).css('z-index', 501);
        });

        // Widget Context Menu
        newWidget.on('contextmenu', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            currentTargetWidget = wId;
            
            if($(this).data('isai') == true || $(this).data('isai') == 'true') { 
                $('.ai-feature').show(); 
            } else { 
                $('.ai-feature').hide(); 
            }
            
            $('#context-menu').hide();
            $('#widget-context-menu').css({ display: 'block', left: e.clientX, top: e.clientY });
        });

        newWidget.find('.widget-close').on('click', function() {
            newWidget.remove();
        });
    }

    $(document).on('click', '.item-btn', function() {
        let id = $(this).data('id');
        let type = $(this).data('type');
        let name = $(this).find('span').text().trim();
        spawnWidget(id, name, type);
    });

    $(document).on('click', '.spawn-item', function() {
        let id = $(this).data('id');
        let type = $(this).data('type');
        let name = $(this).text().trim();
        spawnWidget(id, name, type);
        $('#context-menu').hide();
    });

    $(document).on('click', function(e) {
        if (!$(e.target).closest('.context-menu').length) {
            $('#widget-context-menu').hide();
        }
    });

    $('#toggle-close-btn').on('click', function() {
        if(currentTargetWidget) {
            const closeBtn = $(`#${currentTargetWidget} .widget-close`);
            closeBtn.toggle();
        }
        $('#widget-context-menu').hide();
    });

    // --- CONTEXT MENU GLOBAL ---
    $(document).on('contextmenu', function(e) {
        e.preventDefault();
        if (workspaceScreen.is(':visible')) {
            contextMenu.css({ display: 'block', left: e.clientX, top: e.clientY });
        }
    });

    $(document).on('click', function(e) {
        if (!$(e.target).closest('.context-menu').length) {
            contextMenu.hide();
        }
    });

    // --- AUTH LOGIC ---
    function handleAuth(action, btn) {
        let username = $('#username').val();
        let password = $('#password').val();

        if(username === '' || password === '') {
            $('#auth-message').html('<span style="color:red; font-size:12px;">Username dan password wajib diisi!</span>');
            return;
        }

        let originalText = btn.text();
        btn.text('Processing...').prop('disabled', true);

        $.ajax({
            url: 'backend/auth.php',
            type: 'POST',
            dataType: 'json',
            data: { action: action, username: username, password: password },
            success: function(res) {
                btn.text(originalText).prop('disabled', false);
                
                if(res.status === 'success') {
                    if (action === 'register') {
                        $('#auth-message').html('<span style="color:green; font-size:12px; font-weight:bold;">' + res.message + '</span>');
                        $('#password').val('');
                    } else {
                        if(res.role === 'admin') {
                            window.location.href = 'admin.php'; // Redirect Admin
                        } else {
                            $('#display-user').text(username);
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
                $('#auth-message').html('<span style="color:red; font-size:12px;">Connection failed.</span>');
            }
        });
    }

    $('#btn-login').on('click', function(e) { e.preventDefault(); handleAuth('login', $(this)); });
    $('#btn-register').on('click', function(e) { e.preventDefault(); handleAuth('register', $(this)); });

    // --- CREATE ROOM LOGIC ---
    $('#btn-create-room').on('click', function() {
        let roomName = $('#room-name').val() || 'Empty Room';
        let btn = $(this);
        let originalText = btn.text();
        btn.text('Building...').prop('disabled', true);

        $.ajax({
            url: 'backend/create_room.php',
            type: 'POST',
            dataType: 'json',
            data: { room_name: roomName },
            success: function(res) {
                if(res.status === 'success') {
                    $('#room-selector').html(`<option value="${res.room_id}">${res.room_name}</option><option value="new">+ Create New Room</option>`);

                    roomScreen.fadeOut(300, function() {
                        workspaceScreen.fadeIn(300, function() {
                             // Animate Grid Background Entry
                             $('.grid-background').addClass('active');
                        });
                        $('#up-nav-bar').slideDown(300);
                        setTimeout(() => $('#welcome-screen').fadeIn(800), 500);
                    });
                } else {
                    alert(res.message);
                    btn.text(originalText).prop('disabled', false);
                }
            },
            error: function() {
                alert("Server error.");
                btn.text(originalText).prop('disabled', false);
            }
        });
    });

    // --- LOGOUT ---
    $('#btn-logout').on('click', function() {
        if(confirm('Are you sure you want to logout?')) {
            $.ajax({
                url: 'backend/logout.php',
                type: 'POST',
                success: function() { location.reload(); }
            });
        }
    });
});
