$(document).ready(function() {
    const contextMenu = $('#context-menu');
    const loginScreen = $('#login-screen');
    const roomScreen = $('#room-setup-screen');
    const workspaceScreen = $('#workspace-screen');

    // --- SESSION MANAGEMENT ---
    if (typeof INITIAL_STATE !== 'undefined' && INITIAL_STATE.isLoggedIn) {
        loginScreen.hide();
        $('#display-user').text(INITIAL_STATE.username);

        if (INITIAL_STATE.activeRoomId !== null && INITIAL_STATE.activeRoomName) {
            roomScreen.hide();
            workspaceScreen.css('display', 'block');
            $('#up-nav-bar').show();
            $('#current-room-name').text(INITIAL_STATE.activeRoomName);
            $('.grid-background').addClass('active');
            $('.custom-options').append(`<span class="custom-option" data-value="${INITIAL_STATE.activeRoomId}">${INITIAL_STATE.activeRoomName}</span>`);
        } else {
            roomScreen.css('display', 'flex');
        }
    }

    // --- CUSTOM ALERT ---
    window.showCustomModal = function(title, message) {
        $('#modal-title').text(title);
        $('#modal-message').html(message);
        $('#custom-modal').css('display', 'flex');
    };

    // --- ADVERTISEMENT SYSTEM (TOAST) ---
    // Exposed globally for testing
    window.showAdToast = function() {
        if(workspaceScreen.is(':visible')) {
            $('#ad-notification').fadeIn().css('display', 'flex');
            setTimeout(() => { $('#ad-notification').fadeOut(); }, 10000);
        }
    }

    setInterval(window.showAdToast, 120000);

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
                        welcomeContainer.append(`<div class="item-btn" data-id="${item.id}" data-type="${item.tipe_item}"><i class="fas ${iconClass}"></i><span>${item.nama_item}</span></div>`);
                        contextList.append(`<li class="menu-item spawn-item" data-id="${item.id}" data-type="${item.tipe_item}"><i class="fas ${iconClass}" style="width: 25px;"></i> ${item.nama_item}</li>`);
                    });
                }
            }
        });
    }
    loadMasterItems();

    // --- WIDGET SPAWNING LOGIC ---
    let widgetCount = 0;
    let currentTargetWidget = null;

    function spawnWidget(id, name, type, x = 100, y = 100) {
        if ($('#welcome-screen').is(':visible')) { $('#welcome-screen').fadeOut(300); }
        widgetCount++;
        let wId = `widget-${widgetCount}`;
        let isAI = (type === 'api' || type === 'output') ? 'true' : 'false';
        let w = 350; let h = 300;
        let widgetContent = `Modul: ${name} (ID: ${id})<br><small>Loading content...</small>`;

        if (typeof WidgetRegistry !== 'undefined' && WidgetRegistry[name]) {
            if (WidgetRegistry[name].render) widgetContent = WidgetRegistry[name].render(wId);
        } else {
             widgetContent = `<div style="padding:20px; text-align:center;"><i class="fas fa-hammer" style="font-size:3rem; color:#eee; margin-bottom:10px;"></i><p>Feature <b>${name}</b> is ready to use!</p></div>`;
        }

        if (y < 70) y = 70;

        let html = `<div class="lobe-widget fade-in" id="${wId}" data-isai="${isAI}" style="width:${w}px; height:${h}px; left: ${x}px; top: ${y}px;"><div class="widget-header"><span>${name}</span><span class="widget-close" style="display: none;">&times;</span></div><div class="widget-content" id="content-${wId}">${widgetContent}</div></div>`;
        
        $('#workspace-screen').append(html);
        setTimeout(() => { $(`#${wId}`).removeClass('fade-in'); }, 500);

        if (typeof WidgetRegistry !== 'undefined' && WidgetRegistry[name]) {
            if (WidgetRegistry[name].init) setTimeout(() => { WidgetRegistry[name].init(wId); }, 10);
        }

        let newWidget = $(`#${wId}`);
        newWidget.draggable({ handle: ".widget-header", snap: true, snapTolerance: 15, containment: [0, 60, $(window).width() - 50, $(window).height() - 50] }).resizable();
        newWidget.on('mousedown', function() { $('.lobe-widget').css('z-index', 500); $(this).css('z-index', 501); });
        newWidget.on('contextmenu', function(e) {
            e.preventDefault(); e.stopPropagation();
            currentTargetWidget = wId;
            if($(this).data('isai') == true || $(this).data('isai') == 'true') { $('.ai-feature').show(); } else { $('.ai-feature').hide(); }
            $('#context-menu').hide();
            $('#widget-context-menu').css({ display: 'block', left: e.clientX, top: e.clientY });
        });
        newWidget.find('.widget-close').on('click', function() { newWidget.remove(); });
    }

    $(document).on('click', '.item-btn', function() { let id = $(this).data('id'); let type = $(this).data('type'); let name = $(this).find('span').text().trim(); spawnWidget(id, name, type, 200, 200); });
    let contextMenuPos = { x: 0, y: 0 };
    $(document).on('click', '.spawn-item', function() { let id = $(this).data('id'); let type = $(this).data('type'); let name = $(this).text().trim(); spawnWidget(id, name, type, contextMenuPos.x, contextMenuPos.y); $('#context-menu').hide(); });
    $(document).on('click', function(e) { if (!$(e.target).closest('.context-menu').length) { $('#widget-context-menu').hide(); } });
    $('#toggle-close-btn').on('click', function() { if(currentTargetWidget) { const closeBtn = $(`#${currentTargetWidget} .widget-close`); closeBtn.toggle(); } $('#widget-context-menu').hide(); });
    $(document).on('contextmenu', function(e) { e.preventDefault(); if (workspaceScreen.is(':visible')) { contextMenuPos.x = e.clientX; contextMenuPos.y = e.clientY; contextMenu.css({ display: 'block', left: e.clientX, top: e.clientY }); } });
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
                    else { if(res.role === 'admin') { window.location.href = 'admin.php'; } else { $('#display-user').text(username); loginScreen.fadeOut(300, function() { roomScreen.css('display', 'flex').hide().fadeIn(300); }); } }
                } else { $('#auth-message').html('<span style="color:red; font-size:12px;">' + res.message + '</span>'); }
            },
            error: function() { btn.text(originalText).prop('disabled', false); $('#auth-message').html('<span style="color:red; font-size:12px;">Connection failed.</span>'); }
        });
    }
    $('#btn-login').on('click', function(e) { e.preventDefault(); handleAuth('login', $(this)); });
    $('#btn-register').on('click', function(e) { e.preventDefault(); handleAuth('register', $(this)); });

    // --- CUSTOM SELECT ---
    $('.custom-select-trigger').on('click', function() { $(this).parents('.custom-select-wrapper').find('.custom-options').toggleClass('open'); });
    $(document).on('click', function(e) { if(!$(e.target).closest('.custom-select-wrapper').length) { $('.custom-options').removeClass('open'); } });
    $(document).on('click', '.custom-option', function() {
        let value = $(this).data('value'); let text = $(this).text();
        if (value === 'new') { workspaceScreen.fadeOut(300, function() { roomScreen.fadeIn(300); $('#welcome-screen').hide(); $('.grid-background').removeClass('active'); }); }
        else { $('#current-room-name').text(text); window.showCustomModal("Room Switch", "Switched to room: " + text); }
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
                    $('.custom-options').append(`<span class="custom-option" data-value="${res.room_id}">${res.room_name}</span>`);
                    $('#current-room-name').text(res.room_name);
                    roomScreen.fadeOut(300, function() { workspaceScreen.fadeIn(300, function() { $('.grid-background').addClass('active'); }); $('#up-nav-bar').slideDown(300); setTimeout(() => $('#welcome-screen').fadeIn(800), 500); });
                } else { window.showCustomModal('Error', res.message); btn.text(originalText).prop('disabled', false); }
            },
            error: function() { window.showCustomModal('Error', "Server error."); btn.text(originalText).prop('disabled', false); }
        });
    });

    $('#btn-logout').on('click', function() { $.ajax({ url: 'backend/logout.php', type: 'POST', success: function() { location.reload(); } }); });
});
