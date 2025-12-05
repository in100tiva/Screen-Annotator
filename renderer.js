// ========== Atalhos Padrao ==========
const DEFAULT_SHORTCUTS = {
    // Ferramentas
    'tool-pen': { key: '1', ctrl: true, shift: false, alt: false, mouse: null },
    'tool-highlighter': { key: '2', ctrl: true, shift: false, alt: false, mouse: null },
    'tool-rectangle': { key: '3', ctrl: true, shift: false, alt: false, mouse: null },
    'tool-circle': { key: '4', ctrl: true, shift: false, alt: false, mouse: null },
    'tool-arrow': { key: '5', ctrl: true, shift: false, alt: false, mouse: null },
    'tool-line': { key: '6', ctrl: true, shift: false, alt: false, mouse: null },
    'tool-text': { key: 't', ctrl: false, shift: false, alt: false, mouse: null },
    'tool-eraser': { key: 'e', ctrl: true, shift: false, alt: false, mouse: null },

    // Cores
    'color-red': { key: null, ctrl: false, shift: false, alt: false, mouse: null },
    'color-green': { key: null, ctrl: false, shift: false, alt: false, mouse: null },
    'color-blue': { key: null, ctrl: false, shift: false, alt: false, mouse: null },
    'color-yellow': { key: null, ctrl: false, shift: false, alt: false, mouse: null },
    'color-magenta': { key: null, ctrl: false, shift: false, alt: false, mouse: null },
    'color-cyan': { key: null, ctrl: false, shift: false, alt: false, mouse: null },
    'color-white': { key: null, ctrl: false, shift: false, alt: false, mouse: null },
    'color-black': { key: null, ctrl: false, shift: false, alt: false, mouse: null },

    // Acoes
    'undo': { key: 'z', ctrl: true, shift: false, alt: false, mouse: null },
    'redo': { key: 'y', ctrl: true, shift: false, alt: false, mouse: null },
    'clear': { key: 'c', ctrl: true, shift: true, alt: false, mouse: null },
    'spotlight': { key: 's', ctrl: true, shift: true, alt: false, mouse: null },
    'toggle-drawing': { key: 'd', ctrl: true, shift: true, alt: false, mouse: null },
    'toggle-visibility': { key: 'a', ctrl: true, shift: true, alt: false, mouse: null }
};

// Mapeamento de cores
const COLOR_MAP = {
    'color-red': '#FF0000',
    'color-green': '#00FF00',
    'color-blue': '#0000FF',
    'color-yellow': '#FFFF00',
    'color-magenta': '#FF00FF',
    'color-cyan': '#00FFFF',
    'color-white': '#FFFFFF',
    'color-black': '#000000'
};

// Estado do aplicativo
const state = {
    currentTool: 'pen',
    currentColor: '#FF0000',
    strokeSize: 3,
    isDrawing: false,
    isDrawingMode: true,
    isSpotlightMode: false,
    history: [],
    redoStack: [],
    startX: 0,
    startY: 0,
    textPosition: { x: 0, y: 0 },
    shortcuts: {},
    tempShortcuts: {},
    isRecordingShortcut: false,
    recordingButton: null
};

// Carregar atalhos salvos ou usar padrao
function loadShortcuts() {
    try {
        const saved = localStorage.getItem('screenAnnotatorShortcuts');
        if (saved) {
            state.shortcuts = JSON.parse(saved);
            // Merge com defaults para novos atalhos
            for (const key in DEFAULT_SHORTCUTS) {
                if (!state.shortcuts[key]) {
                    state.shortcuts[key] = { ...DEFAULT_SHORTCUTS[key] };
                }
            }
        } else {
            state.shortcuts = JSON.parse(JSON.stringify(DEFAULT_SHORTCUTS));
        }
    } catch (e) {
        state.shortcuts = JSON.parse(JSON.stringify(DEFAULT_SHORTCUTS));
    }
    state.tempShortcuts = JSON.parse(JSON.stringify(state.shortcuts));
}

// Salvar atalhos
function saveShortcuts() {
    state.shortcuts = JSON.parse(JSON.stringify(state.tempShortcuts));
    localStorage.setItem('screenAnnotatorShortcuts', JSON.stringify(state.shortcuts));

    // Notificar o processo principal sobre a mudanca
    if (window.electronAPI && window.electronAPI.updateShortcuts) {
        window.electronAPI.updateShortcuts(state.shortcuts);
    }

    updateShortcutButtonsUI();
    closeSettingsModal();
    showNotification('Atalhos salvos com sucesso!');
}

