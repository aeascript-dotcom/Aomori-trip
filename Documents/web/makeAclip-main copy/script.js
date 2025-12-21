// ========================================
// Application State
// ========================================

const appState = {
    slides: Array(15).fill(null).map((_, index) => ({
        id: index + 1,
        image: null,
        imagePreview: null,
        text: '',
        status: 'standby',
        textColor: '#FFFFFF',
        textAlign: 'center',
        textSize: 52,
        textPosition: 'center',
        textAnimation: 'none',
        textEffect: 'none',
        outlineColor: '#000000',
        outlineWidth: 2,
        font: 'Prompt',
        cropData: null,
        filter: 'none',
        imageAspectRatio: 1
    })),
    settings: {
        transition: 'slideIn',
        font: 'Prompt',
        dissolveDuration: 0.8,
        slideDuration: 4,
        resolution: '2K',
        aspectRatio: '16:9',
        exportDestination: 'download'
    }
};

const filterPresets = {
    'none': { name: 'None', filter: 'none' },
    'warm': { name: 'Warm', filter: 'sepia(20%) saturate(1.2) hue-rotate(-10deg)' },
    'cool': { name: 'Cool', filter: 'saturate(1.1) hue-rotate(10deg) brightness(1.05)' },
    'vintage': { name: 'Vintage', filter: 'sepia(30%) saturate(0.8) contrast(0.9)' },
    'noir': { name: 'B&W', filter: 'grayscale(1) contrast(1.2)' },
    'vivid': { name: 'Vivid', filter: 'saturate(1.5) contrast(1.1) brightness(1.05)' },
    'fade': { name: 'Fade', filter: 'brightness(1.1) contrast(0.8) saturate(0.9)' },
    'cinematic': { name: 'Cinematic', filter: 'saturate(0.9) hue-rotate(-5deg) brightness(0.95)' }
};

// ========================================
// DOM Elements
// ========================================
const slidesList = document.getElementById('slidesList');
const exportButton = document.getElementById('exportButton');
const exportDefault = document.getElementById('exportDefault');
const exportLoading = document.getElementById('exportLoading');
const exportSuccess = document.getElementById('exportSuccess');
const createAnotherButton = document.getElementById('createAnotherButton');
const resolutionSelect = document.getElementById('resolutionSelect');

// ========================================
// Initialize Application
// ========================================
function init() {
    console.log('🚀 Initializing makeAclip...');
    const list = document.getElementById('slidesList');
    
    if (!list) {
        console.error('❌ slidesList element not found!');
        return;
    }
    
    renderSlides();
    attachEventListeners();
    attachSidebarNavigation();
    
    console.log('✨ makeAclip initialized successfully');
}

