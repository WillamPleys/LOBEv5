$(document).ready(function() {
    const contextMenu = $('#context-menu');
    const loginScreen = $('#login-screen');
    const roomScreen = $('#room-setup-screen');
    const workspaceScreen = $('#workspace-screen');

    // --- SESSION MANAGEMENT ---
    if (typeof INITIAL_STATE !== 'undefined' && INITIAL_STATE.isLoggedIn) {
        // User is already logged in, skip login screen
        loginScreen.hide();
        $('#display-user').text(INITIAL_STATE.username);
        // Show Room Setup
        roomScreen.css('display', 'flex');
    }

    // --- CUSTOM ALERT ---
    window.showCustomModal = function(title, message) {
        $('#modal-title').text(title);
        $('#modal-message').html(message); // Using html() to allow formatting
        $('#custom-modal').css('display', 'flex');
    };

    // --- ADVERTISEMENT SYSTEM (TOAST) ---
    setInterval(showAdToast, 300000);

    function showAdToast() {
        if(workspaceScreen.is(':visible')) {
            $('#ad-notification').fadeIn().css('display', 'flex');
            // Auto hide after 10 seconds if not closed
            setTimeout(() => { $('#ad-notification').fadeOut(); }, 10000);
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

    // Added coordinates for spawning near mouse
    function spawnWidget(id, name, type, x = 100, y = 100) {
        if ($('#welcome-screen').is(':visible')) {
            $('#welcome-screen').fadeOut(300);
        }

        widgetCount++;
        let wId = `widget-${widgetCount}`;
        let isAI = (type === 'api' || type === 'output') ? 'true' : 'false';
        
        let w = 350; let h = 300;

        let widgetContent = `Modul: ${name} (ID: ${id})<br><small>Loading content...</small>`;

        if (typeof WidgetRegistry !== 'undefined' && WidgetRegistry[name]) {
            if (WidgetRegistry[name].render) {
                widgetContent = WidgetRegistry[name].render(wId);
            }
        } else {
             widgetContent = `<div style="padding:20px; text-align:center;">
                <i class="fas fa-hammer" style="font-size:3rem; color:#eee; margin-bottom:10px;"></i>
                <p>Feature <b>${name}</b> is ready to use!</p>
             </div>`;
        }

        // Add fade-in animation class
        let html = `
            <div class="lobe-widget fade-in" id="${wId}" data-isai="${isAI}" style="width:${w}px; height:${h}px; left: ${x}px; top: ${y}px;">
                <div class="widget-header">
                    <span>${name}</span>
                    <span class="widget-close" style="display: none;">&times;</span>
                </div>
                <div class="widget-content" id="content-${wId}">${widgetContent}</div>
            </div>
        `;
        
        $('#workspace-screen').append(html);
        
        // Remove animation class after animation completes to avoid interference
        setTimeout(() => { $(`#${wId}`).removeClass('fade-in'); }, 500);

        if (typeof WidgetRegistry !== 'undefined' && WidgetRegistry[name]) {
            if (WidgetRegistry[name].init) {
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
        // Default position for welcome screen items
        spawnWidget(id, name, type, 200, 200);
    });

    // Capture context menu position
    let contextMenuPos = { x: 0, y: 0 };

    $(document).on('click', '.spawn-item', function() {
        let id = $(this).data('id');
        let type = $(this).data('type');
        let name = $(this).text().trim();
        // Spawn near where context menu was opened
        spawnWidget(id, name, type, contextMenuPos.x, contextMenuPos.y);
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
            // Save coordinates
            contextMenuPos.x = e.clientX;
            contextMenuPos.y = e.clientY;

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
                            window.location.href = 'admin.php';
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

    // --- CUSTOM SELECT DROPDOWN LOGIC ---
    // Toggle dropdown
    $('.custom-select-trigger').on('click', function() {
        $(this).parents('.custom-select-wrapper').find('.custom-options').toggleClass('open');
    });

    // Close when clicking outside
    $(document).on('click', function(e) {
        if(!$(e.target).closest('.custom-select-wrapper').length) {
            $('.custom-options').removeClass('open');
        }
    });

    // Handle Option Click
    $(document).on('click', '.custom-option', function() {
        let value = $(this).data('value');
        let text = $(this).text();

        if (value === 'new') {
            // Logic to create new room (reset to room setup screen)
            workspaceScreen.fadeOut(300, function() {
                roomScreen.fadeIn(300);
                $('#welcome-screen').hide();
                $('.grid-background').removeClass('active');
            });
        } else {
            // Switch room logic
            $('#current-room-name').text(text);
            // Here you would implement room switching (loading widgets for that room)
            // For now, we simulate a refresh of the workspace
            window.showCustomModal("Room Switch", "Switched to room: " + text);
        }
        $('.custom-options').removeClass('open');
    });

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
                    // Add to Custom Select
                    $('.custom-options').append(`<span class="custom-option" data-value="${res.room_id}">${res.room_name}</span>`);
                    $('#current-room-name').text(res.room_name);

                    roomScreen.fadeOut(300, function() {
                        workspaceScreen.fadeIn(300, function() {
                             $('.grid-background').addClass('active');
                        });
                        $('#up-nav-bar').slideDown(300);
                        setTimeout(() => $('#welcome-screen').fadeIn(800), 500);
                    });
                } else {
                    window.showCustomModal('Error', res.message);
                    btn.text(originalText).prop('disabled', false);
                }
            },
            error: function() {
                window.showCustomModal('Error', "Server error.");
                btn.text(originalText).prop('disabled', false);
            }
        });
    });

    // --- LOGOUT ---
    $('#btn-logout').on('click', function() {
        // Using confirm is native, but user asked for no alerts. We'll use the modal but it needs a callback system.
        // For simplicity with current modal design, we'll just logout instantly or use a better modal library later.
        // Let's implement a simple confirm flow manually or just logout.

        // Since `window.confirm` is still technically an alert/blocking,
        // we will just logout directly to comply strictly with "no native alerts".
        $.ajax({
            url: 'backend/logout.php',
            type: 'POST',
            success: function() { location.reload(); }
        });
    });
});