// Restaurar atalhos padrao
function resetShortcuts() {
    state.tempShortcuts = JSON.parse(JSON.stringify(DEFAULT_SHORTCUTS));
    updateSettingsModalUI();
    showNotification('Atalhos restaurados ao padrao');
}

// Converter atalho para texto legivel
function shortcutToString(shortcut) {
    if (!shortcut || (!shortcut.key && !shortcut.mouse)) {
        return '-';
    }

    const parts = [];

    if (shortcut.ctrl) parts.push('Ctrl');
    if (shortcut.shift) parts.push('Shift');
    if (shortcut.alt) parts.push('Alt');

    if (shortcut.mouse) {
        const mouseNames = {
            0: 'Mouse Esq',
            1: 'Mouse Meio',
            2: 'Mouse Dir',
            3: 'Mouse 4',
            4: 'Mouse 5'
        };
        parts.push(mouseNames[shortcut.mouse] || `Mouse ${shortcut.mouse}`);
    } else if (shortcut.key) {
        // Nomes especiais para teclas
        const keyNames = {
            ' ': 'Espaco',
            'arrowup': 'Seta Cima',
            'arrowdown': 'Seta Baixo',
            'arrowleft': 'Seta Esq',
            'arrowright': 'Seta Dir',
            'escape': 'Esc',
            'enter': 'Enter',
            'tab': 'Tab',
            'backspace': 'Backspace',
            'delete': 'Delete',
            'insert': 'Insert',
            'home': 'Home',
            'end': 'End',
            'pageup': 'Page Up',
            'pagedown': 'Page Down'
        };

        const keyLower = shortcut.key.toLowerCase();
        const keyDisplay = keyNames[keyLower] || shortcut.key.toUpperCase();
        parts.push(keyDisplay);
    }

    return parts.join('+') || '-';
}

// Converter evento de tecla para objeto de atalho
function eventToShortcut(e, isMouse = false) {
    return {
        key: isMouse ? null : e.key.toLowerCase(),
        ctrl: e.ctrlKey,
        shift: e.shiftKey,
        alt: e.altKey,
        mouse: isMouse ? e.button : null
    };
}

// Verificar se um atalho corresponde a um evento
function matchesShortcut(shortcut, e, isMouse = false) {
    if (!shortcut || (!shortcut.key && !shortcut.mouse)) return false;

    if (isMouse) {
        return shortcut.mouse === e.button &&
               shortcut.ctrl === e.ctrlKey &&
               shortcut.shift === e.shiftKey &&
               shortcut.alt === e.altKey;
    }

    return shortcut.key === e.key.toLowerCase() &&
           shortcut.ctrl === e.ctrlKey &&
           shortcut.shift === e.shiftKey &&
           shortcut.alt === e.altKey;
}

// Executar acao baseada no atalho
function executeAction(action) {
    // Ferramentas
    if (action.startsWith('tool-')) {
        const tool = action.replace('tool-', '');
        selectTool(tool);
        return true;
    }

    // Cores
    if (action.startsWith('color-')) {
        const color = COLOR_MAP[action];
        if (color) {
            selectColor(color);
            return true;
        }
    }

    // Acoes
    switch (action) {
        case 'undo':
            undo();
            return true;
        case 'redo':
            redo();
            return true;
        case 'clear':
            clearCanvas();
            return true;
        case 'spotlight':
            toggleSpotlight();
            return true;
        case 'toggle-drawing':
            if (window.electronAPI) {
                window.electronAPI.toggleDrawingMode();
            }
            return true;
        case 'toggle-visibility':
            if (window.electronAPI) {
                window.electronAPI.minimizeToTray();
            }
            return true;
    }

    return false;
}

// Mostrar notificacao
function showNotification(message) {
    modeText.textContent = message;
    modeIndicator.classList.add('visible');
    setTimeout(() => {
        modeIndicator.classList.remove('visible');
    }, 2000);
}

// ========== Modal de Configuracoes ==========
const settingsModal = document.getElementById('settingsModal');
const settingsBtn = document.getElementById('settingsBtn');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const saveShortcutsBtn = document.getElementById('saveShortcutsBtn');
const resetShortcutsBtn = document.getElementById('resetShortcutsBtn');