// ========================================
// Text Preview
// ========================================
function updateSlideTextPreview(slideIndex) {
    const slide = appState.slides[slideIndex];
    const canvas = document.querySelector(`.slide-text-preview-canvas[data-index="${slideIndex}"]`);
    
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    
    // Background
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#FF6B35';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, w, h);
    
    if (!slide.text) {
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('ยังไม่มีข้อความ', w / 2, h / 2);
        return;
    }
    
    const previewFontSize = Math.max(10, Math.floor((slide.textSize || 52) * 0.3));
    const slideFont = slide.font || appState.settings.font || 'Prompt';
    const fontFamily = `'${slideFont}', Arial, sans-serif`;
    
    ctx.font = `bold ${previewFontSize}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = slide.textColor || '#FFFFFF';
    
    let textX = w / 2;
    let textY = h / 2;
    
    switch (slide.textPosition) {
        case 'top': textY = h * 0.25; break;
        case 'bottom': textY = h * 0.75; break;
        case 'left': textX = w * 0.25; break;
        case 'right': textX = w * 0.75; break;
    }
    
    const maxWidth = w * 0.75;
    const words = slide.text.split(' ');
    let line = '';
    const lineHeight = previewFontSize * 1.3;
    let lines = [];
    
    words.forEach(word => {
        const testLine = line + word + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && line !== '') {
            lines.push(line.trim());
            line = word + ' ';
        } else {
            line = testLine;
        }
    });
    if (line.trim()) lines.push(line.trim());
    
    const totalHeight = (lines.length - 1) * lineHeight;
    let currentY = textY - totalHeight / 2;
    
    lines.forEach(lineText => {
        ctx.fillText(lineText, textX, currentY);
        currentY += lineHeight;
    });
    
    // Position marker
    ctx.fillStyle = (slide.textColor || '#FFFFFF') + '40';
    ctx.beginPath();
    ctx.arc(textX, textY, 15, 0, Math.PI * 2);
    ctx.fill();
}

// ========================================
// Render Slides
// ========================================
let visibleSlidesCount = 1;

function renderSlides() {
    const list = document.getElementById('slidesList');
    if (!list) return;
    
    list.innerHTML = '';
    
    appState.slides.forEach((slide, index) => {
        const slideElement = createSlideElement(slide, index);
        if (index + 1 > visibleSlidesCount) {
            slideElement.style.display = 'none';
        }
        list.appendChild(slideElement);
    });
    
    if (visibleSlidesCount < appState.slides.length) {
        const addMoreButton = document.createElement('button');
        addMoreButton.className = 'add-more-slides-btn';
        addMoreButton.innerHTML = '<span style="font-size: 24px;">➕</span> เพิ่มภาพ Upload';
        addMoreButton.addEventListener('click', expandNextSlide);
        list.appendChild(addMoreButton);
    }
}

function expandNextSlide() {
    if (visibleSlidesCount < appState.slides.length) {
        visibleSlidesCount++;
        renderSlides();
        setTimeout(() => {
            const newSlide = document.querySelectorAll('.slide-block')[visibleSlidesCount - 1];
            if (newSlide) newSlide.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
}

function createSlideElement(slide, index) {
    const slideDiv = document.createElement('div');
    slideDiv.className = 'slide-block';
    slideDiv.dataset.index = index;
    
    slideDiv.innerHTML = `
        <div class="image-slot">
            <div class="slide-number">#${slide.id}</div>
            <div class="image-preview ${slide.imagePreview ? 'has-image' : ''}" data-index="${index}" style="aspect-ratio: ${slide.imageAspectRatio || '1'};">
                ${slide.imagePreview 
                    ? `<div class="image-preview-container">
                        <img src="${slide.imagePreview}" alt="Slide ${slide.id}" class="preview-image" style="filter: ${filterPresets[slide.filter].filter};">
                        <div class="crop-overlay" data-index="${index}"></div>
                        <div class="crop-frame draggable-crop-frame" data-index="${index}"></div>
                    </div>` 
                    : '<span class="image-placeholder">📷</span>'}
            </div>
            <input type="file" id="fileInput-${index}" accept="image/*" style="display: none;" data-index="${index}">
            <button class="upload-button" data-index="${index}">
                ${slide.imagePreview ? 'เปลี่ยนรูป' : 'อัปโหลดรูป'}
            </button>
        </div>
        
        <div class="text-content">
            <textarea class="slide-textarea" placeholder="ใส่ข้อความ..." data-index="${index}" maxlength="200">${slide.text}</textarea>
            
            <div class="slide-text-preview-wrapper">
                <label class="preview-label">Preview</label>
                <canvas class="slide-text-preview-canvas" data-index="${index}" width="300" height="168"></canvas>
            </div>
            
            <div class="text-alignment-controls">
                <button class="text-align-btn ${slide.textAlign === 'left' ? 'active' : ''}" data-index="${index}" data-align="left">Left</button>
                <button class="text-align-btn ${slide.textAlign === 'center' ? 'active' : ''}" data-index="${index}" data-align="center">Center</button>
                <button class="text-align-btn ${slide.textAlign === 'right' ? 'active' : ''}" data-index="${index}" data-align="right">Right</button>
            </div>

            <div class="filter-presets">
                ${Object.entries(filterPresets).map(([key, preset]) => `
                    <button class="filter-preset-btn ${slide.filter === key ? 'active' : ''}" data-index="${index}" data-filter="${key}">${preset.name}</button>
                `).join('')}
            </div>
            
            <div class="slide-text-settings">
                <button class="settings-toggle" data-index="${index}">⚙️ Text Settings</button>
                <div class="settings-panel" data-index="${index}" style="display: none;">
                    <div class="setting-item">
                        <label>Font</label>
                        <select class="slide-font-select" data-index="${index}">
                            <option value="Prompt" ${slide.font === 'Prompt' ? 'selected' : ''}>Prompt</option>
                            <option value="Sarabun" ${slide.font === 'Sarabun' ? 'selected' : ''}>Sarabun</option>
                            <option value="Kodchasan" ${slide.font === 'Kodchasan' ? 'selected' : ''}>Kodchasan</option>
                            <option value="ChakraPetch" ${slide.font === 'ChakraPetch' ? 'selected' : ''}>Chakra Petch</option>
                        </select>
                    </div>
                    <div class="setting-item">
                        <label>Size</label>
                        <select class="slide-text-size-select" data-index="${index}">
                            <option value="40" ${slide.textSize === 40 ? 'selected' : ''}>Small</option>
                            <option value="52" ${slide.textSize === 52 ? 'selected' : ''}>Medium</option>
                            <option value="80" ${slide.textSize === 80 ? 'selected' : ''}>Large</option>
                        </select>
                    </div>
                    <div class="setting-item">
                        <label>Position</label>
                        <select class="slide-text-position-select" data-index="${index}">
                            <option value="top" ${slide.textPosition === 'top' ? 'selected' : ''}>Top</option>
                            <option value="center" ${slide.textPosition === 'center' ? 'selected' : ''}>Center</option>
                            <option value="bottom" ${slide.textPosition === 'bottom' ? 'selected' : ''}>Bottom</option>
                        </select>
                    </div>
                    <div class="setting-item">
                        <label>Color</label>
                        <input type="color" class="slide-text-color-input" data-index="${index}" value="${slide.textColor || '#FFFFFF'}">
                    </div>
                    <button class="apply-to-all-btn" data-index="${index}">📋 Apply to All Slides</button>
                </div>
            </div>
        </div>
    `;
    return slideDiv;
}

// ========================================
// Event Listeners & Logic
// ========================================

// Crop Frame Dragging (The ONLY version)
function initializeCropFrameDragging(slideIndex) {
    const cropFrame = document.querySelector(`.draggable-crop-frame[data-index="${slideIndex}"]`);
    if (!cropFrame) return;
    
    if (cropFrame._dragStartHandler) {
        cropFrame.removeEventListener('dragstart', cropFrame._dragStartHandler);
    }
    
    const handleCropDragStart = (e) => {
        const preview = cropFrame.closest('.image-preview');
        const img = preview.querySelector('.preview-image');
        if (!img) return;
        
        const rect = preview.getBoundingClientRect();
        const startX = e.clientX - rect.left;
        const startY = e.clientY - rect.top;
        
        // Ensure cropData exists
        if (!appState.slides[slideIndex].cropData) {
            const exportRatio = getAspectRatioValue(appState.settings.aspectRatio);
            appState.slides[slideIndex].cropData = calculateDefaultCropPosition(appState.slides[slideIndex].imageAspectRatio || 1, exportRatio);
        }
        const cropData = appState.slides[slideIndex].cropData;
        
        cropFrame.classList.add('dragging');
        
        const handleDragOver = (moveEvent) => {
            moveEvent.preventDefault();
            const moveX = moveEvent.clientX - rect.left;
            const moveY = moveEvent.clientY - rect.top;
            const deltaX = moveX - startX;
            const deltaY = moveY - startY;
            
            const newX = Math.max(0, Math.min(1 - cropData.width, cropData.x + deltaX / rect.width));
            const newY = Math.max(0, Math.min(1 - cropData.height, cropData.y + deltaY / rect.height));
            
            cropFrame.style.left = (newX * 100) + '%';
            cropFrame.style.top = (newY * 100) + '%';
            
            appState.slides[slideIndex].cropData.x = newX;
            appState.slides[slideIndex].cropData.y = newY;
        };
        
        const handleDragEnd = () => {
            cropFrame.classList.remove('dragging');
            document.removeEventListener('dragover', handleDragOver);
            document.removeEventListener('dragend', handleDragEnd);
        };
        
        document.addEventListener('dragover', handleDragOver);
        document.addEventListener('dragend', handleDragEnd);
    };
    
    cropFrame._dragStartHandler = handleCropDragStart;
    cropFrame.addEventListener('dragstart', handleCropDragStart);
}

// Mouse Resize Logic
document.addEventListener('mousedown', (e) => {
    const cropFrame = e.target.closest('.draggable-crop-frame');
    if (!cropFrame) return;
    
    const rect = cropFrame.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // Corners detection (approx 12px)
    const corners = {
        'tl': { x: [0, 12], y: [0, 12] },
        'br': { x: [rect.width - 12, rect.width], y: [rect.height - 12, rect.height] }
    };
    
    let resizeCorner = null;
    for (const [corner, area] of Object.entries(corners)) {
        if (clickX >= area.x[0] && clickX <= area.x[1] && clickY >= area.y[0] && clickY <= area.y[1]) {
            resizeCorner = corner;
            break;
        }
    }
    
    // If not a corner, let the drag handler (if implemented) or default behavior take over
    // But since we want to allow dragging the frame body, we do nothing here if not corner
    if (!resizeCorner) return; 

    e.stopPropagation(); // Stop drag start if resizing
    
    const slideIndex = parseInt(cropFrame.dataset.index);
    const preview = cropFrame.closest('.image-preview');
    const previewRect = preview.getBoundingClientRect();
    const cropData = appState.slides[slideIndex].cropData;
    
    const handleResizeMove = (moveEvent) => {
        moveEvent.preventDefault();
        const moveX = moveEvent.clientX - previewRect.left;
        const moveY = moveEvent.clientY - previewRect.top;
        const normX = Math.max(0, Math.min(1, moveX / previewRect.width));
        const normY = Math.max(0, Math.min(1, moveY / previewRect.height));
        
        let newX = cropData.x, newY = cropData.y, newW = cropData.width, newH = cropData.height;
        
        if (resizeCorner === 'tl') {
            newX = Math.min(normX, cropData.x + cropData.width - 0.1);
            newY = Math.min(normY, cropData.y + cropData.height - 0.1);
            newW = (cropData.x + cropData.width) - newX;
            newH = (cropData.y + cropData.height) - newY;
        } else if (resizeCorner === 'br') {
            newW = Math.max(0.1, normX - cropData.x);
            newH = Math.max(0.1, normY - cropData.y);
        }
        
        appState.slides[slideIndex].cropData = { x: newX, y: newY, width: newW, height: newH };
        cropFrame.style.left = (newX * 100) + '%';
        cropFrame.style.top = (newY * 100) + '%';
        cropFrame.style.width = (newW * 100) + '%';
        cropFrame.style.height = (newH * 100) + '%';
    };
    
    const handleResizeEnd = () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
    };
    
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
});


function attachEventListeners() {
    slidesList.addEventListener('click', (e) => {
        // Upload
        if (e.target.classList.contains('upload-button')) {
            document.getElementById(`fileInput-${e.target.dataset.index}`).click();
        }
        // Align
        if (e.target.classList.contains('text-align-btn')) {
            setTextAlignment(parseInt(e.target.dataset.index), e.target.dataset.align);
        }
        // Filters
        if (e.target.classList.contains('filter-preset-btn')) {
            applyFilter(parseInt(e.target.dataset.index), e.target.dataset.filter);
        }
        // Settings Toggle
        if (e.target.classList.contains('settings-toggle')) {
            const panel = e.target.nextElementSibling;
            panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
        }
        // Apply All
        if (e.target.classList.contains('apply-to-all-btn')) {
            applySettingsToAll(parseInt(e.target.dataset.index));
        }
    });
    
    slidesList.addEventListener('change', (e) => {
        // File Input
        if (e.target.type === 'file') {
            handleImageUpload(e.target.files[0], parseInt(e.target.dataset.index));
        }
        // Font/Size/Position Selects
        if (e.target.matches('select')) {
             const index = parseInt(e.target.dataset.index);
             const classList = e.target.classList;
             if(classList.contains('slide-font-select')) appState.slides[index].font = e.target.value;
             if(classList.contains('slide-text-size-select')) appState.slides[index].textSize = parseInt(e.target.value);
             if(classList.contains('slide-text-position-select')) appState.slides[index].textPosition = e.target.value;
             updateSlideTextPreview(index);
        }
    });

    // Realtime Text Update
    slidesList.addEventListener('input', (e) => {
        if (e.target.classList.contains('slide-textarea')) {
            const idx = parseInt(e.target.dataset.index);
            appState.slides[idx].text = e.target.value;
            updateSlideTextPreview(idx);
        }
        if (e.target.classList.contains('slide-text-color-input')) {
            const idx = parseInt(e.target.dataset.index);
            appState.slides[idx].textColor = e.target.value;
            updateSlideTextPreview(idx);
        }
    });

    // Global Settings
    document.querySelectorAll('.segment-button').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.segment-button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            appState.settings.transition = btn.dataset.value;
        });
    });

    const arSelect = document.getElementById('aspectRatioSelect');
    if (arSelect) {
        arSelect.addEventListener('change', (e) => appState.settings.aspectRatio = e.target.value);
    }
    
    document.getElementById('aspectRatioApplyBtn').addEventListener('click', updateAllCropFrames);
    document.getElementById('slideDurationSelect').addEventListener('change', (e) => appState.settings.slideDuration = parseFloat(e.target.value));
    resolutionSelect.addEventListener('change', (e) => appState.settings.resolution = e.target.value);
    
    // Export
    exportButton.addEventListener('click', handleExport);
    document.getElementById('createAnotherButton').addEventListener('click', () => location.reload());
    document.getElementById('editAnotherButton').addEventListener('click', () => {
        exportSuccess.classList.remove('active');
        exportDefault.classList.add('active');
    });
}

function handleImageUpload(file, index) {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            appState.slides[index].imageAspectRatio = img.width / img.height;
            appState.slides[index].imagePreview = e.target.result;
            appState.slides[index].status = 'ready';
            renderSlides();
            
            // Init crop
            setTimeout(() => {
                const exportRatio = getAspectRatioValue(appState.settings.aspectRatio);
                const cropData = calculateDefaultCropPosition(appState.slides[index].imageAspectRatio, exportRatio);
                appState.slides[index].cropData = cropData;
                
                const cropFrame = document.querySelector(`.draggable-crop-frame[data-index="${index}"]`);
                if(cropFrame) {
                    cropFrame.style.left = (cropData.x * 100) + '%';
                    cropFrame.style.top = (cropData.y * 100) + '%';
                    cropFrame.style.width = (cropData.width * 100) + '%';
                    cropFrame.style.height = (cropData.height * 100) + '%';
                    initializeCropFrameDragging(index);
                }
            }, 100);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function updateAllCropFrames() {
    const exportRatio = getAspectRatioValue(appState.settings.aspectRatio);
    appState.slides.forEach((slide, index) => {
        if (!slide.imagePreview) return;
        const cropData = calculateDefaultCropPosition(slide.imageAspectRatio || 1, exportRatio);
        appState.slides[index].cropData = cropData;
        
        const cropFrame = document.querySelector(`.draggable-crop-frame[data-index="${index}"]`);
        if (cropFrame) {
            cropFrame.style.left = (cropData.x * 100) + '%';
            cropFrame.style.top = (cropData.y * 100) + '%';
            cropFrame.style.width = (cropData.width * 100) + '%';
            cropFrame.style.height = (cropData.height * 100) + '%';
        }
    });
}

// Helpers
function getAspectRatioValue(str) { const [w, h] = str.split(':').map(Number); return w/h; }
function calculateDefaultCropPosition(imgRatio, vidRatio) {
    if (imgRatio > vidRatio) {
        const w = vidRatio / imgRatio;
        return { x: (1-w)/2, y: 0, width: w, height: 1 };
    } else {
        const h = vidRatio / imgRatio;
        return { x: 0, y: (1-h)/2, width: 1, height: h };
    }
}
function setTextAlignment(idx, align) {
    appState.slides[idx].textAlign = align;
    document.querySelector(`[data-index="${idx}"] [data-align="${align}"]`).classList.add('active');
    // Deselect others logic handled in redraw or simple manual toggle
    const buttons = document.querySelectorAll(`[data-index="${idx}"].text-align-btn`);
    buttons.forEach(b => b.classList.toggle('active', b.dataset.align === align));
}
function applyFilter(idx, filter) {
    appState.slides[idx].filter = filter;
    const img = document.querySelector(`[data-index="${idx}"] .preview-image`);
    if(img) img.style.filter = filterPresets[filter].filter;
    const buttons = document.querySelectorAll(`[data-index="${idx}"].filter-preset-btn`);
    buttons.forEach(b => b.classList.toggle('active', b.dataset.filter === filter));
}
function applySettingsToAll(srcIdx) {
    const src = appState.slides[srcIdx];
    appState.slides.forEach((s, i) => {
        s.textSize = src.textSize;
        s.textPosition = src.textPosition;
        s.textColor = src.textColor;
        s.font = src.font;
        updateSlideTextPreview(i);
    });
    // Visual update of select boxes would go here (simplified for brevity)
    alert('Applied settings to all slides!');
}

// Navigation
function attachSidebarNavigation() {
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.addEventListener('click', () => {
            const section = document.getElementById(item.dataset.menu + '-section');
            if(section) section.scrollIntoView({behavior:'smooth'});
            document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

// ========================================
// Export Video (Core Logic)
// ========================================
function handleExport() {
    const readySlides = appState.slides.filter(s => s.imagePreview);
    if (readySlides.length === 0) return alert('⚠️ Please add at least 1 image.');
    
    exportDefault.classList.remove('active');
    exportLoading.classList.add('active');
    document.querySelector('.progress-fill').classList.add('animating');

    setTimeout(() => downloadVideo(readySlides), 500);
}

function downloadVideo(slides) {
    // 1. Setup Canvas
    const { width, height } = getResolution(appState.settings.resolution);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // 2. Load Images
    const loadPromises = slides.map(s => new Promise(resolve => {
        const img = new Image();
        img.onload = () => { s._imgObj = img; resolve(); };
        img.src = s.imagePreview;
    }));

    Promise.all(loadPromises).then(() => {
        const stream = canvas.captureStream(60);
        let recorder;
        try {
             recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
        } catch (e) {
             recorder = new MediaRecorder(stream); // Fallback
        }
        
        const chunks = [];
        recorder.ondataavailable = e => chunks.push(e.data);
        recorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `makeAclip_${Date.now()}.webm`;
            a.click();
            
            document.querySelector('.progress-fill').classList.remove('animating');
            exportLoading.classList.remove('active');
            exportSuccess.classList.add('active');
            document.getElementById('exportFilename').textContent = a.download;
        };
        
        recorder.start();
        renderFramesToCanvas(ctx, canvas, recorder, slides);
    });
}

function renderFramesToCanvas(ctx, cvs, recorder, slides) {
    const fps = 60;
    const slideFrames = appState.settings.slideDuration * fps;
    const transFrames = appState.settings.dissolveDuration * fps;
    let frame = 0;
    const totalFrames = slides.length * slideFrames;
    
    const loop = () => {
        if (frame >= totalFrames) {
            recorder.stop();
            return;
        }
        
        const slideIdx = Math.floor(frame / slideFrames);
        const slide = slides[slideIdx];
        const nextSlide = slides[slideIdx + 1];
        const localFrame = frame % slideFrames;
        
        // Draw Current Slide
        drawSlide(ctx, cvs, slide);
        
        // Transition (Dissolve)
        if (appState.settings.transition === 'dissolve' && nextSlide && localFrame > (slideFrames - transFrames)) {
            const opacity = (localFrame - (slideFrames - transFrames)) / transFrames;
            ctx.save();
            ctx.globalAlpha = opacity;
            drawSlide(ctx, cvs, nextSlide);
            ctx.restore();
        }
        
        // Render Text
        drawText(ctx, cvs, slide);

        frame++;
        requestAnimationFrame(loop);
    };
    loop();
}

function drawSlide(ctx, cvs, slide) {
    if (!slide._imgObj) return;
    
    // Fill white
    ctx.fillStyle = '#FFF';
    ctx.fillRect(0,0, cvs.width, cvs.height);
    
    // Apply Crop
    const crop = slide.cropData || {x:0, y:0, width:1, height:1};
    const sw = slide._imgObj.width * crop.width;
    const sh = slide._imgObj.height * crop.height;
    const sx = slide._imgObj.width * crop.x;
    const sy = slide._imgObj.height * crop.y;
    
    // Draw filter (simple emulation for canvas)
    ctx.filter = filterPresets[slide.filter].filter !== 'none' ? filterPresets[slide.filter].filter : 'none';
    ctx.drawImage(slide._imgObj, sx, sy, sw, sh, 0, 0, cvs.width, cvs.height);
    ctx.filter = 'none';
}

function drawText(ctx, cvs, slide) {
    if (!slide.text) return;
    
    let fontSize = slide.textSize * (cvs.width / 1920) * 2; // Scale based on resolution
    ctx.font = `bold ${fontSize}px ${slide.font}`;
    ctx.fillStyle = slide.textColor;
    ctx.textAlign = 'center';
    
    let x = cvs.width/2;
    let y = cvs.height/2;
    if (slide.textPosition === 'top') y = cvs.height * 0.2;
    if (slide.textPosition === 'bottom') y = cvs.height * 0.8;
    
    ctx.fillText(slide.text, x, y);
}

function getResolution(res) {
    if (res === '4K') return {width: 3840, height: 2160};
    if (res === '1080p') return {width: 1920, height: 1080};
    return {width: 2560, height: 1440}; // 2K default
}

// Start
document.addEventListener('DOMContentLoaded', init);