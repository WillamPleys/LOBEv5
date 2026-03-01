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
            function updateGrid() {
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
            }
            $widget.find('input, select').on('input change', updateGrid);
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
                    <textarea style="flex:1; width:100%; border:none; background:transparent; resize:none; outline:none; font-family:'Comic Sans MS', cursive, sans-serif; font-size:1.1rem; padding:10px;" placeholder="Don't forget..." id="${wId}-textarea"></textarea>
                </div>
            `;
        },
        init: function(wId) {
            const $widget = $(`#${wId}`);
            const $textarea = $(`#${wId}-textarea`);

            // Restore color
            let savedColor = $widget.data('noteColor') || '#ffeb3b';
            $widget.find('.widget-content').css('background-color', savedColor);

            // Restore text
            let savedText = $widget.data('noteText') || '';
            $textarea.val(savedText);

            $widget.find('.color-btn').on('click', function() {
                let color = $(this).data('color');
                $widget.find('.widget-content').css('background-color', color);
                $widget.data('noteColor', color);
                if (window.saveWorkspaceState) window.saveWorkspaceState();
            });

            $textarea.on('input', function() {
                $widget.data('noteText', $(this).val());
                if (window.saveWorkspaceState) window.saveWorkspaceState();
            });
        }
    },
    // --- 3. TO-DO LIST ---
    'To-Do List': {
        render: function(wId) {
            return `
                <div style="display:flex; flex-direction:column; height:100%;">
                    <div style="display:flex; gap:5px; margin-bottom:10px;">
                        <input type="text" id="${wId}-input" placeholder="New Task..." style="flex:1; padding:5px;">
                        <input type="time" id="${wId}-time" style="padding:5px;">
                        <button id="${wId}-add" style="padding:5px 10px; cursor:pointer;">+</button>
                    </div>
                    <ul id="${wId}-list" style="list-style:none; padding:0; flex:1; overflow-y:auto;"></ul>
                </div>
            `;
        },
        init: function(wId) {
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
                        <i class="fas fa-times delete-task" style="cursor:pointer; color:#ccc;"></i>
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
                    $input.val(''); $time.val('');
                    saveTasks();
                }
            });
            $input.keypress(function(e) { if(e.which == 13) $btn.click(); });
        }
    },
    // --- 4. TIMER ---
    'Timer': {
        render: function(wId) {
            return `
                <div style="text-align:center; padding-top:20px;">
                    <input type="text" placeholder="Timer Title" id="${wId}-title" style="text-align:center; border:none; border-bottom:1px solid #ccc; width:80%; margin-bottom:15px; outline:none;">
                    <div id="${wId}-display" style="font-size:3rem; font-family:monospace; font-weight:bold; margin-bottom:20px;">00:00:00</div>
                    <div>
                        <button id="${wId}-start" style="padding:10px 20px; background:#4CAF50; color:white; border:none; border-radius:4px; cursor:pointer;">Start</button>
                        <button id="${wId}-reset" style="padding:10px 20px; background:#f44336; color:white; border:none; border-radius:4px; cursor:pointer;">Reset</button>
                    </div>
                </div>
            `;
        },
        init: function(wId) {
            const $widget = $(`#${wId}`);
            const $title = $(`#${wId}-title`);
            let seconds = 0; let interval = null;
            const $display = $(`#${wId}-display`); const $startBtn = $(`#${wId}-start`);

            // Restore title
            $title.val($widget.data('timerTitle') || '');

            $title.on('input', function() {
                $widget.data('timerTitle', $(this).val());
                if (window.saveWorkspaceState) window.saveWorkspaceState();
            });

            function formatTime(s) {
                let h = Math.floor(s / 3600); let m = Math.floor((s % 3600) / 60); let sec = s % 60;
                return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`;
            }
            $startBtn.click(function() {
                if(interval) { clearInterval(interval); interval = null; $(this).text('Start').css('background', '#4CAF50'); }
                else { interval = setInterval(() => { seconds++; $display.text(formatTime(seconds)); }, 1000); $(this).text('Pause').css('background', '#FF9800'); }
            });
            $(`#${wId}-reset`).click(function() { if(interval) clearInterval(interval); interval = null; seconds = 0; $display.text('00:00:00'); $startBtn.text('Start').css('background', '#4CAF50'); });
        }
    },
    // --- 5. FLASHCARD ---
    'Flashcard': {
        render: function(wId) {
            return `
                <div style="height:100%; display:flex; flex-direction:column; position:relative;">
                    <div id="${wId}-play-area" style="flex:1; display:flex; flex-direction:column;">
                        <div class="card-area" style="flex:1; perspective:1000px; cursor:pointer; position:relative; margin-bottom:10px;">
                            <div class="card-inner" style="width:100%; height:100%; position:relative; text-align:center; transition:transform 0.6s; transform-style:preserve-3d; box-shadow:0 4px 8px rgba(0,0,0,0.1); border-radius:8px; background:white; border:1px solid #ddd;">
                                <div class="card-front" style="position:absolute; width:100%; height:100%; backface-visibility:hidden; display:flex; align-items:center; justify-content:center; padding:20px; font-weight:bold; font-size:1.2rem;">Question?</div>
                                <div class="card-back" style="position:absolute; width:100%; height:100%; backface-visibility:hidden; transform:rotateY(180deg); display:flex; align-items:center; justify-content:center; padding:20px; color:blue;">Answer!</div>
                            </div>
                        </div>
                        <div style="display:flex; justify-content:space-between; gap:5px;">
                            <button id="${wId}-prev" style="flex:1; padding:10px;">&lt; Prev</button>
                            <button id="${wId}-next" style="flex:1; padding:10px;">Next &gt;</button>
                        </div>
                        <div style="text-align:center; margin-top:5px; font-size:0.8rem; color:#888;">Card <span id="${wId}-index-display">1</span> of <span id="${wId}-total-display">1</span></div>
                    </div>

                    <div id="${wId}-settings-area" style="position:absolute; top:0; left:0; width:100%; height:100%; background:white; display:none; flex-direction:column; padding:10px; box-sizing:border-box; z-index:5;">
                        <h4 style="margin-bottom:10px;">Card Editor</h4>
                        <div id="${wId}-editor-list" style="flex:1; overflow-y:auto; margin-bottom:10px; border:1px solid #eee; padding:5px;"></div>
                        <div style="display:flex; gap:5px;">
                            <button id="${wId}-add-card" class="btn btn-secondary btn-sm" style="flex:1;">+ Add Card</button>
                            <button id="${wId}-save-settings" class="btn btn-primary btn-sm" style="flex:1;">Save & Close</button>
                        </div>
                    </div>
                </div>
            `;
        },
        init: function(wId) {
            const $widget = $(`#${wId}`);
            const $playArea = $(`#${wId}-play-area`);
            const $settingsArea = $(`#${wId}-settings-area`);
            const $editorList = $(`#${wId}-editor-list`);
            const $indexDisplay = $(`#${wId}-index-display`);
            const $totalDisplay = $(`#${wId}-total-display`);

            let isFlipped = false;
            let currentIdx = 0;
            let cards = $widget.data('flashcards') || [{q: "Sample Question?", a: "Sample Answer!"}];

            function updateCard() {
                if (cards.length === 0) {
                    $widget.find('.card-front').text("No cards. Click Cog to add!");
                    $widget.find('.card-back').text("No cards.");
                    $indexDisplay.text(0);
                    $totalDisplay.text(0);
                    return;
                }
                if (currentIdx >= cards.length) currentIdx = 0;
                $widget.find('.card-front').text(cards[currentIdx].q);
                $widget.find('.card-back').text(cards[currentIdx].a);
                $indexDisplay.text(currentIdx + 1);
                $totalDisplay.text(cards.length);
                if(isFlipped) { $widget.find('.card-inner').css('transform', 'rotateY(0deg)'); isFlipped = false; }
            }

            function renderEditor() {
                $editorList.empty();
                cards.forEach((c, i) => {
                    let item = $(`
                        <div style="margin-bottom:10px; padding:5px; border:1px solid #eee; position:relative;">
                            <input type="text" class="card-q" placeholder="Question" value="${escapeHtml(c.q)}" style="width:100%; margin-bottom:2px; font-size:0.8rem;">
                            <input type="text" class="card-a" placeholder="Answer" value="${escapeHtml(c.a)}" style="width:100%; font-size:0.8rem;">
                            <i class="fas fa-trash remove-card" style="position:absolute; top:5px; right:5px; color:#ff4d4d; cursor:pointer; font-size:0.7rem;"></i>
                        </div>
                    `);
                    item.find('.remove-card').click(() => { item.remove(); });
                    $editorList.append(item);
                });
            }

            $(document).on(`toggleWidgetSettings.${wId}`, function() {
                if ($settingsArea.is(':visible')) {
                    $settingsArea.hide();
                } else {
                    renderEditor();
                    $settingsArea.show();
                }
            });

            $(`#${wId}-add-card`).click(() => {
                $editorList.append(`
                    <div style="margin-bottom:10px; padding:5px; border:1px solid #eee; position:relative;">
                        <input type="text" class="card-q" placeholder="Question" style="width:100%; margin-bottom:2px; font-size:0.8rem;">
                        <input type="text" class="card-a" placeholder="Answer" style="width:100%; font-size:0.8rem;">
                        <i class="fas fa-trash remove-card" style="position:absolute; top:5px; right:5px; color:#ff4d4d; cursor:pointer; font-size:0.7rem;" onclick="$(this).parent().remove()"></i>
                    </div>
                `);
                $editorList.scrollTop($editorList[0].scrollHeight);
            });

            $(`#${wId}-save-settings`).click(() => {
                let newCards = [];
                $editorList.children().each(function() {
                    let q = $(this).find('.card-q').val().trim();
                    let a = $(this).find('.card-a').val().trim();
                    if (q || a) newCards.push({q: q, a: a});
                });
                cards = newCards;
                $widget.data('flashcards', cards);
                if (window.saveWorkspaceState) window.saveWorkspaceState();
                updateCard();
                $settingsArea.hide();
            });

            $widget.find('.card-area').click(function() {
                if (cards.length > 0) {
                    isFlipped = !isFlipped;
                    $widget.find('.card-inner').css('transform', isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)');
                }
            });
            $widget.find(`#${wId}-next`).click(function() { if (cards.length > 0) { currentIdx = (currentIdx + 1) % cards.length; updateCard(); } });
            $widget.find(`#${wId}-prev`).click(function() { if (cards.length > 0) { currentIdx = (currentIdx - 1 + cards.length) % cards.length; updateCard(); } });

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
                        list.append(`<li style="padding:8px; border-bottom:1px solid #eee; cursor:pointer;" onclick="window.switchRoom('${room.id}', '${safeRoom}')"><i class="fas fa-door-open"></i> ${safeRoom}</li>`);
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
                    <i class="fas fa-cloud-upload-alt" style="font-size:3rem; color:#ccc; margin-bottom:10px;"></i>
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
                    let icon = 'fa-file';
                    let lowerName = f.original_name.toLowerCase();
                    if(f.type.includes('image')) icon = 'fa-file-image';
                    else if(f.type.includes('audio') || lowerName.endsWith('.mp3') || lowerName.endsWith('.wav')) icon = 'fa-file-audio';
                    else if(f.type.includes('video') || lowerName.endsWith('.mp4')) icon = 'fa-file-video';
                    else if(lowerName.endsWith('.docx') || lowerName.endsWith('.doc')) icon = 'fa-file-word';
                    else if(lowerName.endsWith('.html')) icon = 'fa-file-code';
                    else if(lowerName.endsWith('.pdf') || f.type.includes('pdf')) icon = 'fa-file-pdf';
                    else if(f.type.includes('text') || lowerName.endsWith('.txt')) icon = 'fa-file-alt';

                    let safeName = escapeHtml(f.original_name);
                    let item = $(`
                        <div style="padding:10px; border-bottom:1px solid #eee; display:flex; align-items:center; cursor:pointer;" class="file-item" data-id="${f.id}">
                            <i class="fas ${icon}" style="margin-right:10px; color:#555; width:20px; text-align:center;"></i>
                            <span class="file-name-text" style="flex:1; overflow:hidden; text-overflow:ellipsis;">${safeName}</span>
                            <i class="fas fa-pencil-alt rename-icon" style="margin-left:10px; color:#ccc; font-size:0.8rem;" title="Rename File"></i>
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
                            $content.html('<div style="margin:auto; text-align:center;"><i class="fas fa-spinner fa-spin"></i> Loading document...</div>');
                            fetch(f.file_path)
                                .then(response => response.arrayBuffer())
                                .then(arrayBuffer => mammoth.convertToHtml({arrayBuffer: arrayBuffer}))
                                .then(result => {
                                    $content.html(`<div style="padding:40px; background:white; color:black; max-width:800px; margin:20px auto; box-shadow:0 0 10px rgba(0,0,0,0.1); min-height:100%; box-sizing:border-box; overflow-y:auto; font-family: 'Times New Roman', serif;">${result.value}</div>`);
                                })
                                .catch(err => {
                                    // Fallback for older .doc if mammoth fails (since mammoth mainly supports docx)
                                    $content.html('<div style="margin:auto; text-align:center;"><i class="fas fa-file-word" style="font-size:4rem; color:#ccc; margin-bottom:10px;"></i><br>Direct preview for old .doc files is limited. Please use .docx for better viewing.<br><br><a href="'+f.file_path+'" download class="btn btn-primary">Download File</a></div>');
                                });
                        } else if(lowerName.endsWith('.txt') || lowerName.endsWith('.html') || lowerName.endsWith('.js') || lowerName.endsWith('.css') || lowerName.endsWith('.php')) {
                            if (f.content) {
                                let safeContent = escapeHtml(f.content);
                                $content.html(`<div style="padding:20px; white-space:pre-wrap; font-family:monospace; font-size:14px; color:#333;">${safeContent}</div>`);
                            } else {
                                $content.html('<div style="margin:auto; text-align:center;"><i class="fas fa-spinner fa-spin"></i> Loading file...</div>');
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
                            $content.html('<div style="margin:auto; text-align:center;"><i class="fas fa-file-alt" style="font-size:4rem; color:#ccc; margin-bottom:10px;"></i><br>Preview not available for this file type.</div>');
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
                    <div id="${wId}-event-editor-wrapper" style="margin-top:10px; padding-top:10px; border-top:1px solid #ddd; min-height:110px; display:none; background:white;">
                        <div id="${wId}-event-editor-content">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                                <div style="font-size:0.8rem; font-weight:bold;" id="${wId}-selected-date-label">Events for ...</div>
                                <i class="fas fa-times" id="${wId}-close-editor" style="cursor:pointer; color:#888; padding: 2px 5px;"></i>
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
    // --- 10. ACTIVITY ---
    'Activity Tracker': {
        render: function(wId) {
            return `
                <div style="height:100%; display:flex; flex-direction:column; padding:10px; box-sizing:border-box;">
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
            const $list = $(`#${wId}-activity-list`);

            function refreshActivity() {
                $.get('backend/get_activity.php', function(res) {
                    if (res.status === 'success') {
                        // 1. Update List
                        $list.empty();
                        if (res.list.length === 0) {
                            $list.html('<p style="color:#888; text-align:center;">No activity yet.</p>');
                        } else {
                            res.list.forEach(a => {
                                let time = new Date(a.waktu_transaksi).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                                $list.append(`
                                    <div style="padding:4px 0; border-bottom:1px solid #f9f9f9; display:flex; justify-content:space-between;">
                                        <span style="font-weight:500;">${a.jenis_aktivitas.replace('_',' ')}</span>
                                        <span style="color:#888;">${time}</span>
                                    </div>
                                    <div style="font-size:0.7rem; color:#666; margin-bottom:4px;">${escapeHtml(a.detail_aktivitas)}</div>
                                `);
                            });
                        }

                        // 2. Update Chart
                        const labels = res.chart.map(d => d.date.split('-').slice(1).join('/'));
                        const data = res.chart.map(d => d.count);

                        new Chart(document.getElementById(`${wId}-chart`), {
                            type: 'bar',
                            data: {
                                labels: labels,
                                datasets: [{
                                    label: 'Daily Actions',
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
                });
            }

            refreshActivity();
            // Optional: poll every minute
            const poll = setInterval(refreshActivity, 60000);
            $(`#${wId}`).on('remove', () => clearInterval(poll));
        }
    },

    // ==========================================
    // --- BATCH 3: COMPLEX & AI FEATURES ---
    // ==========================================

    // --- 11. RICH TEXT NOTE (CKEDITOR) ---
    'Rich Text Note': {
        render: function(wId) {
            return `
                <div style="display:flex; flex-direction:column; height:100%;">
                    <div style="display:flex; justify-content:flex-end; padding:5px; background:#f4f4f4; border-bottom:1px solid #ddd;">
                        <button id="${wId}-save-btn" style="padding:5px 15px; background:#28a745; color:white; border:none; border-radius:3px; cursor:pointer;"><i class="fas fa-save"></i> Save</button>
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
                        <button id="${wId}-save-btn" style="padding:5px 15px; background:#007bff; color:white; border:none; border-radius:3px; cursor:pointer;"><i class="fas fa-save"></i> Save Code</button>
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
                            <button id="${wId}-save-chat" style="background:#28a745; color:white; border:none; padding:4px 8px; border-radius:3px; cursor:pointer; font-size:0.8rem; display:none;"><i class="fas fa-save"></i> Save Chat</button>
                        </div>
                    </div>
                    <div style="flex:1; overflow-y:auto; padding:10px; background:#f4f4f4; margin-bottom:10px; border-radius:5px;" id="${wId}-chat-box">
                        <div style="color:#888; font-size:0.8rem; text-align:center;">Gemini 2.5 Flash Ready...</div>
                    </div>

                    <div id="${wId}-file-preview" style="display:none; padding:5px; background:#fff3cd; border:1px solid #ffeeba; border-radius:4px; margin-bottom:5px; font-size:0.8rem; display:flex; justify-content:space-between;">
                        <span id="${wId}-file-name"></span>
                        <i class="fas fa-times" style="cursor:pointer;" onclick="$(this).parent().hide(); $('#${wId}-file-data').val('');"></i>
                    </div>

                    <div style="display:flex; gap:5px;">
                        <input type="hidden" id="${wId}-file-data">
                        <input type="hidden" id="${wId}-file-mime">
                        <input type="file" id="${wId}-file-input" style="display:none;">
                        <button onclick="$('#${wId}-file-input').click()" style="padding:8px 12px; background:#6c757d; color:white; border:none; border-radius:4px; cursor:pointer;" title="Upload File">
                            <i class="fas fa-paperclip"></i>
                        </button>
                        <input type="text" id="${wId}-msg" placeholder="Ask AI..." style="flex:1; padding:8px; border:1px solid #ddd; border-radius:4px;">
                        <button id="${wId}-send" style="padding:8px 15px; background:#007bff; color:white; border:none; border-radius:4px; cursor:pointer;"><i class="fas fa-paper-plane"></i></button>
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

                let loadingId = addMessage('<i class="fas fa-spinner fa-spin"></i> Processing...', 'ai', true);

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
                    <div style="padding:5px; background:#eee; border-bottom:1px solid #ccc; display:flex; gap:5px; align-items:center;">
                        <button id="${wId}-add-node" class="btn btn-sm" title="Add Node"><i class="fas fa-plus-circle"></i></button>
                        <button id="${wId}-clear" class="btn btn-sm" title="Clear All"><i class="fas fa-trash-alt"></i></button>
                        <button id="${wId}-save-upload" class="btn btn-primary btn-sm" style="margin-left:auto;"><i class="fas fa-file-upload"></i> Save & Upload</button>
                    </div>
                    <div id="${wId}-canvas-area" style="flex:1; position:relative; overflow:hidden; background:white; cursor:crosshair;">
                        <canvas id="${wId}-link-canvas" style="position:absolute; top:0; left:0; pointer-events:none;"></canvas>
                    </div>
                </div>
            `;
        },
        init: function(wId) {
            const $widget = $(`#${wId}`);
            const $area = $(`#${wId}-canvas-area`);
            const canvas = document.getElementById(`${wId}-link-canvas`);
            const ctx = canvas.getContext('2d');

            let nodes = $widget.data('mapperNodes') || [];
            let connections = $widget.data('mapperLinks') || [];
            let draggingNode = null;

            function updateCanvasSize() {
                canvas.width = $area.width();
                canvas.height = $area.height();
                drawLinks();
            }

            function drawLinks() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.strokeStyle = '#999';
                ctx.lineWidth = 2;
                connections.forEach(conn => {
                    let from = nodes.find(n => n.id === conn.from);
                    let to = nodes.find(n => n.id === conn.to);
                    if (from && to) {
                        ctx.beginPath();
                        ctx.moveTo(from.x + 50, from.y + 25);
                        ctx.lineTo(to.x + 50, to.y + 25);
                        ctx.stroke();
                    }
                });
            }

            function createNodeEl(node) {
                let el = $(`
                    <div class="mapper-node" id="${wId}-node-${node.id}" style="position:absolute; left:${node.x}px; top:${node.y}px; width:100px; height:50px; background:#fff; border:2px solid #007bff; border-radius:8px; display:flex; align-items:center; justify-content:center; cursor:move; z-index:10; font-size:0.8rem; text-align:center; padding:5px; box-shadow:0 2px 4px rgba(0,0,0,0.1);">
                        <span contenteditable="true" style="outline:none; width:100%;">${escapeHtml(node.text)}</span>
                    </div>
                `);

                el.draggable({
                    containment: "parent",
                    drag: function(e, ui) {
                        node.x = ui.position.left;
                        node.y = ui.position.top;
                        drawLinks();
                    },
                    stop: function() {
                        $widget.data('mapperNodes', nodes);
                        if (window.saveWorkspaceState) window.saveWorkspaceState();
                    }
                });

                el.find('span').on('blur', function() {
                    node.text = $(this).text();
                    $widget.data('mapperNodes', nodes);
                    if (window.saveWorkspaceState) window.saveWorkspaceState();
                });

                // Simple linking: click one then another
                el.on('click', function(e) {
                    if (e.shiftKey) {
                        // Delete node
                        nodes = nodes.filter(n => n.id !== node.id);
                        connections = connections.filter(c => c.from !== node.id && c.to !== node.id);
                        el.remove();
                        drawLinks();
                        saveData();
                        return;
                    }
                    if (window._mapperPendingSource && window._mapperPendingSource.wId === wId) {
                        if (window._mapperPendingSource.nodeId !== node.id) {
                            connections.push({from: window._mapperPendingSource.nodeId, to: node.id});
                            drawLinks();
                            saveData();
                        }
                        window._mapperPendingSource = null;
                        $('.mapper-node').css('border-color', '#007bff');
                    } else {
                        window._mapperPendingSource = { wId: wId, nodeId: node.id };
                        el.css('border-color', '#28a745');
                    }
                });

                $area.append(el);
            }

            function saveData() {
                $widget.data('mapperNodes', nodes);
                $widget.data('mapperLinks', connections);
                if (window.saveWorkspaceState) window.saveWorkspaceState();
            }

            $(`#${wId}-add-node`).click(() => {
                let node = { id: Date.now(), x: 50, y: 50, text: 'New Concept' };
                nodes.push(node);
                createNodeEl(node);
                saveData();
            });

            $(`#${wId}-clear`).click(() => {
                nodes = [];
                connections = [];
                $area.find('.mapper-node').remove();
                drawLinks();
                saveData();
            });

            $(`#${wId}-save-upload`).click(() => {
                // Convert nodes + links to image
                // For simplicity, we capture the $area div
                html2canvas($area[0], { useCORS: true, backgroundColor: '#ffffff' }).then(canvasCapture => {
                    canvasCapture.toBlob(blob => {
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
            });

            setTimeout(() => {
                updateCanvasSize();
                nodes.forEach(n => createNodeEl(n));
            }, 200);

            $widget.on('resize', updateCanvasSize);
        }
    },

    // --- 15. INTERACTIVE WHITEBOARD ---
    'Interactive Whiteboard': {
        render: function(wId) {
            return `
                <div style="display:flex; flex-direction:column; height:100%; background:white;">
                    <div style="padding:5px; background:#eee; border-bottom:1px solid #ccc; display:flex; gap:5px; align-items:center;">
                        <input type="color" id="${wId}-color" value="#0000ff" style="width:30px; height:30px; border:none; padding:0; background:transparent; cursor:pointer;">
                        <button id="${wId}-clear-wb" class="btn btn-sm" title="Clear Canvas"><i class="fas fa-eraser"></i></button>
                        <button id="${wId}-save-upload-wb" class="btn btn-primary btn-sm" style="margin-left:auto;"><i class="fas fa-file-upload"></i> Save & Upload</button>
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

            let paths = $widget.data('whiteboardPaths') || [];
            let currentPath = [];
            let painting = false;

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
                    ctx.strokeStyle = path.color || '#000';
                    ctx.lineWidth = path.width || 3;
                    ctx.moveTo(path.points[0].x, path.points[0].y);
                    for (let i = 1; i < path.points.length; i++) {
                        ctx.lineTo(path.points[i].x, path.points[i].y);
                    }
                    ctx.stroke();
                });
            }

            function startPosition(e) {
                painting = true;
                const rect = canvas.getBoundingClientRect();
                currentPath = { color: $color.val(), width: 3, points: [{ x: e.clientX - rect.left, y: e.clientY - rect.top }] };
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
                ctx.strokeStyle = currentPath.color;

                ctx.lineTo(x, y);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(x, y);
            }

            canvas.addEventListener('mousedown', startPosition);
            canvas.addEventListener('mouseup', finishedPosition);
            canvas.addEventListener('mousemove', draw);

            $(`#${wId}-clear-wb`).click(() => {
                paths = [];
                $widget.data('whiteboardPaths', paths);
                redraw();
                if (window.saveWorkspaceState) window.saveWorkspaceState();
            });

            $(`#${wId}-save-upload-wb`).click(() => {
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
                    <i class="fas fa-microphone" style="font-size:3rem; color:#ccc;" id="${wId}-mic-icon"></i>
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
                    <div id="${wId}-placeholder" style="text-align:center; color:#888; padding: 20px;">
                        <i class="fas fa-cloud-upload-alt" style="font-size:3rem; color:#ccc; margin-bottom:10px;"></i>
                        <p style="color:#888;">Drag & Drop files here</p>
                        <button onclick="$('#${wId}-file').click()" style="margin-top:10px; padding:5px 10px;">Or Click to Upload</button>
                    </div>
                    <img id="${wId}-img" style="display:none; max-width:100%; max-height:100%; object-fit:contain;">
                    <input type="file" id="${wId}-file" style="display:none;" accept="image/*">
                    <button id="${wId}-change-btn" style="position:absolute; bottom:5px; right:5px; background:rgba(0,0,0,0.5); color:white; border:none; padding:4px 8px; border-radius:3px; cursor:pointer; font-size:0.7rem; display:none;"><i class="fas fa-sync"></i></button>
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
                        <i class="fas fa-cloud-upload-alt" style="font-size:3rem; color:#ccc; margin-bottom:10px;"></i>
                        <p style="color:#888;">Drag & Drop files here</p>
                        <button onclick="$('#${wId}-file').click()" style="margin-top:10px; padding:5px 10px;">Or Click to Upload</button>
                    `).show();
                    $changeBtn.hide();
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

            $frame.on('click', function(e) {
                // If clicking anywhere in the frame while no image is visible, trigger upload
                // except if clicking the change button (though it's hidden)
                if (!$img.is(':visible')) {
                    $file.click();
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
                $placeholder.html('<i class="fas fa-spinner fa-spin" style="font-size:3rem; margin-bottom:10px;"></i><p>Uploading...</p>').show();
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
                            $placeholder.html('<i class="fas fa-exclamation-triangle" style="font-size:3rem; margin-bottom:10px; color:red;"></i><p>Error: '+res.message+'</p>');
                            window.showCustomModal('Error', res.message);
                        }
                    },
                    error: function() {
                        $placeholder.html('<i class="fas fa-exclamation-triangle" style="font-size:3rem; margin-bottom:10px; color:red;"></i><p>Upload Failed</p>');
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
    }
};