function openSettingsModal() {
    state.tempShortcuts = JSON.parse(JSON.stringify(state.shortcuts));
    updateSettingsModalUI();
    settingsModal.classList.remove('hidden');
}

function closeSettingsModal() {
    settingsModal.classList.add('hidden');
    stopRecording();
}

function updateSettingsModalUI() {
    document.querySelectorAll('.shortcut-input').forEach(btn => {
        const action = btn.dataset.action;
        const shortcut = state.tempShortcuts[action];
        btn.textContent = shortcutToString(shortcut);
    });
}

function updateShortcutButtonsUI() {
    // Atualizar tooltips dos botoes na toolbar
    const toolTips = {
        'pen': 'tool-pen',
        'highlighter': 'tool-highlighter',
        'rectangle': 'tool-rectangle',
        'circle': 'tool-circle',
        'arrow': 'tool-arrow',
        'line': 'tool-line',
        'text': 'tool-text',
        'eraser': 'tool-eraser'
    };

    document.querySelectorAll('.tool-btn').forEach(btn => {
        const tool = btn.dataset.tool;
        const action = toolTips[tool];
        if (action && state.shortcuts[action]) {
            const shortcutStr = shortcutToString(state.shortcuts[action]);
            const toolName = btn.title.split('(')[0].trim();
            btn.title = `${toolName} (${shortcutStr})`;
        }
    });
}

// Iniciar gravacao de atalho
function startRecording(button) {
    stopRecording();
    state.isRecordingShortcut = true;
    state.recordingButton = button;
    button.classList.add('recording');
    button.textContent = 'Pressione...';
}

// Parar gravacao
function stopRecording() {
    if (state.recordingButton) {
        state.recordingButton.classList.remove('recording');
        const action = state.recordingButton.dataset.action;
        state.recordingButton.textContent = shortcutToString(state.tempShortcuts[action]);
    }
    state.isRecordingShortcut = false;
    state.recordingButton = null;
}

// Gravar atalho
function recordShortcut(shortcut) {
    if (!state.isRecordingShortcut || !state.recordingButton) return;

    const action = state.recordingButton.dataset.action;
    state.tempShortcuts[action] = shortcut;
    state.recordingButton.textContent = shortcutToString(shortcut);
    state.recordingButton.classList.remove('recording');
    state.isRecordingShortcut = false;
    state.recordingButton = null;
}

// Event listeners do modal
settingsBtn.addEventListener('click', openSettingsModal);
closeSettingsBtn.addEventListener('click', closeSettingsModal);
saveShortcutsBtn.addEventListener('click', saveShortcuts);
resetShortcutsBtn.addEventListener('click', resetShortcuts);

// Fechar modal ao clicar fora
settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        closeSettingsModal();
    }
});

// Botoes de atalho
document.querySelectorAll('.shortcut-input').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        startRecording(btn);
    });

    // Capturar teclas
    btn.addEventListener('keydown', (e) => {
        if (!state.isRecordingShortcut || state.recordingButton !== btn) return;

        e.preventDefault();
        e.stopPropagation();

        // Ignorar apenas modificadores sozinhos
        if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) {
            return;
        }

        // Escape cancela a gravacao
        if (e.key === 'Escape' && !e.ctrlKey && !e.shiftKey && !e.altKey) {
            stopRecording();
            return;
        }

        // Delete/Backspace remove o atalho
        if ((e.key === 'Delete' || e.key === 'Backspace') && !e.ctrlKey && !e.shiftKey && !e.altKey) {
            const action = btn.dataset.action;
            state.tempShortcuts[action] = { key: null, ctrl: false, shift: false, alt: false, mouse: null };
            btn.textContent = '-';
            btn.classList.remove('recording');
            state.isRecordingShortcut = false;
            state.recordingButton = null;
            return;
        }

        recordShortcut(eventToShortcut(e, false));
    });

    // Capturar cliques do mouse
    btn.addEventListener('mousedown', (e) => {
        if (!state.isRecordingShortcut || state.recordingButton !== btn) return;

        // Ignorar clique esquerdo sem modificadores (usado para selecionar)
        if (e.button === 0 && !e.ctrlKey && !e.shiftKey && !e.altKey) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();
        recordShortcut(eventToShortcut(e, true));
    });

    // Prevenir menu de contexto durante gravacao
    btn.addEventListener('contextmenu', (e) => {
        if (state.isRecordingShortcut && state.recordingButton === btn) {
            e.preventDefault();
        }
    });
});

