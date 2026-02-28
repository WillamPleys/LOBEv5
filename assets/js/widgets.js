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
                        <input type="range" id="${wId}-grid-opacity" min="0.1" max="1" step="0.1" value="1" style="width: 100%;">
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
                    <div id="${wId}-status" style="margin-top:10px; font-size:0.8rem;"></div>
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
                            if(res.status === 'success') { $status.html(`<span style="color:green;">Uploaded: ${res.original_name}</span>`); $(document).trigger('fileUploaded', [res]); }
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
                    <div style="border-bottom:1px solid #ddd; padding:5px; display:flex; justify-content:space-between; align-items:center;">
                        <input type="text" id="${wId}-search" placeholder="Search..." style="padding:5px; width:60%;">
                        <select id="${wId}-sort" style="padding:5px;"><option value="newest">Newest</option><option value="name_asc">A-Z</option></select>
                    </div>
                    <div id="${wId}-content-area" style="flex:1; overflow-y:auto; padding:10px;"><p style="text-align:center; color:#888;">No output yet.</p></div>
                </div>
            `;
        },
        init: function(wId) {
            const $area = $(`#${wId}-content-area`); let files = [];
            $(document).on('fileUploaded', function(e, fileData) { files.push(fileData); renderFiles(); });
            $(document).on('aiOutput', function(e, data) { files.push({ original_name: 'AI Response.txt', type: 'text/plain', content: data }); renderFiles(); });
            function renderFiles() {
                $area.empty();
                if(files.length === 0) { $area.html('<p style="text-align:center; color:#888;">No output yet.</p>'); return; }
                files.forEach(f => {
                    let icon = 'fa-file'; if(f.type.includes('image')) icon = 'fa-file-image';
                    let safeName = $('<div/>').text(f.original_name).html();
                    let item = $(`<div style="padding:10px; border-bottom:1px solid #eee; display:flex; align-items:center; cursor:pointer;" class="file-item"><i class="fas ${icon}" style="margin-right:10px;"></i><span>${safeName}</span></div>`);
                    item.click(function() {
                        if(f.type.includes('image')) $area.html(`<img src="${f.file_path}" style="max-width:100%;"> <button onclick="$(this).parent().html(''); renderFiles();">Back</button>`);
                        else alert('Preview not available');
                    });
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
            return `<div id="${wId}-editor" style="height:100%; color:#000;"></div>`;
        },
        init: function(wId) {
            ClassicEditor
                .create(document.querySelector(`#${wId}-editor`))
                .catch(error => { console.error(error); });
        }
    },

    // --- 12. CODE EDITOR (ACE) ---
    'Code Editor': {
        render: function(wId) {
            return `<div id="${wId}-ace" style="width:100%; height:100%;"></div>`;
        },
        init: function(wId) {
            var editor = ace.edit(`${wId}-ace`);
            editor.setTheme("ace/theme/monokai");
            editor.session.setMode("ace/mode/php");
            editor.setValue("<?php\n\necho 'Hello World';\n");
        }
    },

    // --- 13. AI ASSISTANT (GEMINI) ---
    'AI Assistant': {
        render: function(wId) {
            return `
                <div style="display:flex; flex-direction:column; height:100%;">
                    <div style="flex:1; overflow-y:auto; padding:10px; background:#f4f4f4; margin-bottom:10px; border-radius:5px;" id="${wId}-chat-box">
                        <div style="color:#888; font-size:0.8rem; text-align:center;">Gemini 2.5 Flash Ready...</div>
                    </div>
                    <div style="display:flex; gap:5px;">
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

            function escapeHtml(text) {
                return text
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#039;");
            }

            function addMessage(text, sender) {
                let align = sender === 'user' ? 'text-align:right;' : 'text-align:left;';
                let bg = sender === 'user' ? 'background:#dcf8c6; margin-left:20%;' : 'background:white; margin-right:20%;';
                let safeText = escapeHtml(text);
                $chat.append(`<div style="${align} margin-bottom:5px;"><span style="display:inline-block; padding:8px; border-radius:8px; ${bg} box-shadow:0 1px 1px rgba(0,0,0,0.1);">${safeText}</span></div>`);
                $chat.scrollTop($chat[0].scrollHeight);
            }

            $send.click(function() {
                let txt = $msg.val();
                if(!txt) return;
                addMessage(txt, 'user');
                $msg.val('');

                // Simulate AI Response (Placeholder API)
                setTimeout(() => {
                    let response = "I am Gemini 2.5 Flash (Simulated). I received: " + txt;
                    addMessage(response, 'ai');
                    // Broadcast to Output Field
                    $(document).trigger('aiOutput', [response]);
                }, 1000);
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
                    }]);
                }
            });
        }
    }
};
