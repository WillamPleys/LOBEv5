$(document).ready(function() {
    const contextMenu = $('#context-menu');
    const loginScreen = $('#login-screen');
    const roomScreen = $('#room-setup-screen');
    const workspaceScreen = $('#workspace-screen');

    let widgetCount = 0;
    let currentTargetWidget = null;
    let saveTimeout = null;
    let isWorkspaceLoaded = false; // Flag to prevent overwriting empty state on load failure

    // --- CUSTOM ALERT ---
    window.showCustomModal = function(title, message) {
        $('#modal-title').text(title);
        $('#modal-message').html(message);
        $('#modal-actions-default').show();
        $('#modal-actions-confirm').hide();
        $('#custom-modal').css('display', 'flex');
    };

    window.showConfirmModal = function(title, message, onConfirm) {
        $('#modal-title').text(title);
        $('#modal-message').html(message);
        $('#modal-actions-default').hide();
        $('#modal-actions-confirm').show();

        // Remove previous handlers to prevent stacking
        $('#btn-confirm-yes').off('click').on('click', function() {
            $('#custom-modal').hide();
            if(onConfirm) onConfirm();
        });

        $('#custom-modal').css('display', 'flex');
    }

    // --- ADVERTISEMENT SYSTEM (TOAST) ---
    window.showAdToast = function() {
        if(workspaceScreen.is(':visible')) {
            $('#ad-notification').fadeIn().css('display', 'flex');
            setTimeout(() => { $('#ad-notification').fadeOut(); }, 10000);
        }
    }
    setInterval(window.showAdToast, 120000);

    // --- STATE MANAGEMENT & SAVING ---
    // Debounce save function to auto-save changes
    window.saveWorkspaceState = function() {
        if (!isWorkspaceLoaded) return; // Don't save if we haven't successfully loaded yet

        if (saveTimeout) clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            let widgets = [];
            $('.lobe-widget').each(function() {
                let $el = $(this);
                let pos = $el.position();

                // Collect specific content data if widget supports it
                // We rely on widgets having input fields or state that we can serialize.
                // For now, widgets.js logic handles internal state but save_widgets expects 'content_data'.
                // Ideally, each widget should expose a .getState() method.
                // Since that refactor is large, we focus on position/size which was the user complaint.
                // BUT user said "tidak tersave... harus klik kanan". This implies content too?
                // "membuat item baru atau memindahkan item baru... tidak tersave" -> Position/Existence.

                widgets.push({
                    id: $el.attr('id'),
                    master_id: $el.data('master-id'),
                    x: pos.left,
                    y: pos.top,
                    w: $el.width(),
                    h: $el.height(),
                    content_data: {} // Placeholder for advanced content persistence
                });
            });

            $.ajax({
                url: 'backend/save_widgets.php',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ widgets: widgets }),
                success: function() { console.log('Auto-Saved Workspace'); }
            });
        }, 500); // Reduce debounce time for responsiveness
    }

    // --- WIDGET SPAWNING LOGIC ---
    function spawnWidget(id, name, type, x = 100, y = 100, w = 350, h = 300, animate = true) {
        if ($('#welcome-screen').is(':visible')) { $('#welcome-screen').fadeOut(300); }
        widgetCount++;
        let wId = `widget-${widgetCount}`;
        let isAI = (type === 'api' || type === 'output') ? 'true' : 'false';

        let widgetContent = `Modul: ${name} (ID: ${id})<br><small>Loading content...</small>`;

        if (typeof WidgetRegistry !== 'undefined' && WidgetRegistry[name]) {
            if (WidgetRegistry[name].render) widgetContent = WidgetRegistry[name].render(wId);
        } else {
             widgetContent = `<div style="padding:20px; text-align:center;"><i class="fas fa-hammer" style="font-size:3rem; color:#eee; margin-bottom:10px;"></i><p>Feature <b>${name}</b> is ready to use!</p></div>`;
        }

        if (y < 70) y = 70;

        let animClass = animate ? 'fade-in' : '';
        let html = `<div class="lobe-widget ${animClass}" id="${wId}" data-isai="${isAI}" data-master-id="${id}" style="width:${w}px; height:${h}px; left: ${x}px; top: ${y}px;"><div class="widget-header"><span>${name}</span><span class="widget-close" style="display: none;">&times;</span></div><div class="widget-content" id="content-${wId}">${widgetContent}</div></div>`;
        
        $('#workspace-screen').append(html);
        if(animate) setTimeout(() => { $(`#${wId}`).removeClass('fade-in'); }, 500);

        if (typeof WidgetRegistry !== 'undefined' && WidgetRegistry[name]) {
            if (WidgetRegistry[name].init) setTimeout(() => { WidgetRegistry[name].init(wId); }, 10);
        }

        let newWidget = $(`#${wId}`);
        newWidget.draggable({
            handle: ".widget-header",
            snap: true,
            snapTolerance: 15,
            // Dynamic containment calculation to keep widget within window (minus navbar 60px)
            // containment: [x1, y1, x2, y2]
            containment: "window",
            // "window" works but sometimes we need manual coordinates if parent is body.
            // Let's stick to "window" which is standard jQuery UI, or calculate strict bounds.
            // User requirement: "item tidak bisa di letakan di luar grid".
            // The grid is full screen.
            containment: [0, 60, $(window).width() - w, $(window).height() - h],
            start: function(event, ui) {
                 // Recalculate containment on start to account for resize
                 let currentW = $(this).width();
                 let currentH = $(this).height();
                 $(this).draggable("option", "containment", [0, 60, $(window).width() - currentW, $(window).height() - currentH]);
            },
            stop: saveWorkspaceState
        }).resizable({
            // Ensure resize doesn't push it out
            containment: "document",
            stop: saveWorkspaceState
        });

        newWidget.on('mousedown', function() { $('.lobe-widget').css('z-index', 500); $(this).css('z-index', 501); });

        newWidget.on('contextmenu', function(e) {
            e.preventDefault(); e.stopPropagation();
            currentTargetWidget = wId;
            if($(this).data('isai') == true || $(this).data('isai') == 'true') { $('.ai-feature').show(); } else { $('.ai-feature').hide(); }
            $('#context-menu').hide();

            // Context Menu Positioning Logic
            const menu = $('#widget-context-menu');
            menu.show(); // Show first to get dimensions
            let menuWidth = menu.outerWidth();
            let menuHeight = menu.outerHeight();
            let winWidth = $(window).width();
            let winHeight = $(window).height();

            let left = e.clientX;
            let top = e.clientY;

            if (left + menuWidth > winWidth) left = left - menuWidth;
            if (top + menuHeight > winHeight) top = top - menuHeight;

            menu.css({ display: 'block', left: left, top: top });
        });

        newWidget.find('.widget-close').on('click', function() {
            newWidget.remove();
            saveWorkspaceState();
        });

        // Only save if this was a user action (animate=true), not a load action
        if(animate && isWorkspaceLoaded) saveWorkspaceState();
    }

    // --- LOADING WORKSPACE ---
    function loadWorkspaceState() {
        // Clear existing widgets first
        $('.lobe-widget').remove();

        $.ajax({
            url: 'backend/get_widgets.php',
            type: 'GET',
            success: function(res) {
                if (res.status === 'success') {
                    isWorkspaceLoaded = true; // Mark as loaded
                    if (res.data.length > 0) {
                        $('#welcome-screen').hide();
                        res.data.forEach(w => {
                            spawnWidget(w.master_item_id, w.nama_item, w.tipe_item, w.pos_x, w.pos_y, w.width, w.height, false);
                        });
                    } else {
                        $('#welcome-screen').show(); // Show welcome if room empty
                    }
                } else {
                    console.error("Failed to load widgets:", res.message);
                    window.showCustomModal('Error', 'Failed to load workspace state. Please refresh.');
                }
            },
            error: function() {
                console.error("Failed to load widgets (Network/Server Error)");
                window.showCustomModal('Error', 'Failed to load workspace state. Please refresh.');
            }
        });
    }

    // --- GLOBAL FUNCTIONS (HOISTING FIX) ---
    window.deleteRoom = function(roomId, roomName) {
        window.showConfirmModal(
            'Delete Room',
            `Are you sure you want to delete room "<b>${roomName}</b>"? This cannot be undone.`,
            function() {
                $.ajax({
                    url: 'backend/delete_room.php',
                    type: 'POST',
                    dataType: 'json',
                    data: { room_id: roomId },
                    success: function(res) {
                        if(res.status === 'success') {
                            window.showCustomModal('Success', 'Room deleted successfully.');
                            if(res.switched_to) {
                                switchRoom(res.switched_to.id, res.switched_to.nama_room);
                            }
                            updateRoomLists();
                        } else {
                            window.showCustomModal('Error', res.message);
                        }
                    },
                    error: function() { window.showCustomModal('Error', 'Failed to delete room.'); }
                });
            }
        );
    };

    window.switchRoom = function(roomId, roomName) {
        // 1. Save current state before switching
        saveWorkspaceState();

        // 2. Set new active room in session
        $.ajax({
            url: 'backend/set_active_room.php',
            type: 'POST',
            data: { room_id: roomId, room_name: roomName },
            dataType: 'json',
            success: function(res) {
                if(res.status === 'success') {
                    // 3. Update UI & Load new state
                    $('.lobe-widget').remove();
                    $('#current-room-name').text(roomName);
                    loadWorkspaceState(); // This now fetches widgets for the NEW room
                } else {
                    window.showCustomModal('Error', 'Failed to switch room: ' + res.message);
                }
            },
            error: function() {
                 window.showCustomModal('Error', 'Failed to switch room (Network Error).');
            }
        });
    };

    window.updateRoomLists = function() {
        $.ajax({
            url: 'backend/get_user_rooms.php',
            type: 'GET',
            dataType: 'json',
            success: function(res) {
                if(res.status === 'success') {
                    const rooms = res.data;
                    const canDelete = rooms.length > 1;

                    // 1. Update Navbar Options
                    const navOptions = $('.custom-options');
                    navOptions.empty();
                    navOptions.append(`<span class="custom-option" data-value="new">+ Create New Room</span>`);

                    rooms.forEach(room => {
                        let safeRoom = $('<div/>').text(room.nama_room).html();
                        // Increased hit area for delete button (using padding and larger wrapper)
                        let deleteBtn = canDelete ? `<span onclick="event.stopPropagation(); deleteRoom('${room.id}', '${safeRoom}')" style="margin-left:auto; cursor:pointer; padding:5px 10px; display:inline-block;" title="Delete Room"><i class="fas fa-trash-alt" style="color:#ff4d4d; font-size:0.9rem;"></i></span>` : '';

                        // Custom Option with Delete Button
                        let optionHtml = `
                            <div class="custom-option" data-value="${room.id}" style="display:flex; align-items:center; justify-content:space-between; padding-right:5px;">
                                <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:80%;">${safeRoom}</span>
                                ${deleteBtn}
                            </div>
                        `;
                        navOptions.append(optionHtml);
                    });

                    // 2. Update Sidebar Widget (if active)
                    $('.lobe-widget').each(function() {
                        if ($(this).find('.widget-header span').text() === 'Sidebar Navigation') {
                            const list = $(this).find('ul');
                            list.empty();
                            rooms.forEach(room => {
                                let safeRoom = $('<div/>').text(room.nama_room).html();
                                // Same hit area improvement for sidebar
                                let deleteBtn = canDelete ? `<span onclick="event.stopPropagation(); deleteRoom('${room.id}', '${safeRoom}')" style="float:right; cursor:pointer; padding:2px 8px;" title="Delete Room"><i class="fas fa-trash-alt" style="color:#ff4d4d;"></i></span>` : '';

                                list.append(`<li style="padding:8px; border-bottom:1px solid #eee; cursor:pointer; display:flex; justify-content:space-between; align-items:center;" onclick="switchRoom('${room.id}', '${safeRoom}')">
                                    <span><i class="fas fa-door-open"></i> ${safeRoom}</span>
                                    ${deleteBtn}
                                </li>`);
                            });
                        }
                    });
                }
            },
            error: function(e) {
                console.error("Failed to fetch user rooms:", e);
            }
        });
    };

    // --- LOAD MASTER ITEMS (Welcome Screen) ---
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
                        welcomeContainer.append(`<div class="item-btn" data-id="${item.id}" data-type="${item.tipe_item}"><i class="fas ${iconClass}"></i><span>${item.nama_item}</span></div>`);
                        contextList.append(`<li class="menu-item spawn-item" data-id="${item.id}" data-type="${item.tipe_item}"><i class="fas ${iconClass}" style="width: 25px;"></i> ${item.nama_item}</li>`);
                    });
                }
            }
        });
    }

    // --- EXECUTE INITIAL LOGIC ---
    loadMasterItems();

    // --- SESSION MANAGEMENT ---
    // Use the explicit constants defined in index.php
    if (typeof APP_IS_LOGGED_IN !== 'undefined' && APP_IS_LOGGED_IN) {
        loginScreen.hide();
        $('#display-user').text(APP_USERNAME);

        // If user was already in a room, go straight to workspace
        if (typeof INITIAL_STATE !== 'undefined' && INITIAL_STATE.activeRoomId !== null && INITIAL_STATE.activeRoomName) {
            roomScreen.hide();
            workspaceScreen.css('display', 'block');
            $('#up-nav-bar').show();
            $('#current-room-name').text(INITIAL_STATE.activeRoomName);
            $('.grid-background').addClass('active');

            // Populate navbar options on load
            updateRoomLists();

            // LOAD SAVED WIDGETS
            loadWorkspaceState();
        } else {
            // Logged in but no room selected yet
            roomScreen.css('display', 'flex');
            updateRoomLists(); // Pre-load rooms
        }
    } else {
        // Explicitly ensure login screen is shown if not logged in
        loginScreen.css('display', 'flex');
        roomScreen.hide();
        workspaceScreen.hide();
    }

    // --- EVENT HANDLERS ---
    $(document).on('click', '.item-btn', function() { let id = $(this).data('id'); let type = $(this).data('type'); let name = $(this).find('span').text().trim(); spawnWidget(id, name, type, 200, 200); });
    let contextMenuPos = { x: 0, y: 0 };
    $(document).on('click', '.spawn-item', function() { let id = $(this).data('id'); let type = $(this).data('type'); let name = $(this).text().trim(); spawnWidget(id, name, type, contextMenuPos.x, contextMenuPos.y); $('#context-menu').hide(); });
    $(document).on('click', function(e) { if (!$(e.target).closest('.context-menu').length) { $('#widget-context-menu').hide(); } });
    $('#toggle-close-btn').on('click', function() { if(currentTargetWidget) { const closeBtn = $(`#${currentTargetWidget} .widget-close`); closeBtn.toggle(); } $('#widget-context-menu').hide(); });

    // Global Context Menu
    $(document).on('contextmenu', function(e) {
        e.preventDefault();
        if (workspaceScreen.is(':visible')) {
             const menu = $('#context-menu');
             menu.show(); // Need to show to measure
             let menuWidth = menu.outerWidth();
             let menuHeight = menu.outerHeight();
             let winWidth = $(window).width();
             let winHeight = $(window).height();

             let left = e.clientX;
             let top = e.clientY;

             // Prevent overflow
             if (left + menuWidth > winWidth) left = left - menuWidth;
             if (top + menuHeight > winHeight) top = top - menuHeight;

             contextMenuPos.x = left;
             contextMenuPos.y = top;

             menu.css({ display: 'block', left: left, top: top });
        }
    });

    $(document).on('click', function(e) { if (!$(e.target).closest('.context-menu').length) { contextMenu.hide(); } });

    // --- AUTH LOGIC ---
    function handleAuth(action, btn) {
        let username = $('#username').val();
        let password = $('#password').val();
        if(username === '' || password === '') { $('#auth-message').html('<span style="color:red; font-size:12px;">Username dan password wajib diisi!</span>'); return; }
        let originalText = btn.text(); btn.text('Processing...').prop('disabled', true);
        $.ajax({
            url: 'backend/auth.php', type: 'POST', dataType: 'json', data: { action: action, username: username, password: password },
            success: function(res) {
                btn.text(originalText).prop('disabled', false);
                if(res.status === 'success') {
                    if (action === 'register') { $('#auth-message').html('<span style="color:green; font-size:12px; font-weight:bold;">' + res.message + '</span>'); $('#password').val(''); }
                    else {
                        if(res.role === 'admin') { window.location.href = 'admin.php'; }
                        else {
                            $('#display-user').text(username);
                            loginScreen.fadeOut(300, function() {
                                if (res.active_room) {
                                    // User has a room, go straight to workspace
                                    $('#current-room-name').text(res.active_room.nama_room);
                                    workspaceScreen.fadeIn(300, function() {
                                        $('.grid-background').addClass('active');
                                        $('#up-nav-bar').slideDown(300);
                                        loadWorkspaceState();
                                    });
                                } else {
                                    // No room, show setup screen
                                    roomScreen.css('display', 'flex').hide().fadeIn(300);
                                }
                                // Refresh room list on login
                                updateRoomLists();
                            });
                        }
                    }
                } else { $('#auth-message').html('<span style="color:red; font-size:12px;">' + res.message + '</span>'); }
            },
            error: function() { btn.text(originalText).prop('disabled', false); $('#auth-message').html('<span style="color:red; font-size:12px;">Connection failed.</span>'); }
        });
    }
    $('#btn-login').on('click', function(e) { e.preventDefault(); handleAuth('login', $(this)); });
    $('#btn-register').on('click', function(e) { e.preventDefault(); handleAuth('register', $(this)); });

    // --- CUSTOM SELECT & ROOM SWITCHING ---
    $('.custom-select-trigger').on('click', function() { $(this).parents('.custom-select-wrapper').find('.custom-options').toggleClass('open'); });
    $(document).on('click', function(e) { if(!$(e.target).closest('.custom-select-wrapper').length) { $('.custom-options').removeClass('open'); } });

    // Handle Option Click (Navbar)
    $(document).on('click', '.custom-option', function() {
        let value = $(this).data('value'); let text = $(this).text();
        if (value === 'new') {
            workspaceScreen.fadeOut(300, function() { roomScreen.fadeIn(300); $('#welcome-screen').hide(); $('.grid-background').removeClass('active'); });
        } else {
            // Check if not clicking on the delete button span
            if(!$(event.target).closest('span[title="Delete Room"]').length) {
                // Remove the text from the delete icon (which has no title but is font-awesome)
                // Just pass the text before the delete icon
                let cleanText = $(this).find('span').first().text().trim() || text.trim();
                window.switchRoom(value, cleanText);
            }
        }
        $('.custom-options').removeClass('open');
    });

    // --- CREATE ROOM ---
    $('#btn-create-room').on('click', function() {
        let roomName = $('#room-name').val() || 'Empty Room';
        if (roomName.length > 50) { window.showCustomModal('Warning', 'Room name must be 50 characters or less.'); return; }
        let btn = $(this); let originalText = btn.text(); btn.text('Building...').prop('disabled', true);
        $.ajax({
            url: 'backend/create_room.php', type: 'POST', dataType: 'json', data: { room_name: roomName },
            success: function(res) {
                if(res.status === 'success') {
                    // Fix Bug 3: Clear workspace before showing new room
                    $('.lobe-widget').remove();

                    // Mark as loaded so we can save new widgets
                    isWorkspaceLoaded = true;

                    $('#current-room-name').text(res.room_name);
                    roomScreen.fadeOut(300, function() { workspaceScreen.fadeIn(300, function() { $('.grid-background').addClass('active'); }); $('#up-nav-bar').slideDown(300); setTimeout(() => $('#welcome-screen').fadeIn(800), 500); });

                    // Fix Bug 5: Update lists immediately
                    updateRoomLists();
                } else { window.showCustomModal('Error', res.message); btn.text(originalText).prop('disabled', false); }
            },
            error: function() { window.showCustomModal('Error', "Server error."); btn.text(originalText).prop('disabled', false); }
        });
    });

    $('#btn-logout').on('click', function() { $.ajax({ url: 'backend/logout.php', type: 'POST', success: function() { location.reload(); } }); });
});