// ========== Elementos do DOM ==========
const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const toolbar = document.getElementById('toolbar');
const toolbarDrag = document.getElementById('toolbarDrag');
const strokeSlider = document.getElementById('strokeSize');
const strokeSizeValue = document.getElementById('strokeSizeValue');
const customColor = document.getElementById('customColor');
const modeIndicator = document.getElementById('modeIndicator');
const modeText = document.getElementById('modeText');
const spotlightOverlay = document.getElementById('spotlightOverlay');
const spotlightHole = document.getElementById('spotlightHole');
const textInput = document.getElementById('textInput');

// ========== Funcoes de Canvas ==========
function setupCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    redrawCanvas();
}

function redrawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    state.history.forEach(item => {
        drawHistoryItem(item);
    });
}

function drawHistoryItem(item) {
    ctx.save();

    switch (item.type) {
        case 'path':
            ctx.strokeStyle = item.color;
            ctx.lineWidth = item.size;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.globalAlpha = item.alpha || 1;
            ctx.beginPath();
            if (item.points.length > 0) {
                ctx.moveTo(item.points[0].x, item.points[0].y);
                for (let i = 1; i < item.points.length; i++) {
                    ctx.lineTo(item.points[i].x, item.points[i].y);
                }
            }
            ctx.stroke();
            break;

        case 'rectangle':
            ctx.strokeStyle = item.color;
            ctx.lineWidth = item.size;
            ctx.globalAlpha = item.alpha || 1;
            ctx.strokeRect(item.x, item.y, item.width, item.height);
            break;

        case 'circle':
            ctx.strokeStyle = item.color;
            ctx.lineWidth = item.size;
            ctx.globalAlpha = item.alpha || 1;
            ctx.beginPath();
            ctx.ellipse(
                item.x + item.width / 2,
                item.y + item.height / 2,
                Math.abs(item.width / 2),
                Math.abs(item.height / 2),
                0, 0, Math.PI * 2
            );
            ctx.stroke();
            break;

        case 'line':
            ctx.strokeStyle = item.color;
            ctx.lineWidth = item.size;
            ctx.globalAlpha = item.alpha || 1;
            ctx.beginPath();
            ctx.moveTo(item.startX, item.startY);
            ctx.lineTo(item.endX, item.endY);
            ctx.stroke();
            break;

        case 'arrow':
            drawArrow(ctx, item.startX, item.startY, item.endX, item.endY, item.color, item.size, item.alpha || 1);
            break;

        case 'text':
            ctx.fillStyle = item.color;
            ctx.font = `${item.size * 5}px Arial`;
            ctx.globalAlpha = item.alpha || 1;
            ctx.fillText(item.text, item.x, item.y);
            break;

        case 'eraser':
            ctx.globalCompositeOperation = 'destination-out';
            ctx.strokeStyle = 'rgba(0,0,0,1)';
            ctx.lineWidth = item.size;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();
            if (item.points.length > 0) {
                ctx.moveTo(item.points[0].x, item.points[0].y);
                for (let i = 1; i < item.points.length; i++) {
                    ctx.lineTo(item.points[i].x, item.points[i].y);
                }
            }
            ctx.stroke();
            break;
    }

    ctx.restore();
}

