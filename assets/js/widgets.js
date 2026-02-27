const WidgetRegistry = {
    'Settings': {
        render: function(wId) {
            return `
                <div style="padding: 15px;">
                    <h3 style="margin-bottom: 15px; font-size: 1.1rem;">Grid Settings</h3>

                    <div style="margin-bottom: 15px;">
                        <label style="display:block; margin-bottom:5px; font-size:0.9rem;">
                            Grid Size: <span id="${wId}-size-val">80px</span>
                        </label>
                        <input type="range" id="${wId}-grid-size" min="20" max="150" value="80" style="width: 100%;">
                    </div>

                    <div style="margin-bottom: 15px;">
                        <label style="display:block; margin-bottom:5px; font-size:0.9rem;">
                            Grid Opacity: <span id="${wId}-opacity-val">1.0</span>
                        </label>
                        <input type="range" id="${wId}-grid-opacity" min="0.1" max="1" step="0.1" value="1" style="width: 100%;">
                    </div>

                    <div style="margin-bottom: 15px;">
                        <label style="display:block; margin-bottom:5px; font-size:0.9rem;">
                            Grid Color:
                        </label>
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

                // Hex to RGB
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

            // Attach event listener
            $widget.find('input').on('input', updateGrid);
        }
    }
};
