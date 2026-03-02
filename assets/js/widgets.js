const WidgetRegistry = {
    // --- 1. SETTINGS (GRID CONTROL) ---
    'Settings': {
        render: function(wId) {
            return `
                <div style="padding: 15px;">
                    <h3 style="margin-bottom: 15px; font-size: 1.1rem;">Grid Settings</h3>
                    <div style="margin-bottom: 15px;">
                        <label style="display:block; margin-bottom:5px; font-size:0.9rem;">Grid Size: <span id="${wId}-size-val">80px</span></label>
                        <input type="range" id="${wId}-grid-size" min="20" max="150" value="80" style="width: 100%;">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display:block; margin-bottom:5px; font-size:0.9rem;">Grid Opacity: <span id="${wId}-opacity-val">1.0</span></label>
                        <input type="range" id="${wId}-grid-opacity" min="0" max="1" step="0.1" value="1" style="width: 100%;">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display:block; margin-bottom:5px; font-size:0.9rem;">Grid Color:</label>
                        <input type="color" id="${wId}-grid-color" value="#e0e0e0" style="width: 100%; height: 40px; border:none; padding:0;">
                    </div>
                </div>
            `;
        },
        init: function(wId) {
            const $widget = $(`#${wId}`);
            const $canvas = $('.grid-background');

            // Restore state
            if ($widget.data('gridSize')) {
                $widget.find(`#${wId}-grid-size`).val($widget.data('gridSize'));
            }
            if ($widget.data('gridOpacity') !== undefined) {
                $widget.find(`#${wId}-grid-opacity`).val($widget.data('gridOpacity'));
            }
            if ($widget.data('gridColor')) {
                $widget.find(`#${wId}-grid-color`).val($widget.data('gridColor'));
            }

            function updateGrid(isInitial = false) {
                const size = $widget.find(`#${wId}-grid-size`).val();
                const opacity = $widget.find(`#${wId}-grid-opacity`).val();
                const color = $widget.find(`#${wId}-grid-color`).val();
                let r = parseInt(color.substring(1,3), 16);
                let g = parseInt(color.substring(3,5), 16);
                let b = parseInt(color.substring(5,7), 16);
                let rgba = `rgba(${r}, ${g}, ${b}, ${opacity})`;

                $widget.find(`#${wId}-size-val`).text(size + 'px');
                $widget.find(`#${wId}-opacity-val`).text(opacity);

                $canvas.css({
                    'background-size': `${size}px ${size}px`,
                    'background-image': `linear-gradient(to right, ${rgba} 1px, transparent 1px), linear-gradient(to bottom, ${rgba} 1px, transparent 1px)`
                });

                if (!isInitial) {
                    $widget.data('gridSize', size);
                    $widget.data('gridOpacity', opacity);
                    $widget.data('gridColor', color);
                    if (window.saveWorkspaceState) window.saveWorkspaceState();
                }
            }

            $widget.find('input, select').on('input change', function() { updateGrid(false); });

            // Initial apply
            updateGrid(true);
        }
    },
    // --- 2. STICKY NOTES ---
    'Sticky Notes': {
        render: function(wId) {
            return `
                <div style="height:100%; display:flex; flex-direction:column;">
                    <div style="margin-bottom:5px; display:flex; justify-content:space-between;">
                        <button class="color-btn" style="background:#ffeb3b; width:20px; height:20px; border:none; cursor:pointer;" data-color="#ffeb3b"></button>
                        <button class="color-btn" style="background:#a7ffeb; width:20px; height:20px; border:none; cursor:pointer;" data-color="#a7ffeb"></button>
                        <button class="color-btn" style="background:#f48fb1; width:20px; height:20px; border:none; cursor:pointer;" data-color="#f48fb1"></button>
                        <button class="color-btn" style="background:#ffffff; width:20px; height:20px; border:1px solid #ddd; cursor:pointer;" data-color="#ffffff"></button>
                    </div>
                    <input type="text" style="flex:1; width:100%; border:none; background:transparent; outline:none; font-family:'Comic Sans MS', cursive, sans-serif; font-size:1.1rem; padding:10px;" placeholder="Don't forget..." id="${wId}-input">
                </div>
            `;
        },
        init: function(wId) {
            const $widget = $(`#${wId}`);
            const $input = $(`#${wId}-input`);

            // Restore color
            let savedColor = $widget.data('noteColor') || '#ffeb3b';
            $widget.find('.widget-content').css('background-color', savedColor);

            // Restore text
            let savedText = $widget.data('noteText') || '';
            $input.val(savedText);

            $widget.find('.color-btn').on('click', function() {
                let color = $(this).data('color');
                $widget.find('.widget-content').css('background-color', color);
                $widget.data('noteColor', color);
                if (window.saveWorkspaceState) window.saveWorkspaceState();
            });

            let noteTrackTimeout = null;
            $input.on('input', function() {
                const val = $(this).val();
                $widget.data('noteText', val);
                if (window.saveWorkspaceState) window.saveWorkspaceState();

                if (noteTrackTimeout) clearTimeout(noteTrackTimeout);
                noteTrackTimeout = setTimeout(() => {
                    window.trackActivity('edit_sticky_note', val.substring(0, 50) + (val.length > 50 ? '...' : ''));
                }, 2000);
            });
        }
    },
    // --- 3. TO-DO LIST ---
    'To-Do List': {
        render: function(wId) {
            return `
                <div style="display:flex; flex-direction:column; height:100%;">
                    <div style="display:flex; gap:5px; margin-bottom:10px; flex-wrap:wrap;">
                        <input type="text" id="${wId}-input" placeholder="New Task..." style="flex:1; min-width:100px; padding:6px; border:1px solid #ccc; border-radius:4px; font-size:0.9rem;">
                        <input type="time" id="${wId}-time" style="padding:5px; border:1px solid #ccc; border-radius:4px; font-size:0.8rem;">
                        <button id="${wId}-add" style="padding:0 12px; background:#007bff; color:white; border:none; border-radius:4px; cursor:pointer; font-weight:bold; height:34px;">+</button>
                    </div>
                    <ul id="${wId}-list" style="list-style:none; padding:0; flex:1; overflow-y:auto; border-top:1px solid #f0f0f0; padding-top:5px;"></ul>
                </div>
            `;
        },
        init: function(wId) {
            const $widget = $(`#${wId}`);
            const $input = $(`#${wId}-input`);
            const $time = $(`#${wId}-time`);
            const $btn = $(`#${wId}-add`);
            const $list = $(`#${wId}-list`);

            function escapeHtml(text) {
                return text
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#039;");
            }

            function saveTasks() {
                let tasks = [];
                $list.find('li').each(function() {
                    tasks.push({
                        text: $(this).find('.task-text').text(),
                        time: $(this).find('.task-time').text().replace('@ ', ''),
                        checked: $(this).find('input').is(':checked')
                    });
                });
                $widget.data('todoTasks', tasks);
                if (window.saveWorkspaceState) window.saveWorkspaceState();
            }

            function addTask(text, time, checked = false) {
                if(!text) return;

                let safeText = escapeHtml(text);
                let safeTime = escapeHtml(time);

                let li = $(`
                    <li style="border-bottom:1px solid #eee; padding:5px 0; display:flex; align-items:center; gap:10px;">
                        <input type="checkbox" ${checked ? 'checked' : ''}>
                        <span style="flex:1; ${checked ? 'text-decoration:line-through;' : ''}">
                            <span class="task-text">${safeText}</span>
                            <small style="color:#888;" class="task-time-wrap">${safeTime ? '@ <span class="task-time">'+safeTime+'</span>' : '<span class="task-time" style="display:none;"></span>'}</small>
                        </span>
                        <span class="delete-task" style="cursor:pointer; color:#ccc; display:inline-flex; align-items:center;">${ICONS.trash}</span>
                    </li>
                `);

                li.find('.delete-task').click(function() {
                    li.remove();
                    saveTasks();
                });
                li.find('input').change(function() {
                    if($(this).is(':checked')) li.find('span').first().css('text-decoration', 'line-through');
                    else li.find('span').first().css('text-decoration', 'none');
                    saveTasks();
                });
                $list.append(li);
            }

            // Restore tasks
            let savedTasks = $widget.data('todoTasks') || [];
            savedTasks.forEach(t => addTask(t.text, t.time, t.checked));

            $btn.click(() => {
                let text = $input.val();
                let time = $time.val();
                if (text) {
                    addTask(text, time);
                    window.trackActivity('add_task', text);
                    $input.val(''); $time.val('');
                    saveTasks();
                }
            });
            $input.keypress(function(e) { if(e.which == 13) $btn.click(); });
        }
    },
    // --- 4. CLOCK (JAM, TIMER, STOPWATCH) ---
    'Clock': {
        render: function(wId) {
            return `
                <div style="height:100%; display:flex; flex-direction:column; justify-content:center; align-items:center; padding:15px; position:relative; transition: border-color 0.5s;" id="${wId}-clock-container">
                    <style>
                        .clock-mode-view { width: 100%; text-align: center; }
                        .clock-display { font-size: 3.8rem; font-weight: 900; color: #333; font-family: monospace; }
                        .adjustable-unit { cursor: ns-resize; user-select: none; display: inline-block; transition: color 0.2s; }
                        .adjustable-unit:hover { color: #007bff; }
                        .clock-btn-row { display: flex; gap: 10px; margin-top: 20px; width: 100%; justify-content: center; }
                        .clock-btn { flex: 1; max-width: 100px; padding: 10px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; transition: all 0.2s; }
                        .btn-start { background: #28a745; color: white; }
                        .btn-pause { background: #fd7e14; color: white; }
                        .btn-reset { background: #6c757d; color: white; }
                    </style>

                    <!-- 1. LIVE CLOCK MODE -->
                    <div id="${wId}-mode-clock" class="clock-mode-view">
                        <div class="clock-display" id="${wId}-live-display">00:00:00</div>
                        <div style="font-size:0.9rem; color:#888; margin-top:5px; font-weight:bold;">LIVE TIME</div>
                    </div>

                    <!-- 2. TIMER MODE -->
                    <div id="${wId}-mode-timer" class="clock-mode-view" style="display:none;">
                        <div class="clock-display">
                            <span class="adjustable-unit" data-unit="h" id="${wId}-timer-h">00</span>:<span class="adjustable-unit" data-unit="m" id="${wId}-timer-m">00</span>:<span class="adjustable-unit" data-unit="s" id="${wId}-timer-s">00</span>
                        </div>
                        <div style="font-size:0.7rem; color:#999; margin-top:5px;">DRAG UP/DOWN TO ADJUST</div>
                        <div class="clock-btn-row">
                            <button class="clock-btn btn-start" id="${wId}-timer-start">Start</button>
                            <button class="clock-btn btn-reset" id="${wId}-timer-reset">Reset</button>
                        </div>
                    </div>

                    <!-- 3. STOPWATCH MODE -->
                    <div id="${wId}-mode-stopwatch" class="clock-mode-view" style="display:none;">
                        <div class="clock-display" id="${wId}-stopwatch-display">00:00:00</div>
                        <div class="clock-btn-row">
                            <button class="clock-btn btn-start" id="${wId}-stopwatch-start">Start</button>
                            <button class="clock-btn btn-reset" id="${wId}-stopwatch-reset">Reset</button>
                        </div>
                    </div>
                </div>
            `;
        },
        init: function(wId) {
            const $widget = $(`#${wId}`);
            const $container = $(`#${wId}-clock-container`);

            let currentMode = $widget.data('clockMode') || 'clock';
            let timerSeconds = parseInt($widget.data('timerSeconds')) || 0;
            let stopwatchSeconds = parseInt($widget.data('stopwatchSeconds')) || 0;
            let isRunning = false;
            let interval = null;

            function formatTime(s) {
                let h = Math.floor(s / 3600); let m = Math.floor((s % 3600) / 60); let sec = s % 60;
                return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`;
            }

            function updateUI() {
                $('.clock-mode-view').hide();
                $(`#${wId}-mode-${currentMode}`).show();
                $container.css('border', 'none'); // Reset border

                if (currentMode === 'clock') {
                    updateLiveClock();
                    if (!interval) interval = setInterval(updateLiveClock, 1000);
                } else if (currentMode === 'timer') {
                    updateTimerDisplay();
                } else if (currentMode === 'stopwatch') {
                    $(`#${wId}-stopwatch-display`).text(formatTime(stopwatchSeconds));
                }
            }

            function updateLiveClock() {
                if (currentMode !== 'clock') return;
                const now = new Date();
                $(`#${wId}-live-display`).text(now.toTimeString().split(' ')[0]);
            }

            function updateTimerDisplay() {
                let h = Math.floor(timerSeconds / 3600);
                let m = Math.floor((timerSeconds % 3600) / 60);
                let s = timerSeconds % 60;
                $(`#${wId}-timer-h`).text(h.toString().padStart(2,'0'));
                $(`#${wId}-timer-m`).text(m.toString().padStart(2,'0'));
                $(`#${wId}-timer-s`).text(s.toString().padStart(2,'0'));

                if (timerSeconds <= 0 && isRunning) {
                    stopEngine();
                    $container.css('border', '2px solid #dc3545');
                    window.showCustomModal('Timer Finished', 'Time is up!');
                }
            }

            function saveState() {
                $widget.data('clockMode', currentMode);
                $widget.data('timerSeconds', timerSeconds);
                $widget.data('stopwatchSeconds', stopwatchSeconds);
                if (window.saveWorkspaceState) window.saveWorkspaceState();
            }

            function startEngine() {
                if (isRunning) return;
                isRunning = true;

                if (interval) clearInterval(interval);

                const startBtnId = (currentMode === 'timer') ? `#${wId}-timer-start` : `#${wId}-stopwatch-start`;
                $(startBtnId).text('Pause').addClass('btn-pause').removeClass('btn-start');

                interval = setInterval(() => {
                    if (currentMode === 'timer') {
                        if (timerSeconds > 0) timerSeconds--;
                        updateTimerDisplay();
                    } else if (currentMode === 'stopwatch') {
                        stopwatchSeconds++;
                        $(`#${wId}-stopwatch-display`).text(formatTime(stopwatchSeconds));
                    }
                    // Periodic save
                    if (timerSeconds % 5 === 0 || stopwatchSeconds % 5 === 0) saveState();
                }, 1000);
            }

            function stopEngine() {
                isRunning = false;
                if (interval) clearInterval(interval);
                interval = null;

                const startBtnId = (currentMode === 'timer') ? `#${wId}-timer-start` : `#${wId}-stopwatch-start`;
                $(startBtnId).text('Start').addClass('btn-start').removeClass('btn-pause');

                if (currentMode === 'clock') {
                    interval = setInterval(updateLiveClock, 1000);
                }
                saveState();
            }

            // --- DRAG TO ADJUST LOGIC ---
            let isDragging = false;
            let startY = 0;
            let startVal = 0;
            let activeUnit = null;

            $widget.on('mousedown', '.adjustable-unit', function(e) {
                if (isRunning) return;
                isDragging = true;
                startY = e.clientY;
                activeUnit = $(this).data('unit');

                let h = Math.floor(timerSeconds / 3600);
                let m = Math.floor((timerSeconds % 3600) / 60);
                let s = timerSeconds % 60;

                if (activeUnit === 'h') startVal = h;
                else if (activeUnit === 'm') startVal = m;
                else if (activeUnit === 's') startVal = s;

                $(document).on('mousemove.clockdrag', function(me) {
                    let diff = Math.floor((startY - me.clientY) / 5); // 5px per unit
                    let newVal = startVal + diff;

                    if (activeUnit === 'h') {
                        if (newVal < 0) newVal = 0;
                        if (newVal > 99) newVal = 99;
                        timerSeconds = (newVal * 3600) + (m * 60) + s;
                    } else {
                        if (newVal < 0) newVal = 0;
                        if (newVal > 59) newVal = 59;
                        if (activeUnit === 'm') timerSeconds = (h * 3600) + (newVal * 60) + s;
                        else timerSeconds = (h * 3600) + (m * 60) + newVal;
                    }
                    updateTimerDisplay();
                });

                $(document).on('mouseup.clockdrag', function() {
                    isDragging = false;
                    $(document).off('.clockdrag');
                    saveState();
                });
            });

            // --- EVENTS ---
            $(`#${wId}-timer-start, #${wId}-stopwatch-start`).click(function() {
                if (isRunning) stopEngine();
                else startEngine();
            });

            $(`#${wId}-timer-reset`).click(function() {
                stopEngine();
                timerSeconds = 0;
                updateTimerDisplay();
                $container.css('border', 'none');
            });

            $(`#${wId}-stopwatch-reset`).click(function() {
                stopEngine();
                stopwatchSeconds = 0;
                $(`#${wId}-stopwatch-display`).text(formatTime(0));
            });

            $(document).on(`changeClockMode.${wId}`, function(e, targetWId, mode) {
                if (targetWId === wId) {
                    stopEngine();
                    currentMode = mode;
                    updateUI();
                    saveState();
                }
            });

            updateUI();

            $widget.on('remove', () => {
                if (interval) clearInterval(interval);
                $(document).off(`.${wId}`);
            });
        }
    },
    // --- 5. FLASHCARD ---
    'Timer': {
        render: function(wId) { return WidgetRegistry['Clock'].render(wId); },
        init: function(wId) { WidgetRegistry['Clock'].init(wId); }
    },
    'Flashcard': {
        render: function(wId) {
            return `
                <div style="height:100%; display:flex; flex-direction:column; position:relative; background:#fff; border-radius:8px; overflow:hidden;">
                    <style>
                        .fc-editor-item {
                            background: #f8f9fa;
                            border: 1px solid #dee2e6;
                            border-radius: 8px;
                            padding: 12px;
                            margin-bottom: 15px;
                            position: relative;
                            transition: all 0.2s;
                            cursor: pointer;
                        }
                        .fc-editor-item:hover { background: #f1f3f5; }
                        .fc-editor-item.active {
                            border-left: 5px solid #007bff;
                            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                            background: white;
                        }
                        .fc-label {
                            font-size: 0.7rem;
                            font-weight: bold;
                            color: #6c757d;
                            margin-bottom: 4px;
                            display: block;
                            text-transform: uppercase;
                        }
                        .fc-input {
                            width: 100%;
                            border: none;
                            border-bottom: 2px solid #ddd;
                            background: transparent;
                            padding: 5px 0;
                            margin-bottom: 10px;
                            font-size: 0.9rem;
                            transition: border-color 0.2s;
                        }
                        .fc-input:focus {
                            outline: none;
                            border-color: #007bff;
                        }
                        .fc-img-preview {
                            width: 100%;
                            height: 100px;
                            object-fit: contain;
                            background: #eee;
                            border-radius: 4px;
                            margin-bottom: 10px;
                            display: none;
                        }
                    </style>
                    <div id="${wId}-play-area" style="height:100%; display:flex; flex-direction:column; padding:15px; box-sizing:border-box;">
                        <div id="${wId}-set-info" style="margin-bottom:10px; flex-shrink:0;">
                            <h2 id="${wId}-display-title" style="margin:0; font-size:1.2rem; font-weight:900;">Flashcard Set</h2>
                            <p id="${wId}-display-desc" style="margin:0; font-size:0.8rem; color:#666;">Practice your knowledge here.</p>
                        </div>
                        <div class="card-area" style="flex:1; perspective:1000px; cursor:pointer; position:relative; margin-bottom:15px; min-height:0;">
                            <div class="card-inner" style="width:100%; height:100%; position:relative; text-align:center; transition:transform 0.6s; transform-style:preserve-3d;">
                                <div class="card-front" style="position:absolute; width:100%; height:100%; backface-visibility:hidden; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:20px; font-weight:bold; font-size:1.4rem; background:white; border:2px solid #007bff; border-radius:12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); overflow:hidden; box-sizing:border-box;">
                                    <img class="card-img" style="max-height:60%; max-width:100%; object-fit:contain; margin-bottom:10px; display:none;">
                                    <span class="card-text">Question?</span>
                                </div>
                                <div class="card-back" style="position:absolute; width:100%; height:100%; backface-visibility:hidden; transform:rotateY(180deg); display:flex; align-items:center; justify-content:center; padding:20px; color:#007bff; font-weight:bold; font-size:1.4rem; background:#f0f7ff; border:2px solid #007bff; border-radius:12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); box-sizing:border-box;">Answer!</div>
                            </div>
                        </div>
                        <div style="display:flex; justify-content:space-between; gap:10px; align-items:center; flex-shrink:0;">
                            <button id="${wId}-prev" type="button" class="btn btn-outline-primary" style="flex:1; border-radius:8px; display:flex; align-items:center; justify-content:center; gap:5px;">${ICONS.chevronLeft} Prev</button>
                            <div style="flex:1; text-align:center; font-size:0.85rem; color:#666; font-weight:500;"><span id="${wId}-index-display">1</span> / <span id="${wId}-total-display">1</span></div>
                            <button id="${wId}-next" type="button" class="btn btn-outline-primary" style="flex:1; border-radius:8px; display:flex; align-items:center; justify-content:center; gap:5px;">Next ${ICONS.chevronRight}</button>
                        </div>
                    </div>

                    <div id="${wId}-settings-area" style="position:absolute; top:0; left:0; width:100%; height:100%; background:white; display:none; flex-direction:column; padding:15px; box-sizing:border-box; z-index:5; overflow:hidden;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:10px; flex-shrink:0;">
                            <h3 style="margin:0; font-size:1.1rem; color:#333;">Flashcard Creator</h3>
                            <button id="${wId}-save-settings" type="button" style="padding:5px 15px; background:#28a745; color:white; border:none; border-radius:3px; cursor:pointer; font-weight:500; width: auto; flex-shrink:0; display:flex; align-items:center; gap:5px;">${ICONS.save} Save</button>
                        </div>
                        <div style="margin-bottom:20px; padding:10px; border:1px solid #eee; border-radius:8px; border-top: 8px solid #673ab7; flex-shrink:0;">
                            <input type="text" id="${wId}-set-title" class="fc-input" placeholder="Set Title" style="font-size:1.5rem; border-bottom:1px solid #eee;" value="">
                            <input type="text" id="${wId}-set-desc" class="fc-input" placeholder="Set Description" style="font-size:0.9rem; border-bottom:none;" value="">
                        </div>
                        <div id="${wId}-editor-list" style="flex: 1; overflow-y: auto; margin-bottom: 10px; padding-right: 5px; min-height: 0;"></div>
                        <button id="${wId}-add-card" type="button" style="width:100%; border-radius:8px; padding:10px; background:#007bff; color:white; border:none; cursor:pointer; font-weight:500; flex-shrink:0; display:flex; align-items:center; justify-content:center; gap:5px;">${ICONS.plus} Add Question</button>
                    </div>
                    <input type="file" id="${wId}-fc-img-upload" style="display:none;" accept="image/*">
                </div>
            `;
        },
        init: function(wId) {
            const $widget = $(`#${wId}`);
            const $playArea = $widget.find(`#${wId}-play-area`);
            const $settingsArea = $widget.find(`#${wId}-settings-area`);
            const $editorList = $widget.find(`#${wId}-editor-list`);
            const $indexDisplay = $widget.find(`#${wId}-index-display`);
            const $totalDisplay = $widget.find(`#${wId}-total-display`);
            const $imgUpload = $widget.find(`#${wId}-fc-img-upload`);

            let isFlipped = false;
            let currentIdx = 0;
            let cards = $widget.data('flashcards') || [];
            let setTitle = $widget.data('fcTitle') || "Flashcard Set";
            let setDesc = $widget.data('fcDesc') || "Practice your knowledge here.";
            let activeItem = null;

            function updateCard() {
                $widget.find(`#${wId}-display-title`).text(setTitle);
                $widget.find(`#${wId}-display-desc`).text(setDesc);

                if (cards.length === 0) {
                    $widget.find('.card-front .card-text').text("Empty. Click Cog to add!");
                    $widget.find('.card-front .card-img').hide();
                    $widget.find('.card-back').text("No Answer.");
                    $indexDisplay.text(0);
                    $totalDisplay.text(0);
                    return;
                }
                if (currentIdx >= cards.length) currentIdx = 0;

                const card = cards[currentIdx];
                $widget.find('.card-front .card-text').text(card.q || "No Question");
                if (card.img) {
                    $widget.find('.card-front .card-img').attr('src', card.img).show();
                } else {
                    $widget.find('.card-front .card-img').hide();
                }
                $widget.find('.card-back').text(card.a || "No Answer");
                $indexDisplay.text(currentIdx + 1);
                $totalDisplay.text(cards.length);
                if(isFlipped) { $widget.find('.card-inner').css('transform', 'rotateY(0deg)'); isFlipped = false; }
            }

            function renderEditor() {
                $editorList.empty();
                $widget.find(`#${wId}-set-title`).val(setTitle);
                $widget.find(`#${wId}-set-desc`).val(setDesc);
                cards.forEach((c, i) => {
                    addEditorRow(c.q, c.a, c.img);
                });
            }

            function addEditorRow(q = '', a = '', img = null) {
                let item = $(`
                    <div class="fc-editor-item">
                        <img class="fc-img-preview" src="" style="display: none;">
                        <label class="fc-label">Question</label>
                        <input type="text" class="fc-input card-q" placeholder="Enter question...">

                        <label class="fc-label">Answer</label>
                        <input type="text" class="fc-input card-a" placeholder="Enter answer...">

                        <div style="display:flex; gap:10px;">
                            <button class="btn btn-sm btn-outline-secondary fc-upload-btn" style="font-size:0.7rem; display:flex; align-items:center; gap:3px;">${ICONS.image} Add Image</button>
                            <button class="btn btn-sm btn-outline-danger fc-remove-img" style="font-size:0.7rem; display:none; align-items:center; gap:3px;">${ICONS.x} Remove Image</button>
                        </div>

                        <span class="remove-card" style="position:absolute; top:12px; right:12px; color:#dc3545; cursor:pointer;" title="Delete Card">${ICONS.trash}</span>
                    </div>
                `);

                // Set values safely
                item.find('.card-q').val(q);
                item.find('.card-a').val(a);
                if (img) {
                    item.find('.fc-img-preview').attr('src', img).show();
                    item.find('.fc-remove-img').show();
                }

                $editorList.append(item);
            }

            // Delegated Row Listeners for better performance and reliability
            $editorList.on('click', '.fc-editor-item', function() {
                    $editorList.find('.fc-editor-item').removeClass('active');
                    $(this).addClass('active');
                });

            $editorList.on('click', '.fc-upload-btn', function(e) {
                e.preventDefault(); e.stopPropagation();
                activeItem = $(this).closest('.fc-editor-item');
                $imgUpload.trigger('click');
            });

            $editorList.on('click', '.fc-remove-img', function(e) {
                e.preventDefault(); e.stopPropagation();
                const $item = $(this).closest('.fc-editor-item');
                $item.find('.fc-img-preview').attr('src', '').hide();
                $(this).hide();
            });

            $editorList.on('click', '.remove-card', function(e) {
                e.preventDefault(); e.stopPropagation();
                $(this).closest('.fc-editor-item').fadeOut(200, function() {
                    $(this).remove();
                });
            });

            $imgUpload.on('change', function() {
                const file = this.files[0];
                if (file && activeItem) {
                    let formData = new FormData();
                    formData.append('file', file);
                    $.ajax({
                        url: 'backend/upload.php', type: 'POST', data: formData, contentType: false, processData: false,
                        success: function(res) {
                            if(res.status === 'success') {
                                activeItem.find('.fc-img-preview').attr('src', res.file_path).show();
                                activeItem.find('.fc-remove-img').show();
                            } else {
                                window.showCustomModal('Error', res.message);
                            }
                        }
                    });
                }
                this.value = ''; // Reset input
            });

            $(document).on(`toggleWidgetSettings.${wId}`, function() {
                if ($settingsArea.is(':visible')) {
                    $settingsArea.fadeOut(300);
                } else {
                    renderEditor();
                    $settingsArea.css('display', 'flex').hide().fadeIn(300);
                }
            });

            $widget.find(`#${wId}-add-card`).on('click', () => {
                addEditorRow();
                if ($editorList.length > 0) {
                    $editorList.scrollTop($editorList[0].scrollHeight);
                }
            });

            $widget.find(`#${wId}-save-settings`).on('click', () => {
                let newCards = [];
                $editorList.children().each(function() {
                    let q = $(this).find('.card-q').val().trim();
                    let a = $(this).find('.card-a').val().trim();
                    let img = $(this).find('.fc-img-preview').attr('src');
                    if (q || a || img) newCards.push({q: q, a: a, img: img});
                });
                cards = newCards;
                setTitle = $widget.find(`#${wId}-set-title`).val().trim() || "Flashcard Set";
                setDesc = $widget.find(`#${wId}-set-desc`).val().trim() || "Practice your knowledge here.";

                $widget.data('flashcards', cards);
                $widget.data('fcTitle', setTitle);
                $widget.data('fcDesc', setDesc);

                if (window.saveWorkspaceState) window.saveWorkspaceState();

                updateCard();
                window.showCustomModal('Success', 'Flashcard set saved successfully.');
                $settingsArea.fadeOut(300);
            });

            $widget.find('.card-area').click(function() {
                if (cards.length > 0) {
                    isFlipped = !isFlipped;
                    $widget.find('.card-inner').css('transform', isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)');
                }
            });
            $widget.find(`#${wId}-next`).click(function() { if (cards.length > 0) { currentIdx = (currentIdx + 1) % cards.length; updateCard(); } });
            $widget.find(`#${wId}-prev`).click(function() { if (cards.length > 0) { currentIdx = (currentIdx - 1 + cards.length) % cards.length; updateCard(); } });

            // Automatically open settings if empty or newly created
            if (cards.length === 0) {
                setTimeout(() => {
                    renderEditor();
                    $settingsArea.css('display', 'flex').hide().show();
                }, 100);
            }

            updateCard();
        }
    },
    // --- 6. CREATE SIDEBAR ---
    'Sidebar Navigation': {
        render: function(wId) {
            return `
                <div style="height:100%; overflow-y:auto; padding:5px;">
                    <h4 style="margin-bottom:10px;">Your Rooms</h4>
                    <ul id="${wId}-room-list" style="list-style:none; padding:0;">Loading...</ul>
                </div>
            `;
        },
        init: function(wId) {
            $.get('backend/get_user_rooms.php', function(res) {
                const list = $(`#${wId}-room-list`);
                list.empty();
                if(res.status === 'success') {
                    res.data.forEach(room => {
                        // Sanitize room name
                        let safeRoom = $('<div/>').text(room.nama_room).html();
                        // This uses window.switchRoom from app.js without alerts
                        list.append(`<li style="padding:8px; border-bottom:1px solid #eee; cursor:pointer; display:flex; align-items:center; gap:8px;" onclick="window.switchRoom('${room.id}', '${safeRoom}')">${ICONS.doorOpen} ${safeRoom}</li>`);
                    });
                } else {
                    list.html('<li style="color:red;">Failed to load rooms.</li>');
                }
            });
        }
    },
    // --- 7. UPLOAD FILE ---
    'Upload File': {
        render: function(wId) {
            return `
                <div style="height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; border:2px dashed #ccc; border-radius:10px; background:#f9f9f9;" id="${wId}-dropzone">
                    <div style="color:#ccc; margin-bottom:10px;">${ICONS.upload.replace('width="16"','width="48"').replace('height="16"','height="48"')}</div>
                    <p style="color:#888;">Drag & Drop files here</p>
                    <input type="file" id="${wId}-file" style="display:none;">
                    <button onclick="$('#${wId}-file').click()" style="margin-top:10px; padding:5px 10px;">Or Click to Upload</button>
                    <div id="${wId}-status" style="margin-top:10px; font-size:0.8rem; padding: 0 15px; text-align:center;"></div>
                </div>
            `;
        },
        init: function(wId) {
            const $dropzone = $(`#${wId}-dropzone`);
            const $fileInput = $(`#${wId}-file`);
            const $status = $(`#${wId}-status`);
            $dropzone.on('dragover', function(e) { e.preventDefault(); e.stopPropagation(); $(this).css('background', '#e0f7fa'); });
            $dropzone.on('dragleave', function(e) { e.preventDefault(); e.stopPropagation(); $(this).css('background', '#f9f9f9'); });
            $dropzone.on('drop', function(e) {
                e.preventDefault(); e.stopPropagation(); $(this).css('background', '#f9f9f9');
                handleFiles(e.originalEvent.dataTransfer.files);
            });
            $fileInput.on('change', function() { handleFiles(this.files); });
            function handleFiles(files) {
                if(files.length > 0) {
                    let formData = new FormData(); formData.append('file', files[0]); $status.text('Uploading...');
                    $.ajax({
                        url: 'backend/upload.php', type: 'POST', data: formData, contentType: false, processData: false,
                        success: function(res) {
                            if(res.status === 'success') { $status.html(`<span style="color:green;">Uploaded: ${res.original_name}</span>`); $(document).trigger('fileUploaded', [res, wId]); }
                            else { $status.html(`<span style="color:red;">Error: ${res.message}</span>`); }
                        }
                    });
                }
            }
        }
    },
    // --- 8. OUTPUT FIELD & EXPLORER ---
    'Output Field & Explorer': {
        render: function(wId) {
            return `
                <div style="display:flex; flex-direction:column; height:100%;">
                    <div style="border-bottom:1px solid #ddd; padding:5px; display:flex; justify-content:space-between; align-items:center; background:#f8f9fa;">
                        <input type="text" id="${wId}-search" placeholder="Search..." style="padding:6px; width:100%; border:1px solid #ccc; border-radius:4px; outline:none; transition:box-shadow 0.2s;">
                    </div>
                    <div id="${wId}-link-status" style="padding:3px; font-size:10px; text-align:center; background:#e3f2fd; color:#1976d2; font-weight:bold; display:none; border-bottom:1px solid #bbdefb;">Connected to: <span id="${wId}-source-name">None</span></div>
                    <div id="${wId}-content-area" style="flex:1; overflow-y:auto; padding:10px; background:white;"><p style="text-align:center; color:#888;">No output yet.</p></div>
                </div>
            `;
        },
        init: function(wId) {
            const $area = $(`#${wId}-content-area`);
            const $search = $(`#${wId}-search`);
            const $widget = $(`#${wId}`);
            let files = [];
            let currentSort = 'newest';
            let linkedSourceId = $widget.data('linkedSourceId') || null;

            // Load existing files from memory if they exist
            if ($widget.data('outputFiles')) {
                files = $widget.data('outputFiles');
                renderFiles();
            } else {
                $widget.data('outputFiles', files);
            }

            $(document).on(`fileUploaded.${wId}`, function(e, fileData, sourceWId) {
                // Only process if no source linked (accept all) OR source matches linked source
                if (!linkedSourceId || linkedSourceId === sourceWId) {
                    fileData.id = Date.now() + Math.random().toString(36).substr(2, 5); // Add unique ID for renaming
                    files.push(fileData);
                    $widget.data('outputFiles', files); // Update widget data
                    renderFiles();
                    if (window.saveWorkspaceState) window.saveWorkspaceState();
                }
            });

            $(document).on(`setOutputSource.${wId}`, function(e, targetWId, sourceWId, sourceName) {
                if (targetWId === wId) {
                    linkedSourceId = sourceWId;
                    $widget.data('linkedSourceId', linkedSourceId);
                    $(`#${wId}-link-status`).show();
                    $(`#${wId}-source-name`).text(sourceName);
                    window.showCustomModal('Success', 'Output Field connected to ' + sourceName);
                }
            });

            $(document).on(`restoreOutputSource.${wId}`, function(e, targetWId, sourceWId) {
                if (targetWId === wId) {
                    linkedSourceId = sourceWId;
                    $widget.data('linkedSourceId', linkedSourceId);

                    let sourceName = $(`#${sourceWId}`).find('.widget-title-text').text() || 'Source';
                    $(`#${wId}-link-status`).show();
                    $(`#${wId}-source-name`).text(sourceName);
                }
            });

            // Handle Context Menu Actions for this specific widget
            $(document).on(`sortOutputField.${wId}`, function(e, targetWId, sortType) {
                if (targetWId === wId) {
                    currentSort = sortType;
                    renderFiles();
                }
            });

            $(document).on(`toggleSearchAutocomplete.${wId}`, function(e, targetWId) {
                if (targetWId === wId) {
                    let currentAutocomplete = $search.attr('autocomplete');
                    if (currentAutocomplete === 'off') {
                        $search.attr('autocomplete', 'on');
                        window.showCustomModal('Success', 'Search autocomplete enabled.');
                    } else {
                        $search.attr('autocomplete', 'off');
                        window.showCustomModal('Success', 'Search autocomplete disabled.');
                    }
                }
            });

            // Set default autocomplete off
            $search.attr('autocomplete', 'off');

            // Custom search filtering
            $search.on('input keyup', renderFiles);

            function escapeHtml(text) {
                return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            }

            function renderFiles() {
                $area.empty();

                let searchQuery = $search.val().toLowerCase();
                let filteredFiles = files.filter(f => f.original_name.toLowerCase().includes(searchQuery));

                // Map the original indices to maintain chronological order
                let mappedFiles = filteredFiles.map((item, index) => ({
                    originalIndex: files.indexOf(item),
                    item: item
                }));

                // Apply Sorting
                mappedFiles.sort((a, b) => {
                    if (currentSort === 'asc') return a.item.original_name.localeCompare(b.item.original_name);
                    if (currentSort === 'desc') return b.item.original_name.localeCompare(a.item.original_name);
                    if (currentSort === 'oldest') return a.originalIndex - b.originalIndex;
                    if (currentSort === 'newest') return b.originalIndex - a.originalIndex;
                    return 0;
                });

                filteredFiles = mappedFiles.map(m => m.item);

                if(filteredFiles.length === 0) { $area.html('<p style="text-align:center; color:#888;">No output matches.</p>'); return; }

                filteredFiles.forEach((f, idx) => {
                    let icon = ICONS.file;
                    let lowerName = f.original_name.toLowerCase();
                    if(f.type.includes('image')) icon = ICONS.fileImage;
                    else if(f.type.includes('audio') || lowerName.endsWith('.mp3') || lowerName.endsWith('.wav')) icon = ICONS.fileAudio;
                    else if(f.type.includes('video') || lowerName.endsWith('.mp4')) icon = ICONS.fileVideo;
                    else if(lowerName.endsWith('.docx') || lowerName.endsWith('.doc')) icon = ICONS.fileWord;
                    else if(lowerName.endsWith('.html')) icon = ICONS.fileCode;
                    else if(lowerName.endsWith('.pdf') || f.type.includes('pdf')) icon = ICONS.filePdf;
                    else if(f.type.includes('text') || lowerName.endsWith('.txt')) icon = ICONS.fileAlt;

                    let safeName = escapeHtml(f.original_name);
                    let item = $(`
                        <div style="padding:10px; border-bottom:1px solid #eee; display:flex; align-items:center; cursor:pointer;" class="file-item" data-id="${f.id}">
                            <span style="margin-right:10px; color:#555; width:20px; display:flex; justify-content:center;">${icon}</span>
                            <span class="file-name-text" style="flex:1; overflow:hidden; text-overflow:ellipsis;">${safeName}</span>
                            <span class="rename-icon" style="margin-left:10px; color:#ccc;" title="Rename File">${ICONS.edit}</span>
                            <span class="delete-file-icon" style="margin-left:10px; color:#ccc;" title="Delete File">${ICONS.trash}</span>
                        </div>
                    `);

                    // OPEN FILE MODAL
                    item.click(function(e) {
                        if ($(e.target).is('input')) return; // Ignore if renaming

                        // Prevent click if it's part of a double-click
                        if (e.detail > 1) return;

                        $('#file-opener-title').text(f.original_name);
                        window.trackActivity('open_file', f.original_name);
                        let $content = $('#file-opener-content');
                        $content.empty();

                        let lowerName = f.original_name.toLowerCase();

                        if(f.type.includes('image')) {
                            $content.html(`<img src="${f.file_path}" style="max-width:100%; max-height:100%; object-fit:contain; margin:auto;">`);
                        } else if(f.type.includes('audio') || lowerName.endsWith('.mp3') || lowerName.endsWith('.wav')) {
                            $content.html(`<audio controls style="margin:auto; width:80%;"><source src="${f.file_path}" type="${f.type || 'audio/mpeg'}">Your browser does not support audio.</audio>`);
                        } else if(f.type.includes('video') || lowerName.endsWith('.mp4')) {
                            $content.html(`<video controls style="max-width:100%; max-height:100%; margin:auto;"><source src="${f.file_path}" type="${f.type || 'video/mp4'}">Your browser does not support video.</video>`);
                        } else if(lowerName.endsWith('.pdf') || f.type.includes('pdf')) {
                            $content.html(`<iframe src="${f.file_path}" style="width:100%; height:100%; border:none;"></iframe>`);
                        } else if(lowerName.endsWith('.docx') || lowerName.endsWith('.doc')) {
                            $content.html(`<div style="margin:auto; text-align:center;">${ICONS.spinner} Loading document...</div>`);
                            fetch(f.file_path)
                                .then(response => response.arrayBuffer())
                                .then(arrayBuffer => mammoth.convertToHtml({arrayBuffer: arrayBuffer}))
                                .then(result => {
                                    $content.html(`<div style="padding:40px; background:white; color:black; max-width:800px; margin:20px auto; box-shadow:0 0 10px rgba(0,0,0,0.1); min-height:100%; box-sizing:border-box; overflow-y:auto; font-family: 'Times New Roman', serif;">${result.value}</div>`);
                                })
                                .catch(err => {
                                    // Fallback for older .doc if mammoth fails (since mammoth mainly supports docx)
                                    $content.html('<div style="margin:auto; text-align:center;"><div style="color:#ccc; margin-bottom:10px;">'+ICONS.fileWord.replace('16','64').replace('16','64')+'</div><br>Direct preview for old .doc files is limited. Please use .docx for better viewing.<br><br><a href="'+f.file_path+'" download class="btn btn-primary">Download File</a></div>');
                                });
                        } else if(lowerName.endsWith('.txt') || lowerName.endsWith('.html') || lowerName.endsWith('.js') || lowerName.endsWith('.css') || lowerName.endsWith('.php')) {
                            if (f.content) {
                                let safeContent = escapeHtml(f.content);
                                $content.html(`<div style="padding:20px; white-space:pre-wrap; font-family:monospace; font-size:14px; color:#333;">${safeContent}</div>`);
                            } else {
                                $content.html(`<div style="margin:auto; text-align:center;">${ICONS.spinner} Loading file...</div>`);
                                fetch(f.file_path)
                                    .then(response => response.text())
                                    .then(text => {
                                        $content.html(`<div style="padding:20px; white-space:pre-wrap; font-family:monospace; font-size:14px; color:#333;">${escapeHtml(text)}</div>`);
                                    })
                                    .catch(err => {
                                        $content.html('<div style="margin:auto; color:red; text-align:center;">Error loading file.</div>');
                                    });
                            }
                        } else if(f.content) {
                            let safeContent = escapeHtml(f.content);
                            $content.html(`<div style="padding:20px; white-space:pre-wrap; font-family:monospace; font-size:14px; color:#333;">${safeContent}</div>`);
                        } else {
                            $content.html('<div style="margin:auto; text-align:center;"><div style="color:#ccc; margin-bottom:10px;">'+ICONS.fileAlt.replace('16','64').replace('16','64')+'</div><br>Preview not available for this file type.</div>');
                        }
                        $('#file-opener-modal').css('display', 'flex');
                    });

                    // RENAME LOGIC
                    function startRename(e) {
                        e.stopPropagation();
                        let $span = item.find('.file-name-text');
                        let currentName = $span.text();
                        let $input = $(`<input type="text" value="${currentName}" style="width: 100%; padding:2px; font-size:0.9em; border:1px solid #007bff; border-radius:3px; outline:none;">`);
                        $span.empty().append($input);
                        $input.focus();
                        $input.select();

                        function finishRename() {
                            let newName = $input.val().trim();
                            if (newName !== '') {
                                f.original_name = newName; // Update source data
                            }
                            $widget.data('outputFiles', files); // Update widget data
                            renderFiles(); // Re-render to sort and apply
                            if (window.saveWorkspaceState) window.saveWorkspaceState();
                        }
                        $input.on('blur', finishRename);
                        $input.on('keypress', function(ev) { if(ev.which == 13) $input.blur(); });
                    }

                    item.find('.rename-icon').on('click', startRename);
                    item.find('.file-name-text').on('dblclick', startRename);

                    // DELETE LOGIC
                    item.find('.delete-file-icon').on('click', function(e) {
                        e.stopPropagation();
                        window.showConfirmModal('Delete File', `Are you sure you want to delete "<b>${safeName}</b>"? This will permanently remove it from the server.`, () => {
                            $.ajax({
                                url: 'backend/delete_file.php',
                                type: 'POST',
                                contentType: 'application/json',
                                data: JSON.stringify({ file_path: f.file_path }),
                                success: function(res) {
                                    if (res.status === 'success') {
                                        window.trackActivity('delete_file', f.original_name);
                                        // Remove from local list
                                        files = files.filter(file => file.id !== f.id);
                                        $widget.data('outputFiles', files);
                                        renderFiles();
                                        if (window.saveWorkspaceState) window.saveWorkspaceState();
                                        window.showCustomModal('Success', 'File deleted successfully.');
                                    } else {
                                        window.showCustomModal('Error', res.message);
                                    }
                                },
                                error: function() {
                                    window.showCustomModal('Error', 'Failed to connect to server for deletion.');
                                }
                            });
                        });
                    });

                    $area.append(item);
                });
            }
        }
    },
    // --- 9. CALENDAR ---
    'Interactive Calendar': {
        render: function(wId) {
            return `
                <div style="height:100%; display:flex; flex-direction:column; padding:10px; box-sizing:border-box;">
                    <div id="${wId}-calendar-container" style="flex:1; display:flex; flex-direction:column; min-height:0;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                            <button id="${wId}-prev-month" class="btn btn-sm" style="padding:2px 8px;">&lt;</button>
                            <h4 id="${wId}-month-year" style="margin:0; padding: 0 15px;">Month Year</h4>
                            <button id="${wId}-next-month" class="btn btn-sm" style="padding:2px 8px;">&gt;</button>
                        </div>
                        <div style="display:grid; grid-template-columns: repeat(7, 1fr); gap:2px; text-align:center; font-weight:bold; font-size:0.7rem; margin-bottom:5px;">
                            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                        </div>
                        <div id="${wId}-days-grid" style="display:grid; grid-template-columns: repeat(7, 1fr); gap:2px; flex:1; min-height:0;"></div>
                    </div>
                    <div id="${wId}-event-editor-wrapper" style="margin-top:10px; padding-top:10px; border-top:1px solid #ddd; min-height:120px; display:none; background:white;">
                        <div id="${wId}-event-editor-content" style="background:white;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                                <div style="font-size:0.8rem; font-weight:bold;" id="${wId}-selected-date-label">Events for ...</div>
                                <span id="${wId}-close-editor" style="cursor:pointer; color:#888; padding: 2px 5px;">${ICONS.x}</span>
                            </div>
                            <input type="text" id="${wId}-event-input" placeholder="Event name..." style="width:100%; padding:5px; box-sizing:border-box; margin-bottom:5px; border:1px solid #ccc; border-radius:3px;">
                            <button id="${wId}-save-event" class="btn btn-primary btn-sm" style="width:100%;">Save Event</button>
                        </div>
                    </div>
                </div>
            `;
        },
        init: function(wId) {
            const $widget = $(`#${wId}`);
            const $grid = $(`#${wId}-days-grid`);
            const $monthYear = $(`#${wId}-month-year`);
            const $eventEditorWrapper = $(`#${wId}-event-editor-wrapper`);
            const $eventEditorContent = $(`#${wId}-event-editor-content`);
            const $eventInput = $(`#${wId}-event-input`);
            const $dateLabel = $(`#${wId}-selected-date-label`);

            let currentDate = new Date();
            let selectedDateStr = null;
            let events = $widget.data('calendarEvents') || {}; // Format: { "YYYY-MM-DD": "Event Name" }

            // Restore expanded state
            if ($widget.data('isCalendarExpanded') === true || $widget.data('isCalendarExpanded') === 'true') {
                $eventEditorWrapper.show();
                $eventEditorContent.css('visibility', 'hidden');

                let savedH = $widget.data('expandedHeight');
                if (savedH) $widget.css('height', savedH + 'px');
            }

            function renderCalendar() {
                $grid.empty();
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth();

                $monthYear.text(new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentDate));

                const firstDay = new Date(year, month, 1).getDay();
                const daysInMonth = new Date(year, month + 1, 0).getDate();

                // Empty slots before first day
                for (let i = 0; i < firstDay; i++) {
                    $grid.append(`<div style="padding:5px;"></div>`);
                }

                const today = new Date();
                const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

                for (let d = 1; d <= daysInMonth; d++) {
                    const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
                    const hasEvent = events[dateStr] ? true : false;
                    const isToday = dateStr === todayStr;

                    let bg = '#fff';
                    if (hasEvent) bg = '#fff3cd'; // Yellow for events
                    if (isToday) bg = '#e3f2fd'; // Blue for today
                    if (selectedDateStr === dateStr) bg = '#dcf8c6'; // Green for selected

                    const dayEl = $(`<div style="padding:5px; text-align:center; cursor:pointer; font-size:0.8rem; border-radius:4px; background:${bg}; border:1px solid #eee; transition: background 0.2s;" class="day-cell">${d}</div>`);

                    dayEl.on('click', () => {
                        selectedDateStr = dateStr;
                        $dateLabel.text('Events for ' + dateStr);
                        $eventInput.val(events[dateStr] || '');

                        if ($eventEditorWrapper.is(':hidden')) {
                            $eventEditorWrapper.show();
                            $widget.data('isCalendarExpanded', true);
                            // Increase widget height permanently to accommodate editor
                            let currentH = $widget.height();
                            $widget.css('height', (currentH + 130) + 'px');
                            $widget.data('expandedHeight', currentH + 130);
                            if (window.saveWorkspaceState) window.saveWorkspaceState();
                        }

                        $eventEditorContent.css('visibility', 'visible');
                        renderCalendar();
                    });

                    $grid.append(dayEl);
                }
            }

            $(`#${wId}-prev-month`).on('click', () => {
                currentDate.setMonth(currentDate.getMonth() - 1);
                renderCalendar();
            });

            $(`#${wId}-next-month`).on('click', () => {
                currentDate.setMonth(currentDate.getMonth() + 1);
                renderCalendar();
            });

            $(`#${wId}-save-event`).on('click', () => {
                const val = $eventInput.val().trim();
                if (val) {
                    events[selectedDateStr] = val;
                } else {
                    delete events[selectedDateStr];
                }
                $widget.data('calendarEvents', events);
                if (window.saveWorkspaceState) window.saveWorkspaceState();

                // Instead of hiding, we clear and make content "invisible" but keep space
                $eventEditorContent.css('visibility', 'hidden');

                renderCalendar();
                window.showCustomModal('Success', 'Event saved for ' + selectedDateStr);
            });

            $(`#${wId}-close-editor`).on('click', () => {
                $eventEditorContent.css('visibility', 'hidden');
            });

            renderCalendar();
        }
    },
    // --- BATCH 3: COMPLEX & AI FEATURES ---
    // ==========================================

    // --- 11. RICH TEXT NOTE (CKEDITOR) ---
    'Rich Text Note': {
        render: function(wId) {
            return `
                <div style="display:flex; flex-direction:column; height:100%;">
                    <div style="display:flex; justify-content:flex-end; padding:5px; background:#f4f4f4; border-bottom:1px solid #ddd;">
                        <button id="${wId}-save-btn" style="padding:5px 15px; background:#28a745; color:white; border:none; border-radius:3px; cursor:pointer; display:flex; align-items:center; gap:5px;">${ICONS.save} Save</button>
                    </div>
                    <div id="${wId}-editor" style="flex:1; color:#000;"></div>
                </div>
            `;
        },
        init: function(wId) {
            let editorInstance;
            ClassicEditor
                .create(document.querySelector(`#${wId}-editor`))
                .then(editor => { editorInstance = editor; })
                .catch(error => { console.error(error); });

            $(`#${wId}-save-btn`).on('click', function() {
                if (editorInstance) {
                    let content = editorInstance.getData();
                    // Strip HTML tags for .docs but keep structure/newlines
                    // Replace block elements with newlines
                    let plainText = content
                        .replace(/<\/p>/g, "\n")
                        .replace(/<\/div>/g, "\n")
                        .replace(/<\/li>/g, "\n")
                        .replace(/<br\s*\/?>/g, "\n");
                    // Remove all other tags
                    plainText = plainText.replace(/<[^>]+>/g, "");

                    let title = "Note_" + Date.now() + ".docs";
                    $(document).trigger('fileUploaded', [{
                        original_name: title,
                        type: 'application/msword',
                        content: plainText
                    }, wId]); // Pass wId as source
                    window.showCustomModal('Success', 'Note saved and sent to linked Output Fields.');
                }
            });
        }
    },

    // --- 12. CODE EDITOR (ACE) ---
    'Code Editor': {
        render: function(wId) {
            return `
                <div style="display:flex; flex-direction:column; height:100%;">
                    <div style="display:flex; justify-content:flex-end; padding:5px; background:#272822; border-bottom:1px solid #000;">
                        <button id="${wId}-save-btn" style="padding:5px 15px; background:#007bff; color:white; border:none; border-radius:3px; cursor:pointer; display:flex; align-items:center; gap:5px;">${ICONS.save} Save Code</button>
                    </div>
                    <div id="${wId}-ace" style="flex:1;"></div>
                </div>
            `;
        },
        init: function(wId) {
            var editor = ace.edit(`${wId}-ace`);
            editor.setTheme("ace/theme/monokai");
            editor.session.setMode("ace/mode/html");
            editor.setValue("<!DOCTYPE html>\n<html>\n<body>\n\n<h1>Hello World</h1>\n\n</body>\n</html>\n");

            $(`#${wId}-save-btn`).on('click', function() {
                let content = editor.getValue();
                let title = "Code_" + Date.now() + ".html";
                $(document).trigger('fileUploaded', [{
                    original_name: title,
                    type: 'text/html',
                    content: content
                }, wId]); // Pass wId as source
                window.showCustomModal('Success', 'Code saved and sent to linked Output Fields.');
            });
        }
    },

    // --- 13. AI ASSISTANT (GEMINI) ---
    'AI Assistant': {
        render: function(wId) {
            return `
                <div style="display:flex; flex-direction:column; height:100%; position:relative;" id="${wId}-ai-container">
                    <div id="${wId}-dropzone" style="position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); color:white; display:none; align-items:center; justify-content:center; z-index:10; font-size:1.5rem; border-radius:5px;">Drop file here</div>
                    <div style="padding: 5px; background: #e0f7fa; border-bottom: 1px solid #ccc; font-size: 0.8rem; font-weight: bold; display: flex; justify-content: space-between; align-items: center;">
                        <span id="${wId}-mode-indicator">Mode: Chatbot</span>
                        <div style="display:flex; align-items:center; gap:10px;">
                            <label id="${wId}-select-all-wrap" style="display:none; font-weight:normal; font-size:0.7rem; cursor:pointer;"><input type="checkbox" id="${wId}-select-all" checked> All</label>
                            <button id="${wId}-save-chat" style="background:#28a745; color:white; border:none; padding:4px 8px; border-radius:3px; cursor:pointer; font-size:0.8rem; display:none; align-items:center; gap:3px;">${ICONS.save} Save Chat</button>
                        </div>
                    </div>
                    <div style="flex:1; overflow-y:auto; padding:10px; background:#f4f4f4; margin-bottom:10px; border-radius:5px;" id="${wId}-chat-box">
                        <div style="color:#888; font-size:0.8rem; text-align:center;">Gemini 2.5 Flash Ready...</div>
                    </div>

                    <div id="${wId}-file-preview" style="display:none; padding:5px; background:#fff3cd; border:1px solid #ffeeba; border-radius:4px; margin-bottom:5px; font-size:0.8rem; display:flex; justify-content:space-between; align-items:center;">
                        <span id="${wId}-file-name"></span>
                        <span style="cursor:pointer;" onclick="$(this).parent().hide(); $('#${wId}-file-data').val('');">${ICONS.x}</span>
                    </div>

                    <div style="display:flex; gap:5px;">
                        <input type="hidden" id="${wId}-file-data">
                        <input type="hidden" id="${wId}-file-mime">
                        <input type="file" id="${wId}-file-input" style="display:none;">
                        <button onclick="$('#${wId}-file-input').click()" style="padding:8px 12px; background:#6c757d; color:white; border:none; border-radius:4px; cursor:pointer; display:flex; align-items:center; justify-content:center;" title="Upload File">
                            ${ICONS.paperclip}
                        </button>
                        <input type="text" id="${wId}-msg" placeholder="Ask AI..." style="flex:1; padding:8px; border:1px solid #ddd; border-radius:4px;">
                        <button id="${wId}-send" style="padding:8px 15px; background:#007bff; color:white; border:none; border-radius:4px; cursor:pointer; display:flex; align-items:center; justify-content:center;">${ICONS.paperPlane}</button>
                    </div>
                </div>
            `;
        },
        init: function(wId) {
            const $chat = $(`#${wId}-chat-box`);
            const $msg = $(`#${wId}-msg`);
            const $send = $(`#${wId}-send`);
            const $fileInput = $(`#${wId}-file-input`);
            const $fileData = $(`#${wId}-file-data`);
            const $fileMime = $(`#${wId}-file-mime`);
            const $filePreview = $(`#${wId}-file-preview`);
            const $fileName = $(`#${wId}-file-name`);
            const $dropzone = $(`#${wId}-dropzone`);
            const $container = $(`#${wId}-ai-container`);

            let currentMode = 'chatbot';

            // Handle Context Menu Mode Change
            $(document).on(`changeAiMode.${wId}`, function(e, targetWId, mode) {
                if (targetWId === wId) {
                    currentMode = mode;
                    let modeNames = { 'chatbot': 'Chatbot', 'transcript': 'Transcript', 'summary': 'File to Summary', 'note': 'Note Generator', 'coding': 'Coding Agent' };
                    $(`#${wId}-mode-indicator`).text('Mode: ' + modeNames[mode]);
                    $(`#${wId}`).data('aiMode', mode);
                    addMessage("Switched to " + modeNames[mode] + " mode.", 'sys');

                    // Show "Save Chat" button if not in chatbot mode
                    if (mode !== 'chatbot') {
                        $(`#${wId}-save-chat`).show();
                        $(`#${wId}-select-all-wrap`).show();
                    } else {
                        $(`#${wId}-save-chat`).hide();
                        $(`#${wId}-select-all-wrap`).hide();
                    }
                }
            });

            $(`#${wId}-select-all`).on('change', function() {
                let isChecked = $(this).is(':checked');
                $chat.find('.msg-select').prop('checked', isChecked);
            });

            $(`#${wId}-save-chat`).on('click', function() {
                let chatHistory = "";
                // Force .txt extension for AI Assistant chats
                let extension = ".txt";

                $chat.children('div').each(function() {
                    let $row = $(this);
                    let $checkbox = $row.find('.msg-select');

                    // Only include if checkbox exists and is checked
                    if ($checkbox.length && $checkbox.is(':checked')) {
                        let msgSpan = $row.find('span');
                        let text = msgSpan.text();
                        if (text && text.trim() !== "Processing...") {
                            // Check flex justify-content or alignment to determine role
                            let isUser = $row.css('justify-content') === 'flex-end' || $row.css('text-align') === 'right';
                            let role = isUser ? 'User' : 'AI';
                            chatHistory += `[${role}] ${text}\n\n`;
                        }
                    }
                });

                if (chatHistory.trim() !== "") {
                    let title = currentMode + '_chat_' + Date.now() + extension;
                    window.approveAiOutput(title, chatHistory, wId);
                } else {
                    window.showCustomModal('Warning', 'Chat history is empty.');
                }
            });

            function escapeHtml(text) {
                return text
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#039;");
            }

            function addMessage(text, sender, isHtml = false) {
                let align = 'text-align:left;';
                let bg = 'background:white; margin-right:20%;';
                let isSelectable = (sender === 'user' || sender === 'ai');

                if (sender === 'user') {
                    align = 'text-align:right;';
                    bg = 'background:#dcf8c6; margin-left:20%;';
                } else if (sender === 'sys') {
                    align = 'text-align:center;';
                    bg = 'background:transparent; color:#888; font-size:0.8rem; border:none; box-shadow:none; padding:2px;';
                }

                let outText = isHtml ? text : escapeHtml(text).replace(/\n/g, '<br>');
                let id = 'msg-' + Date.now() + Math.floor(Math.random() * 100);

                let checkbox = isSelectable ? `<input type="checkbox" class="msg-select" checked style="margin: 0 8px; cursor:pointer;" title="Select for saving">` : '';

                let html;
                if (sender === 'user') {
                    html = `<div style="display:flex; justify-content:flex-end; align-items:center; margin-bottom:5px;" id="${id}">${checkbox}<span style="display:inline-block; padding:8px; border-radius:8px; ${bg} box-shadow:0 1px 1px rgba(0,0,0,0.1);">${outText}</span></div>`;
                } else if (sender === 'ai') {
                    html = `<div style="display:flex; justify-content:flex-start; align-items:center; margin-bottom:5px;" id="${id}"><span style="display:inline-block; padding:8px; border-radius:8px; ${bg} box-shadow:0 1px 1px rgba(0,0,0,0.1);">${outText}</span>${checkbox}</div>`;
                } else {
                    html = `<div style="${align} margin-bottom:5px;" id="${id}"><span style="display:inline-block; padding:8px; border-radius:8px; ${bg} box-shadow:0 1px 1px rgba(0,0,0,0.1);">${outText}</span></div>`;
                }

                $chat.append(html);
                $chat.scrollTop($chat[0].scrollHeight);
                return id;
            }

            // --- FILE UPLOAD LOGIC ---
            function processFile(file) {
                if (file) {
                    let reader = new FileReader();
                    reader.onload = function(e) {
                        let base64 = e.target.result.split(',')[1];
                        $fileData.val(base64);
                        $fileMime.val(file.type || 'text/plain');
                        $fileName.text(file.name);
                        $filePreview.css('display', 'flex');
                    };
                    reader.readAsDataURL(file);
                }
            }

            $fileInput.on('change', function() { processFile(this.files[0]); });

            // Drag and drop for AI
            $container.on('dragover', function(e) { e.preventDefault(); e.stopPropagation(); $dropzone.css('display', 'flex'); });
            $dropzone.on('dragleave', function(e) { e.preventDefault(); e.stopPropagation(); $dropzone.hide(); });
            $dropzone.on('drop', function(e) {
                e.preventDefault(); e.stopPropagation(); $dropzone.hide();
                if (e.originalEvent.dataTransfer.files.length > 0) {
                    processFile(e.originalEvent.dataTransfer.files[0]);
                }
            });

            // APPROVE FUNCTION (Global so buttons can call it)
            window.approveAiOutput = function(title, content, sourceWId) {
                let fileData = {
                    original_name: title,
                    type: 'text/plain',
                    content: content
                };
                $(document).trigger('fileUploaded', [fileData, sourceWId]);
                window.showCustomModal('Success', 'File added to Output Field sources.');
            };

            $send.click(function() {
                let txt = $msg.val();
                let fileBase64 = $fileData.val();
                let fileMime = $fileMime.val();

                if(!txt && !fileBase64) return;

                let userMsgHtml = escapeHtml(txt).replace(/\n/g, '<br>');
                if (fileBase64) {
                    let safeFileName = escapeHtml($fileName.text());
                    userMsgHtml = `<i>[Attached File: ${safeFileName}]</i><br>` + userMsgHtml;
                }

                addMessage(userMsgHtml, 'user', true);

                $msg.val('');
                $filePreview.hide();
                $fileData.val('');
                $fileMime.val('');

                let loadingId = addMessage(`${ICONS.spinner} Processing...`, 'ai', true);

                let payload = { message: txt, mode: currentMode };
                if (fileBase64) {
                    payload.file = { data: fileBase64, mimeType: fileMime };
                }

                // Use the new backend API endpoint
                $.ajax({
                    url: 'backend/gemini_api.php',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(payload),
                    success: function(res) {
                        $(`#${loadingId}`).remove();
                        let aiText = "Terjadi kesalahan membaca respon AI.";

                        if (res.candidates && res.candidates.length > 0 && res.candidates[0].content && res.candidates[0].content.parts) {
                            aiText = res.candidates[0].content.parts[0].text;
                        } else if (res.error) {
                            aiText = "API Error: " + res.error.message;
                        }

                        // Now the user only wants the global Save Chat button for these modes, so we just append the text normally
                        addMessage(aiText, 'ai');
                    },
                    error: function() {
                        $(`#${loadingId}`).remove();
                        addMessage("Gagal terhubung ke server (Network Error).", 'sys');
                    }
                });
            });

            $msg.keypress(function(e) { if(e.which == 13) $send.click(); });
        }
    },

    // --- 14. CONCEPT MAPPER (NODES) ---
    'Concept Mapper': {
        render: function(wId) {
            return `
                <div style="height:100%; display:flex; flex-direction:column; background:#f5f5f5;">
                    <style>
                        .cm-toolbar-btn {
                            height: 32px;
                            padding: 0 10px;
                            background: #fff;
                            border: 1px solid #ccc;
                            border-radius: 3px;
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 0.8rem;
                            transition: all 0.2s;
                        }
                        .cm-toolbar-btn:hover { background: #f0f0f0; }
                        .cm-toolbar-btn.active { background: #e3f2fd; border-color: #2196f3; color: #2196f3; }
                        .cm-save-btn {
                            height: 32px;
                            padding: 0 15px;
                            background: #28a745;
                            color: white;
                            border: none;
                            border-radius: 3px;
                            cursor: pointer;
                            margin-left: auto;
                            font-weight: 500;
                            display: flex;
                            align-items: center;
                            gap: 5px;
                        }
                    </style>
                    <div style="padding:5px; background:#eee; border-bottom:1px solid #ccc; display:flex; gap:5px; align-items:center; flex-wrap: wrap;">
                        <button id="${wId}-add-rect" class="cm-toolbar-btn" title="Add Rectangle">${ICONS.square}</button>
                        <button id="${wId}-add-circle" class="cm-toolbar-btn" title="Add Circle">${ICONS.circle}</button>
                        <button id="${wId}-add-text" class="cm-toolbar-btn" title="Add Text">${ICONS.font}</button>
                        <button id="${wId}-add-line" class="cm-toolbar-btn" title="Draw Line">${ICONS.projectDiagram}</button>
                        <button id="${wId}-delete" class="cm-toolbar-btn" title="Delete Selected">${ICONS.eraser}</button>
                        <button id="${wId}-clear" class="cm-toolbar-btn" title="Clear All">${ICONS.trash}</button>
                        <button id="${wId}-save-btn" class="cm-save-btn">${ICONS.save} Save</button>
                    </div>
                    <div id="${wId}-canvas-area" style="flex:1; position:relative; overflow:hidden; background:white;">
                        <canvas id="${wId}-fabric-canvas"></canvas>
                    </div>
                </div>
            `;
        },
        init: function(wId) {
            const $widget = $(`#${wId}`);
            const $area = $(`#${wId}-canvas-area`);
            const canvasElement = document.getElementById(`${wId}-fabric-canvas`);

            // Initialize Fabric Canvas
            const canvas = new fabric.Canvas(canvasElement, {
                width: $area.width(),
                height: $area.height(),
                backgroundColor: '#ffffff'
            });

            // Restore state if exists
            let savedState = $widget.data('mapperFabricState');
            if (savedState) {
                canvas.loadFromJSON(savedState, canvas.renderAll.bind(canvas));
            }

            function updateCanvasSize() {
                canvas.setWidth($area.width());
                canvas.setHeight($area.height());
                canvas.renderAll();
            }

            $(`#${wId}-add-rect`).click(() => {
                const rect = new fabric.Rect({
                    left: 50, top: 50, fill: '#007bff', width: 100, height: 60, rx: 5, ry: 5
                });
                canvas.add(rect);
                canvas.setActiveObject(rect);
            });

            $(`#${wId}-add-circle`).click(() => {
                const circle = new fabric.Circle({
                    left: 100, top: 100, fill: '#28a745', radius: 40
                });
                canvas.add(circle);
                canvas.setActiveObject(circle);
            });

            $(`#${wId}-add-text`).click(() => {
                const text = new fabric.IText('Double click to edit', {
                    left: 150, top: 150, fontSize: 20
                });
                canvas.add(text);
                canvas.setActiveObject(text);
            });

            let isDrawingLine = false;
            let line, pointer;

            $(`#${wId}-add-line`).click(function() {
                isDrawingLine = !isDrawingLine;
                $(this).toggleClass('active', isDrawingLine);
                if (isDrawingLine) {
                    canvas.selection = false;
                    canvas.defaultCursor = 'crosshair';
                    canvas.forEachObject(obj => obj.selectable = false);
                } else {
                    canvas.selection = true;
                    canvas.defaultCursor = 'default';
                    canvas.forEachObject(obj => obj.selectable = true);
                }
            });

            canvas.on('mouse:down', function(o) {
                if (!isDrawingLine) return;
                let pointer = canvas.getPointer(o.e);
                let points = [pointer.x, pointer.y, pointer.x, pointer.y];
                line = new fabric.Line(points, {
                    strokeWidth: 2,
                    fill: '#999',
                    stroke: '#999',
                    originX: 'center',
                    originY: 'center'
                });
                canvas.add(line);
            });

            canvas.on('mouse:move', function(o) {
                if (!isDrawingLine || !line) return;
                let pointer = canvas.getPointer(o.e);
                line.set({ x2: pointer.x, y2: pointer.y });
                canvas.renderAll();
            });

            canvas.on('mouse:up', function(o) {
                if (!isDrawingLine) return;
                line.setCoords();
                line = null;
                // Keep drawing mode active until button clicked again?
                // Or disable after one line? Let's keep it active for better UX like mindmap tools.
            });

            $(`#${wId}-delete`).click(() => {
                const activeObjects = canvas.getActiveObjects();
                canvas.discardActiveObject();
                if (activeObjects.length) {
                    canvas.remove(...activeObjects);
                }
            });

            $(`#${wId}-clear`).click(() => {
                window.showConfirmModal('Clear Canvas', 'Are you sure you want to clear the entire concept map?', () => {
                    canvas.clear();
                    canvas.setBackgroundColor('#ffffff', canvas.renderAll.bind(canvas));
                });
            });

            $(`#${wId}-save-btn`).click(() => {
                // 1. Save JSON state to persistent data
                const jsonState = JSON.stringify(canvas.toJSON());
                $widget.data('mapperFabricState', jsonState);
                if (window.saveWorkspaceState) window.saveWorkspaceState();

                // 2. Export as PNG and upload
                window.trackActivity('export_concept_map', 'Fabric.js Export');

                // Ensure everything is deselected for clean export
                canvas.discardActiveObject().renderAll();

                const dataURL = canvas.toDataURL({
                    format: 'png',
                    quality: 1
                });

                // Convert dataURL to blob
                fetch(dataURL)
                    .then(res => res.blob())
                    .then(blob => {
                        let file = new File([blob], "ConceptMap_" + Date.now() + ".png", {type: "image/png"});
                        let formData = new FormData();
                        formData.append('file', file);
                        $.ajax({
                            url: 'backend/upload.php', type: 'POST', data: formData, contentType: false, processData: false,
                            success: function(res) {
                                if(res.status === 'success') {
                                    $(document).trigger('fileUploaded', [res, wId]);
                                    window.showCustomModal('Success', 'Concept Map saved and uploaded to Output Field.');
                                }
                            }
                        });
                    });
            });

            // Auto-save on object changes to ensure no loss on Ctrl+R
            const autoSave = () => {
                const jsonState = JSON.stringify(canvas.toJSON());
                $widget.data('mapperFabricState', jsonState);
                if (window.saveWorkspaceState) window.saveWorkspaceState();
            };

            canvas.on('object:modified', autoSave);
            canvas.on('object:added', autoSave);
            canvas.on('object:removed', autoSave);

            setTimeout(updateCanvasSize, 200);
            $widget.on('resize', updateCanvasSize);
        }
    },

    // --- 15. INTERACTIVE WHITEBOARD ---
    'Interactive Whiteboard': {
        render: function(wId) {
            return `
                <div style="display:flex; flex-direction:column; height:100%; background:white;">
                    <style>
                        .wb-toolbar-btn {
                            height: 32px;
                            padding: 0 10px;
                            background: #fff;
                            border: 1px solid #ccc;
                            border-radius: 3px;
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 0.8rem;
                            transition: all 0.2s;
                        }
                        .wb-toolbar-btn:hover { background: #f0f0f0; }
                        .wb-toolbar-btn.active { background: #e3f2fd; border-color: #2196f3; color: #2196f3; }
                        .wb-save-btn {
                            height: 32px;
                            padding: 0 15px;
                            background: #28a745;
                            color: white;
                            border: none;
                            border-radius: 3px;
                            cursor: pointer;
                            margin-left: auto;
                            font-weight: 500;
                            display: flex;
                            align-items: center;
                            gap: 5px;
                        }
                    </style>
                    <div style="padding:5px; background:#eee; border-bottom:1px solid #ccc; display:flex; gap:5px; align-items:center; flex-wrap:wrap;">
                        <input type="color" id="${wId}-color" value="#0000ff" style="width:30px; height:32px; border:1px solid #ccc; padding:0; background:white; cursor:pointer; border-radius:3px;" title="Pick Color">
                        <button id="${wId}-pen" class="wb-toolbar-btn active" title="Pen">${ICONS.edit}</button>
                        <button id="${wId}-highlighter" class="wb-toolbar-btn" title="Highlighter">${ICONS.marker}</button>
                        <button id="${wId}-eraser" class="wb-toolbar-btn" title="Eraser">${ICONS.eraser}</button>
                        <div style="display:flex; align-items:center; gap:5px; margin-left:5px;">
                            <label style="font-size:0.7rem; color:#666;">Size:</label>
                            <input type="range" id="${wId}-size" min="1" max="50" value="3" style="width:60px;">
                        </div>
                        <button id="${wId}-clear-wb" class="wb-toolbar-btn" title="Clear All" style="margin-left:5px;">${ICONS.trash}</button>
                        <button id="${wId}-save-upload-wb" class="wb-save-btn">${ICONS.upload} Save</button>
                    </div>
                    <canvas id="${wId}-wb" style="flex:1; cursor:crosshair; background:white;"></canvas>
                </div>
            `;
        },
        init: function(wId) {
            const $widget = $(`#${wId}`);
            const canvas = document.getElementById(`${wId}-wb`);
            const ctx = canvas.getContext('2d');
            const $color = $(`#${wId}-color`);
            const $size = $(`#${wId}-size`);

            let paths = $widget.data('whiteboardPaths') || [];
            let currentPath = [];
            let painting = false;
            let currentMode = 'pen'; // pen, highlighter, eraser

            function initCanvas() {
                const parent = canvas.parentElement;
                canvas.width = parent.clientWidth;
                canvas.height = parent.clientHeight;
                redraw();
            }

            function redraw() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                paths.forEach(path => {
                    if (path.points.length < 2) return;
                    ctx.beginPath();

                    if (path.mode === 'eraser') {
                        ctx.globalCompositeOperation = 'destination-out';
                    } else {
                        ctx.globalCompositeOperation = 'source-over';
                    }

                    ctx.strokeStyle = path.color || '#000';
                    ctx.lineWidth = path.width || 3;
                    ctx.moveTo(path.points[0].x, path.points[0].y);
                    for (let i = 1; i < path.points.length; i++) {
                        ctx.lineTo(path.points[i].x, path.points[i].y);
                    }
                    ctx.stroke();
                });
                ctx.globalCompositeOperation = 'source-over'; // Reset
            }

            function startPosition(e) {
                painting = true;
                const rect = canvas.getBoundingClientRect();
                let color = $color.val();
                let width = parseInt($size.val());

                if (currentMode === 'highlighter') {
                    // Semi-transparent
                    let r = parseInt(color.substring(1,3), 16);
                    let g = parseInt(color.substring(3,5), 16);
                    let b = parseInt(color.substring(5,7), 16);
                    color = `rgba(${r}, ${g}, ${b}, 0.3)`;
                    width = width * 3; // Highlighter usually broader
                }

                currentPath = {
                    mode: currentMode,
                    color: color,
                    width: width,
                    points: [{ x: e.clientX - rect.left, y: e.clientY - rect.top }]
                };
                paths.push(currentPath);
            }

            function finishedPosition() {
                painting = false;
                ctx.beginPath();
                $widget.data('whiteboardPaths', paths);
                if (window.saveWorkspaceState) window.saveWorkspaceState();
            }

            function draw(e) {
                if (!painting) return;
                const rect = canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                currentPath.points.push({ x, y });

                ctx.lineWidth = currentPath.width;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';

                if (currentMode === 'eraser') {
                    ctx.globalCompositeOperation = 'destination-out';
                    ctx.strokeStyle = 'rgba(0,0,0,1)'; // Value doesn't matter for destination-out
                } else {
                    ctx.globalCompositeOperation = 'source-over';
                    ctx.strokeStyle = currentPath.color;
                }

                ctx.lineTo(x, y);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(x, y);
            }

            $widget.find('#' + wId + '-pen').click(function() {
                currentMode = 'pen';
                $widget.find('.wb-toolbar-btn').removeClass('active');
                $(this).addClass('active');
            });

            $widget.find('#' + wId + '-highlighter').click(function() {
                currentMode = 'highlighter';
                $widget.find('.wb-toolbar-btn').removeClass('active');
                $(this).addClass('active');
            });

            $widget.find('#' + wId + '-eraser').click(function() {
                currentMode = 'eraser';
                $widget.find('.wb-toolbar-btn').removeClass('active');
                $(this).addClass('active');
            });

            canvas.addEventListener('mousedown', startPosition);
            canvas.addEventListener('mouseup', finishedPosition);
            canvas.addEventListener('mousemove', draw);

            $(`#${wId}-clear-wb`).click(() => {
                window.showConfirmModal('Clear Whiteboard', 'Are you sure you want to clear the entire whiteboard?', () => {
                    window.trackActivity('clear_whiteboard', 'Cleared paths');
                    paths = [];
                    $widget.data('whiteboardPaths', paths);
                    redraw();
                    if (window.saveWorkspaceState) window.saveWorkspaceState();
                });
            });

            $(`#${wId}-save-upload-wb`).click(() => {
                window.trackActivity('export_whiteboard', 'PNG Export');
                canvas.toBlob(blob => {
                    let file = new File([blob], "Whiteboard_" + Date.now() + ".png", {type: "image/png"});
                    let formData = new FormData();
                    formData.append('file', file);
                    $.ajax({
                        url: 'backend/upload.php', type: 'POST', data: formData, contentType: false, processData: false,
                        success: function(res) {
                            if(res.status === 'success') {
                                $(document).trigger('fileUploaded', [res, wId]);
                                window.showCustomModal('Success', 'Whiteboard progress uploaded to Output Field.');
                            }
                        }
                    });
                });
            });

            setTimeout(initCanvas, 200);
            $widget.on('resize', initCanvas);
        }
    },

    // --- 16. VOICE MEMO RECORDER ---
    'Voice Memo Recorder': {
        render: function(wId) {
            return `
                <div style="text-align:center; padding:20px;">
                    <div style="color:#ccc; display:flex; justify-content:center;" id="${wId}-mic-icon">${ICONS.microphone.replace('16','48').replace('16','48')}</div>
                    <div style="margin-top:20px;">
                        <button id="${wId}-rec" style="padding:10px 20px; border-radius:20px; border:none; background:#f44336; color:white; cursor:pointer;">Record</button>
                    </div>
                    <div id="${wId}-status" style="margin-top:10px; font-size:0.8rem; color:#888;">Ready</div>
                </div>
            `;
        },
        init: function(wId) {
            const $rec = $(`#${wId}-rec`);
            const $status = $(`#${wId}-status`);
            const $icon = $(`#${wId}-mic-icon`);

            let mediaRecorder;
            let audioChunks = [];
            let isRecording = false;

            $rec.click(async function() {
                if(!isRecording) {
                    try {
                        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                        mediaRecorder = new MediaRecorder(stream);
                        audioChunks = [];

                        mediaRecorder.ondataavailable = (event) => {
                            audioChunks.push(event.data);
                        };

                        mediaRecorder.onstop = () => {
                            const audioBlob = new Blob(audioChunks, { type: 'audio/mpeg' });
                            let file = new File([audioBlob], "VoiceMemo_" + Date.now() + ".mp3", {type: "audio/mpeg"});
                            let formData = new FormData();
                            formData.append('file', file);

                            $status.text('Saving...');
                            $.ajax({
                                url: 'backend/upload.php', type: 'POST', data: formData, contentType: false, processData: false,
                                success: function(res) {
                                    if(res.status === 'success') {
                                        $(document).trigger('fileUploaded', [res, wId]);
                                        $status.text('Saved to Output Field!');
                                    } else {
                                        $status.text('Upload Error: ' + res.message);
                                    }
                                },
                                error: function() { $status.text('Server Error.'); }
                            });

                            // Stop all tracks to release mic
                            stream.getTracks().forEach(track => track.stop());
                        };

                        mediaRecorder.start();
                        isRecording = true;
                        $(this).text('Stop').css('background', '#333');
                        $icon.css('color', 'red');
                        $status.text('Recording...');
                    } catch (err) {
                        console.error("Mic access denied:", err);
                        window.showCustomModal('Error', 'Microphone access denied or not available.');
                    }
                } else {
                    mediaRecorder.stop();
                    isRecording = false;
                    $(this).text('Record').css('background', '#f44336');
                    $icon.css('color', '#ccc');
                }
            });
        }
    },

    // --- 17. PHOTO FRAME ---
    'Photo Frame': {
        render: function(wId) {
            return `
                <div style="height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; background:#f9f9f9; position:relative; overflow:hidden; border:2px dashed #ccc; border-radius:10px;" id="${wId}-frame">
                    <div id="${wId}-placeholder" style="text-align:center; color:#888; padding: 20px; width: 100%;">
                        <div style="color:#ccc; margin-bottom:10px;">${ICONS.upload.replace('16','48').replace('16','48')}</div>
                        <p style="color:#888;">Drag & Drop files here</p>
                        <button class="upload-trigger-btn" style="margin-top:10px; padding:5px 10px; cursor: pointer;">Or Click to Upload</button>
                    </div>
                    <img id="${wId}-img" style="display:none; width:100%; height:100%; object-fit:contain;">
                    <input type="file" id="${wId}-file" style="display:none;" accept="image/*">
                    <button id="${wId}-change-btn" style="position:absolute; bottom:5px; right:5px; background:rgba(0,0,0,0.5); color:white; border:none; padding:4px 8px; border-radius:3px; cursor:pointer; font-size:0.7rem; display:none;">${ICONS.sync}</button>
                </div>
            `;
        },
        init: function(wId) {
            const $widget = $(`#${wId}`);
            const $frame = $(`#${wId}-frame`);
            const $img = $(`#${wId}-img`);
            const $placeholder = $(`#${wId}-placeholder`);
            const $file = $(`#${wId}-file`);
            const $changeBtn = $(`#${wId}-change-btn`);
            const $uploadBtn = $(`#${wId}-upload-btn`);

            $(document).on(`toggleFullScreen.${wId}`, function(e, targetWId, isFull) {
                if (targetWId === wId) {
                    if (isFull) {
                        $widget.find('.widget-header').hide();
                        $widget.find('.widget-content').css('height', '100%');
                    } else {
                        $widget.find('.widget-header').show();
                        $widget.find('.widget-content').css('height', 'calc(100% - 35px)');
                    }
                }
            });

            $(document).on(`detachImage.${wId}`, function(e, targetWId) {
                if (targetWId === wId) {
                    $widget.data('photoPath', null);
                    $img.hide().attr('src', '');
                    $placeholder.html(`
                        <div style="color:#ccc; margin-bottom:10px;">${ICONS.upload.replace('16','48').replace('16','48')}</div>
                        <p style="color:#888;">Drag & Drop files here</p>
                        <button class="upload-trigger-btn" style="margin-top:10px; padding:5px 10px; cursor: pointer;">Or Click to Upload</button>
                    `).show();
                    $changeBtn.hide();
                    if (window.saveWorkspaceState) window.saveWorkspaceState();
                }
            });

            // Restore from data
            let savedImg = $widget.data('photoPath');
            if (savedImg) {
                $img.attr('src', savedImg).show();
                $placeholder.hide();
                $changeBtn.show();
            }

            let isFull = $widget.data('isFullScreen');
            if (isFull === true || isFull === 'true') {
                setTimeout(() => {
                    $(document).trigger('toggleFullScreen', [wId, true]);
                }, 100);
            }

            // Single delegated click listener for all upload triggers
            $widget.on('click', '.upload-trigger-btn', function(e) {
                e.stopPropagation();
                $file[0].click(); // Use native click for reliability
            });

            $frame.on('click', function(e) {
                // If frame is empty, any click on background triggers upload
                // except if clicking a button (though changeBtn is hidden when empty)
                if (!$img.is(':visible') && !$(e.target).is('button') && !$(e.target).closest('button').length) {
                    $file[0].click();
                }
            });

            $changeBtn.on('click', function(e) { e.stopPropagation(); $file.click(); });

            // Drag and drop support
            $frame.on('dragover', function(e) {
                e.preventDefault();
                e.stopPropagation();
                $(this).css('border-color', '#007bff');
            });

            $frame.on('dragleave', function(e) {
                e.preventDefault();
                e.stopPropagation();
                $(this).css('border-color', '#ccc');
            });

            $frame.on('drop', function(e) {
                e.preventDefault();
                e.stopPropagation();
                $(this).css('border-color', '#ccc');
                const files = e.originalEvent.dataTransfer.files;
                if (files.length > 0 && files[0].type.startsWith('image/')) {
                    handlePhotoUpload(files[0]);
                }
            });

            function handlePhotoUpload(file) {
                let formData = new FormData();
                formData.append('file', file);

                // Show loading state
                $placeholder.html(`${ICONS.spinner.replace('16','48').replace('16','48')}<p>Uploading...</p>`).show();
                $img.hide();

                $.ajax({
                    url: 'backend/upload.php',
                    type: 'POST',
                    data: formData,
                    contentType: false,
                    processData: false,
                    success: function(res) {
                        if (res.status === 'success') {
                            $img.attr('src', res.file_path).show();
                            $placeholder.hide();
                            $changeBtn.show();

                            // Save to persistent data
                            $widget.data('photoPath', res.file_path);
                            if (window.saveWorkspaceState) window.saveWorkspaceState();
                        } else {
                            $placeholder.html(`${ICONS.exclamationTriangle.replace('16','48').replace('16','48')}<p>Error: `+res.message+`</p>`);
                            window.showCustomModal('Error', res.message);
                        }
                    },
                    error: function() {
                        $placeholder.html(`${ICONS.exclamationTriangle.replace('16','48').replace('16','48')}<p>Upload Failed</p>`);
                        window.showCustomModal('Error', 'Failed to upload photo.');
                    }
                });
            }

            $file.on('change', function() {
                const file = this.files[0];
                if (file) {
                    handlePhotoUpload(file);
                }
            });
        }
    },
    // --- 10. ACTIVITY TRACKER ---
    'Activity Tracker': {
        render: function(wId) {
            return `
                <div style="height:100%; display:flex; flex-direction:column; padding:10px; box-sizing:border-box;">
                    <div id="${wId}-scope-info" style="font-size: 0.7rem; color: #007bff; margin-bottom: 5px; font-weight: bold; text-align: right;">Global View</div>
                    <div style="height:150px; margin-bottom:10px;">
                        <canvas id="${wId}-chart"></canvas>
                    </div>
                    <h5 style="margin-bottom:5px;">Recent Actions</h5>
                    <div id="${wId}-activity-list" style="flex:1; overflow-y:auto; font-size:0.75rem; border-top:1px solid #eee; padding-top:5px;">
                        <p style="color:#888; text-align:center;">Loading history...</p>
                    </div>
                </div>
            `;
        },
        init: function(wId) {
            const $widget = $(`#${wId}`);
            const $list = $(`#${wId}-activity-list`);
            const $scopeInfo = $(`#${wId}-scope-info`);
            let chartInstance = null;
            let currentScope = $widget.data('activityScope') || 'all';

            function escapeHtml(text) {
                return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            }

            function refreshActivity() {
                $scopeInfo.text(currentScope === 'all' ? 'Global View' : 'Room View');

                let roomId = (typeof INITIAL_STATE !== 'undefined') ? INITIAL_STATE.activeRoomId : null;
                let url = `backend/get_activity.php?scope=${currentScope}`;
                if (currentScope === 'room' && roomId) {
                    url += `&room_id=${roomId}`;
                }

                $.get(url, function(res) {
                    if (res.status === 'success') {
                        // 1. Update List
                        $list.empty();
                        if (res.list.length === 0) {
                            $list.html('<p style="color:#888; text-align:center;">No activity yet.</p>');
                        } else {
                            res.list.forEach(a => {
                                let timeStr = a.waktu_transaksi.replace(/-/g, "/");
                                let time = new Date(timeStr).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

                                let icon = ICONS.circle;
                                let color = '#ccc';
                                let type = a.jenis_aktivitas.toLowerCase();

                                if (type.includes('create')) { icon = ICONS.plusCircle; color = '#28a745'; }
                                else if (type.includes('delete')) { icon = ICONS.trash; color = '#dc3545'; }
                                else if (type.includes('edit') || type.includes('rename') || type.includes('resize') || type.includes('move')) { icon = ICONS.edit; color = '#ffc107'; }
                                else if (type.includes('open')) { icon = ICONS.folderOpen; color = '#17a2b8'; }
                                else if (type.includes('login')) { icon = ICONS.signInAlt; color = '#007bff'; }

                                $list.append(`
                                    <div style="padding:8px 0; border-bottom:1px solid #f1f1f1; display:flex; align-items:flex-start; gap:10px;">
                                        <span style="color:${color}; margin-top:3px; width:15px; display:flex; justify-content:center;">${icon}</span>
                                        <div style="flex:1;">
                                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                                <span style="font-weight:600; font-size:0.8rem; text-transform:capitalize;">${a.jenis_aktivitas.replace(/_/g,' ')}</span>
                                                <span style="color:#999; font-size:0.7rem;">${time}</span>
                                            </div>
                                            <div style="font-size:0.7rem; color:#666; margin-top:2px;">${escapeHtml(a.detail_aktivitas)}</div>
                                        </div>
                                    </div>
                                `);
                            });
                        }

                        // 2. Update Chart
                        const labels = res.chart.map(d => d.date.split('-').slice(1).join('/'));
                        const data = res.chart.map(d => d.count);

                        if (chartInstance) chartInstance.destroy();
                        const canvas = document.getElementById(`${wId}-chart`);
                        if (canvas) {
                            chartInstance = new Chart(canvas, {
                                type: 'bar',
                                data: {
                                    labels: labels,
                                    datasets: [{
                                        label: 'Actions',
                                        data: data,
                                        backgroundColor: 'rgba(54, 162, 235, 0.5)',
                                        borderColor: 'rgba(54, 162, 235, 1)',
                                        borderWidth: 1
                                    }]
                                },
                                options: {
                                    maintainAspectRatio: false,
                                    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
                                    plugins: { legend: { display: false } }
                                }
                            });
                        }
                    }
                });
            }

            refreshActivity();

            $(document).on(`refreshWidget.${wId}`, refreshActivity);

            $(document).on(`setActivityScope.${wId}`, function(e, targetWId, scope) {
                if (targetWId === wId) {
                    currentScope = scope;
                    $widget.data('activityScope', scope);
                    refreshActivity();
                }
            });

            const poll = setInterval(refreshActivity, 30000);
            $(`#${wId}`).on('remove', () => {
                clearInterval(poll);
                $(document).off(`refreshWidget.${wId}`);
                $(document).off(`setActivityScope.${wId}`);
            });
        }
    }
};