function drawArrow(ctx, fromX, fromY, toX, toY, color, size, alpha = 1) {
    const headLength = size * 4;
    const angle = Math.atan2(toY - fromY, toX - fromX);

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = size;
    ctx.globalAlpha = alpha;

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(
        toX - headLength * Math.cos(angle - Math.PI / 6),
        toY - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
        toX - headLength * Math.cos(angle + Math.PI / 6),
        toY - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();
}

// ========== Funcoes de Desenho ==========
let currentDrawing = null;

function startDrawing(e) {
    if (!state.isDrawingMode || e.target !== canvas) return;
    if (settingsModal && !settingsModal.classList.contains('hidden')) return;

    state.isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    state.startX = e.clientX - rect.left;
    state.startY = e.clientY - rect.top;

    if (state.currentTool === 'text') {
        showTextInput(e.clientX, e.clientY);
        return;
    }

    if (state.currentTool === 'pen' || state.currentTool === 'highlighter' || state.currentTool === 'eraser') {
        currentDrawing = {
            type: state.currentTool === 'eraser' ? 'eraser' : 'path',
            color: state.currentColor,
            size: state.currentTool === 'eraser' ? state.strokeSize * 3 : state.strokeSize,
            alpha: state.currentTool === 'highlighter' ? 0.4 : 1,
            points: [{ x: state.startX, y: state.startY }]
        };
    }
}

function draw(e) {
    if (!state.isDrawing || !state.isDrawingMode) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    redrawCanvas();

    if (state.currentTool === 'pen' || state.currentTool === 'highlighter' || state.currentTool === 'eraser') {
        currentDrawing.points.push({ x, y });
        drawHistoryItem(currentDrawing);
    } else if (state.currentTool === 'rectangle') {
        currentDrawing = {
            type: 'rectangle',
            color: state.currentColor,
            size: state.strokeSize,
            x: Math.min(state.startX, x),
            y: Math.min(state.startY, y),
            width: Math.abs(x - state.startX),
            height: Math.abs(y - state.startY)
        };
        drawHistoryItem(currentDrawing);
    } else if (state.currentTool === 'circle') {
        currentDrawing = {
            type: 'circle',
            color: state.currentColor,
            size: state.strokeSize,
            x: Math.min(state.startX, x),
            y: Math.min(state.startY, y),
            width: Math.abs(x - state.startX),
            height: Math.abs(y - state.startY)
        };
        drawHistoryItem(currentDrawing);
    } else if (state.currentTool === 'line') {
        currentDrawing = {
            type: 'line',
            color: state.currentColor,
            size: state.strokeSize,
            startX: state.startX,
            startY: state.startY,
            endX: x,
            endY: y
        };
        drawHistoryItem(currentDrawing);
    } else if (state.currentTool === 'arrow') {
        currentDrawing = {
            type: 'arrow',
            color: state.currentColor,
            size: state.strokeSize,
            startX: state.startX,
            startY: state.startY,
            endX: x,
            endY: y
        };
        drawHistoryItem(currentDrawing);
    }
}

function stopDrawing() {
    if (!state.isDrawing) return;

    state.isDrawing = false;

    if (currentDrawing) {
        state.history.push(currentDrawing);
        state.redoStack = [];
        currentDrawing = null;
    }
}

function showTextInput(x, y) {
    state.textPosition = { x, y };
    textInput.style.left = `${x}px`;
    textInput.style.top = `${y}px`;
    textInput.classList.remove('hidden');
    textInput.focus();
    textInput.value = '';
}

function addText(text) {
    if (text.trim()) {
        const item = {
            type: 'text',
            color: state.currentColor,
            size: state.strokeSize,
            text: text,
            x: state.textPosition.x,
            y: state.textPosition.y
        };
        state.history.push(item);
        state.redoStack = [];
        redrawCanvas();
    }
    textInput.classList.add('hidden');
    state.isDrawing = false;
}

// ========== Funcoes de Acao ==========
function undo() {
    if (state.history.length > 0) {
        const item = state.history.pop();
        state.redoStack.push(item);
        redrawCanvas();
    }
}

function redo() {
    if (state.redoStack.length > 0) {
        const item = state.redoStack.pop();
        state.history.push(item);
        redrawCanvas();
    }
}

function clearCanvas() {
    if (state.history.length > 0) {
        state.redoStack = [...state.history];
        state.history = [];
        redrawCanvas();
    }
}

function toggleSpotlight() {
    state.isSpotlightMode = !state.isSpotlightMode;

    if (state.isSpotlightMode) {
        spotlightOverlay.classList.remove('hidden');
        document.getElementById('spotlightBtn').classList.add('active');
    } else {
        spotlightOverlay.classList.add('hidden');
        document.getElementById('spotlightBtn').classList.remove('active');
    }
}

function moveSpotlight(e) {
    if (!state.isSpotlightMode) return;

    const size = 200;
    spotlightHole.style.left = `${e.clientX - size / 2}px`;
    spotlightHole.style.top = `${e.clientY - size / 2}px`;
}

function setDrawingMode(isDrawing) {
    state.isDrawingMode = isDrawing;

    document.body.classList.toggle('drawing-disabled', !isDrawing);

    const toggleBtn = document.getElementById('toggleDrawingBtn');
    toggleBtn.classList.toggle('inactive', !isDrawing);

    modeText.textContent = isDrawing ? 'Modo: Desenho' : 'Modo: Visualizacao';
    modeIndicator.classList.add('visible');
    setTimeout(() => {
        modeIndicator.classList.remove('visible');
    }, 1500);
}

function selectTool(tool) {
    state.currentTool = tool;

    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tool === tool);
    });

    canvas.classList.toggle('eraser-cursor', tool === 'eraser');
}

