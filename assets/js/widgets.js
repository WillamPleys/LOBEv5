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
                    <textarea style="flex:1; width:100%; border:none; background:transparent; resize:none; outline:none; font-family:'Comic Sans MS', cursive, sans-serif; font-size:1.1rem; padding:10px;" placeholder="Don't forget..."></textarea>
                </div>
            `;
        },
        init: function(wId) {
            const $widget = $(`#${wId}`);
            $widget.find('.widget-content').css('background-color', '#ffeb3b');
            $widget.find('.color-btn').on('click', function() {
                let color = $(this).data('color');
                $widget.find('.widget-content').css('background-color', color);
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

            function addTask() {
                let text = $input.val();
                let time = $time.val();
                if(!text) return;

                let safeText = escapeHtml(text);
                let safeTime = escapeHtml(time);

                let li = $(`
                    <li style="border-bottom:1px solid #eee; padding:5px 0; display:flex; align-items:center; gap:10px;">
                        <input type="checkbox">
                        <span style="flex:1;">${safeText} <small style="color:#888;">${safeTime ? '@ '+safeTime : ''}</small></span>
                        <i class="fas fa-times" style="cursor:pointer; color:#ccc;"></i>
                    </li>
                `);

                li.find('.fas-times').click(function() { li.remove(); });
                li.find('input').change(function() {
                    if($(this).is(':checked')) li.find('span').css('text-decoration', 'line-through');
                    else li.find('span').css('text-decoration', 'none');
                });
                $list.append(li);
                $input.val(''); $time.val('');
            }
            $btn.click(addTask);
            $input.keypress(function(e) { if(e.which == 13) addTask(); });
        }
    },
    // --- 4. TIMER ---
    'Timer': {
        render: function(wId) {
            return `
                <div style="text-align:center; padding-top:20px;">
                    <input type="text" placeholder="Timer Title" style="text-align:center; border:none; border-bottom:1px solid #ccc; width:80%; margin-bottom:15px; outline:none;">
                    <div id="${wId}-display" style="font-size:3rem; font-family:monospace; font-weight:bold; margin-bottom:20px;">00:00:00</div>
                    <div>
                        <button id="${wId}-start" style="padding:10px 20px; background:#4CAF50; color:white; border:none; border-radius:4px; cursor:pointer;">Start</button>
                        <button id="${wId}-reset" style="padding:10px 20px; background:#f44336; color:white; border:none; border-radius:4px; cursor:pointer;">Reset</button>
                    </div>
                </div>
            `;
        },
        init: function(wId) {
            let seconds = 0; let interval = null;
            const $display = $(`#${wId}-display`); const $startBtn = $(`#${wId}-start`);
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
                <div style="height:100%; display:flex; flex-direction:column;">
                    <div class="card-area" style="flex:1; perspective:1000px; cursor:pointer; position:relative; margin-bottom:10px;">
                        <div class="card-inner" style="width:100%; height:100%; position:relative; text-align:center; transition:transform 0.6s; transform-style:preserve-3d; box-shadow:0 4px 8px rgba(0,0,0,0.1); border-radius:8px; background:white; border:1px solid #ddd;">
                            <div class="card-front" style="position:absolute; width:100%; height:100%; backface-visibility:hidden; display:flex; align-items:center; justify-content:center; padding:20px; font-weight:bold; font-size:1.2rem;">Question?</div>
                            <div class="card-back" style="position:absolute; width:100%; height:100%; backface-visibility:hidden; transform:rotateY(180deg); display:flex; align-items:center; justify-content:center; padding:20px; color:blue;">Answer!</div>
                        </div>
                    </div>
                    <div style="display:flex; justify-content:space-between;">
                        <button id="${wId}-prev" style="flex:1; margin-right:5px; padding:10px;">&lt; Prev</button>
                        <button id="${wId}-next" style="flex:1; margin-left:5px; padding:10px;">Next &gt;</button>
                    </div>
                </div>
            `;
        },
        init: function(wId) {
            const $widget = $(`#${wId}`); let isFlipped = false;
            const cards = [{q: "What is LOBE?", a: "Design Your Needs"}, {q: "Who is the teacher?", a: "Pak David"}, {q: "What is 2 + 2?", a: "4"}];
            let currentIdx = 0;
            function updateCard() {
                $widget.find('.card-front').text(cards[currentIdx].q);
                $widget.find('.card-back').text(cards[currentIdx].a);
                if(isFlipped) { $widget.find('.card-inner').css('transform', 'rotateY(0deg)'); isFlipped = false; }
            }
            updateCard();
            $widget.find('.card-area').click(function() { isFlipped = !isFlipped; $widget.find('.card-inner').css('transform', isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'); });
            $widget.find(`#${wId}-next`).click(function() { currentIdx = (currentIdx + 1) % cards.length; updateCard(); });
            $widget.find(`#${wId}-prev`).click(function() { currentIdx = (currentIdx - 1 + cards.length) % cards.length; updateCard(); });
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
                    <div id="${wId}-status" style="margin-top:10px; font-size:0.8rem; padding-left:15px;"></div>
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
                    if(f.type.includes('image')) icon = 'fa-file-image';
                    else if(f.type.includes('audio')) icon = 'fa-file-audio';
                    else if(f.original_name.endsWith('.docs')) icon = 'fa-file-word';
                    else if(f.original_name.endsWith('.html')) icon = 'fa-file-code';
                    else if(f.original_name.endsWith('.pdf') || f.type.includes('pdf')) icon = 'fa-file-pdf';
                    else if(f.type.includes('text') || f.original_name.endsWith('.txt')) icon = 'fa-file-alt';

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
                        let $content = $('#file-opener-content');
                        $content.empty();

                        if(f.type.includes('image')) {
                            $content.html(`<img src="${f.file_path}" style="max-width:100%; max-height:100%; object-fit:contain; margin:auto;">`);
                        } else if(f.type.includes('audio')) {
                            $content.html(`<audio controls style="margin:auto; width:80%;"><source src="${f.file_path}" type="${f.type}">Your browser does not support audio.</audio>`);
                        } else if(f.original_name.endsWith('.pdf') || f.type.includes('pdf')) {
                            $content.html(`<iframe src="${f.file_path}" style="width:100%; height:100%; border:none;"></iframe>`);
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
        render: function(wId) { return `<div id="${wId}-cal" style="padding:10px;">Calendar Placeholder</div>`; },
        init: function(wId) { $(`#${wId}-cal`).html('<b>Calendar Widget Active</b>'); }
    },
    // --- 10. ACTIVITY ---
    'Activity Tracker': {
        render: function(wId) { return `<canvas id="${wId}-chart"></canvas>`; },
        init: function(wId) {
             new Chart(document.getElementById(`${wId}-chart`), {
                type: 'line', data: { labels: ['M','T','W'], datasets: [{ label: 'Activity', data: [10, 20, 15] }] }
            });
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

    // --- 14. CONCEPT MAPPER (CANVAS) ---
    'Concept Mapper': {
        render: function(wId) {
            return `
                <div style="width:100%; height:100%; overflow:hidden; position:relative;">
                    <button onclick="document.getElementById('${wId}-canvas').getContext('2d').clearRect(0,0,1000,1000)" style="position:absolute; top:5px; right:5px; padding:2px 5px; font-size:10px; z-index:10;">Clear</button>
                    <canvas id="${wId}-canvas" style="border:1px solid #eee; background:white; cursor:crosshair; width:100%; height:100%;"></canvas>
                </div>
            `;
        },
        init: function(wId) {
            const canvas = document.getElementById(`${wId}-canvas`);

            // Wait for layout
            setTimeout(() => {
                const parent = canvas.parentElement;
                canvas.width = parent.clientWidth;
                canvas.height = parent.clientHeight;

                const ctx = canvas.getContext('2d');
                let painting = false;

                function startPosition(e) {
                    painting = true;
                    draw(e);
                }
                function finishedPosition() {
                    painting = false;
                    ctx.beginPath();
                }
                function draw(e) {
                    if (!painting) return;
                    const rect = canvas.getBoundingClientRect();
                    ctx.lineWidth = 2;
                    ctx.lineCap = 'round';
                    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
                }

                canvas.addEventListener('mousedown', startPosition);
                canvas.addEventListener('mouseup', finishedPosition);
                canvas.addEventListener('mousemove', draw);
            }, 100);
        }
    },

    // --- 15. INTERACTIVE WHITEBOARD (Similar to Mapper but larger default) ---
    'Interactive Whiteboard': {
        render: function(wId) {
            return `
                <div style="display:flex; flex-direction:column; height:100%; position:relative;">
                     <button onclick="document.getElementById('${wId}-wb').getContext('2d').clearRect(0,0,1000,1000)" style="position:absolute; top:5px; right:5px; padding:2px 5px; font-size:10px; z-index:10;">Clear</button>
                    <canvas id="${wId}-wb" style="flex:1; border:1px solid #ccc; background:#fff; cursor:pen; width:100%; height:100%;"></canvas>
                </div>
            `;
        },
        init: function(wId) {
             const canvas = document.getElementById(`${wId}-wb`);

             setTimeout(() => {
                const parent = canvas.parentElement;
                canvas.width = parent.clientWidth;
                canvas.height = parent.clientHeight;

                const ctx = canvas.getContext('2d');
                let painting = false;

                function startPosition(e) { painting = true; draw(e); }
                function finishedPosition() { painting = false; ctx.beginPath(); }
                function draw(e) {
                    if (!painting) return;
                    const rect = canvas.getBoundingClientRect();
                    ctx.lineWidth = 3;
                    ctx.lineCap = 'round';
                    ctx.strokeStyle = "blue";
                    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
                }

                canvas.addEventListener('mousedown', startPosition);
                canvas.addEventListener('mouseup', finishedPosition);
                canvas.addEventListener('mousemove', draw);
            }, 100);
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
            let isRecording = false;

            $rec.click(function() {
                if(!isRecording) {
                    // Start Fake Recording
                    isRecording = true;
                    $(this).text('Stop').css('background', '#333');
                    $icon.css('color', 'red');
                    $status.text('Recording...');
                } else {
                    // Stop
                    isRecording = false;
                    $(this).text('Record').css('background', '#f44336');
                    $icon.css('color', '#ccc');
                    $status.text('Saved to Output Field!');

                    // Simulate File Save
                    $(document).trigger('fileUploaded', [{
                        original_name: 'Voice Memo ' + new Date().toLocaleTimeString() + '.mp3',
                        type: 'audio/mp3',
                        file_path: '#' // Dummy path
                    }, wId]);
                }
            });
        }
    }
};