function selectColor(color) {
    state.currentColor = color;

    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.color === color);
    });
}

// ========== Configurar arrastar toolbar ==========
function setupToolbarDrag() {
    let isDragging = false;
    let offsetX, offsetY;

    toolbarDrag.addEventListener('mousedown', (e) => {
        isDragging = true;
        const rect = toolbar.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        toolbar.style.transition = 'none';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const x = e.clientX - offsetX;
        const y = e.clientY - offsetY;

        toolbar.style.left = `${x}px`;
        toolbar.style.top = `${y}px`;
        toolbar.style.transform = 'none';
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        toolbar.style.transition = '';
    });
}

// ========== Event Listeners ==========
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', (e) => {
    draw(e);
    moveSpotlight(e);
});
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseleave', stopDrawing);

canvas.addEventListener('contextmenu', (e) => e.preventDefault());

// Ferramentas
document.querySelectorAll('.tool-btn').forEach(btn => {
    btn.addEventListener('click', () => selectTool(btn.dataset.tool));
});

// Cores
document.querySelectorAll('.color-btn').forEach(btn => {
    btn.addEventListener('click', () => selectColor(btn.dataset.color));
});

customColor.addEventListener('input', (e) => {
    selectColor(e.target.value);
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.classList.remove('active');
    });
});

// Slider de espessura
strokeSlider.addEventListener('input', (e) => {
    state.strokeSize = parseInt(e.target.value);
    strokeSizeValue.textContent = state.strokeSize;
});

// Botoes de acao
document.getElementById('undoBtn').addEventListener('click', undo);
document.getElementById('redoBtn').addEventListener('click', redo);
document.getElementById('clearBtn').addEventListener('click', clearCanvas);
document.getElementById('spotlightBtn').addEventListener('click', toggleSpotlight);
document.getElementById('toggleDrawingBtn').addEventListener('click', () => {
    window.electronAPI.toggleDrawingMode();
});
document.getElementById('minimizeBtn').addEventListener('click', () => {
    window.electronAPI.minimizeToTray();
});

// Input de texto
textInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        addText(textInput.value);
    } else if (e.key === 'Escape') {
        textInput.classList.add('hidden');
        state.isDrawing = false;
    }
});

textInput.addEventListener('blur', () => {
    if (textInput.value.trim()) {
        addText(textInput.value);
    } else {
        textInput.classList.add('hidden');
        state.isDrawing = false;
    }
});

// IPC listeners
window.electronAPI.onClearCanvas(() => clearCanvas());
window.electronAPI.onUndo(() => undo());
window.electronAPI.onRedo(() => redo());
window.electronAPI.onSetTool((tool) => selectTool(tool));
window.electronAPI.onToggleSpotlight(() => toggleSpotlight());
window.electronAPI.onDrawingModeChanged((isDrawing) => setDrawingMode(isDrawing));
window.electronAPI.onOpenSettings(() => openSettingsModal());

// Resize
window.addEventListener('resize', setupCanvas);

// ========== Atalhos de teclado personalizados ==========
document.addEventListener('keydown', (e) => {
    // Ignorar se estiver gravando atalho ou digitando texto
    if (state.isRecordingShortcut) return;
    if (e.target === textInput) return;
    if (!settingsModal.classList.contains('hidden')) {
        if (e.key === 'Escape') {
            closeSettingsModal();
        }
        return;
    }

    // Verificar atalhos personalizados
    for (const action in state.shortcuts) {
        if (matchesShortcut(state.shortcuts[action], e, false)) {
            e.preventDefault();
            executeAction(action);
            return;
        }
    }
});

// Atalhos de mouse personalizados
document.addEventListener('mousedown', (e) => {
    if (state.isRecordingShortcut) return;
    if (!settingsModal.classList.contains('hidden')) return;
    if (e.target.closest('.toolbar')) return;

    // Verificar atalhos de mouse personalizados
    for (const action in state.shortcuts) {
        const shortcut = state.shortcuts[action];
        if (shortcut.mouse !== null && matchesShortcut(shortcut, e, true)) {
            e.preventDefault();
            executeAction(action);
            return;
        }
    }
});

// ========== Inicializacao ==========
loadShortcuts();
setupCanvas();
setupToolbarDrag();
updateSettingsModalUI();
updateShortcutButtonsUI();
