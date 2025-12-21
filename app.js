// API Endpoint
const API_URL = 'https://script.google.com/macros/s/AKfycbx9GzgecT2qgwDLMA1hjIS9BNrqTBaA26UkM2cKNvehTHAF32c3d90TuzkSdvZ6Dy0lQQ/exec';
const CACHE_KEY = 'aomori_trip_data';

// Global variables
let allActivities = [];
let selectedDate = null;

// DOM Elements
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const activitiesEl = document.getElementById('activities');
const dateSelectorEl = document.getElementById('dateSelector');
const modalEl = document.getElementById('imageModal');
const modalImageEl = document.getElementById('modalImage');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

// Close modal on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});

async function initApp() {
    // 1. Try to load from cache first for instant load
    const cachedData = loadFromCache();
    if (cachedData) {
        // console.log('Loaded from cache');
        handleDataLoad(cachedData);
    } else {
        loadingEl.classList.remove('hidden');
    }

    // 2. Fetch fresh data
    try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        
        // Save to cache
        saveToCache(data);
        
        // Update UI
        handleDataLoad(data);
        
        loadingEl.classList.add('hidden');
        errorEl.classList.add('hidden');
        
    } catch (error) {
        console.error('Error fetching data:', error);
        loadingEl.classList.add('hidden');

        // Only show error if we didn't load from cache
        if (!allActivities.length) {
            errorEl.classList.remove('hidden');
        }
    }
}

function handleDataLoad(data) {
    if (!data || data.length === 0) {
        if (!allActivities.length) {
            activitiesEl.innerHTML = '<div class="no-data">ไม่มีข้อมูลกิจกรรม</div>';
        }
        return;
    }

    // Check if data actually changed (simple comparison) to avoid UI flicker
    // We only skip if we already have activities loaded (e.g. from cache)
    if (allActivities.length > 0 && JSON.stringify(data) === JSON.stringify(allActivities)) {
        return;
    }

    allActivities = data;
    generateDateButtons(data);

    // If a date was already selected, re-filter. Otherwise show all.
    if (selectedDate) {
        filterByDate(selectedDate.day, selectedDate.month);
    } else {
        displayActivities(data);
    }
}

// Generate date buttons dynamically from data
function generateDateButtons(data) {
    // Extract unique dates in order of appearance
    const uniqueDates = [];
    const seenDates = new Set();

    data.forEach(item => {
        const dateStr = item['วันที่'] || item.date;
        if (!dateStr) return;

        const parsed = parseDateString(dateStr);
        if (!parsed) return;

        // Create a unique key
        const key = `${parsed.day}-${parsed.month}`;

        if (!seenDates.has(key)) {
            seenDates.add(key);
            uniqueDates.push(parsed);
        }
    });

    // Clear existing buttons
    dateSelectorEl.innerHTML = '';

    uniqueDates.forEach(date => {
        const btn = document.createElement('button');
        btn.className = 'date-btn';
        btn.textContent = String(date.day).padStart(2, '0');

        // Check if active
        if (selectedDate && selectedDate.day === date.day && selectedDate.month === date.month) {
            btn.classList.add('active');
        }

        btn.addEventListener('click', () => {
            // Toggle logic: if clicking active button, clear filter
            if (selectedDate && selectedDate.day === date.day && selectedDate.month === date.month) {
                selectedDate = null;
                document.querySelectorAll('.date-btn').forEach(b => b.classList.remove('active'));
                displayActivities(allActivities);
            } else {
                filterByDate(date.day, date.month);

                // Update active state
                document.querySelectorAll('.date-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            }
        });

        dateSelectorEl.appendChild(btn);
    });
}

// Filter activities by date
function filterByDate(day, month) {
    selectedDate = { day, month };
    
    const filtered = allActivities.filter(activity => {
        const dateStr = activity['วันที่'] || activity.date || ''; 
        
        if (dateStr) {
            const activityDate = parseDateString(dateStr);
            if (activityDate && activityDate.day === day && activityDate.month === month) {
                return true;
            }
        }
        
        return false;
    });
    
    if (filtered.length > 0) {
        displayActivities(filtered);
    } else {
        activitiesEl.innerHTML = '<div class="no-data">ไม่มีกิจกรรมในวันนี้</div>';
    }
}

// Parse date string (handles "DD MMM" and ISO)
function parseDateString(dateStr) {
    if (!dateStr) return null;

    // Handle "26 DEC" format
    const parts = dateStr.trim().split(/\s+/);
    if (parts.length >= 2) {
        const day = parseInt(parts[0], 10);
        // Ensure we have a second part before accessing it
        if (!parts[1]) return null;

        const monthStr = parts[1].toUpperCase();

        const months = {
            'JAN': 1, 'FEB': 2, 'MAR': 3, 'APR': 4, 'MAY': 5, 'JUN': 6,
            'JUL': 7, 'AUG': 8, 'SEP': 9, 'OCT': 10, 'NOV': 11, 'DEC': 12
        };

        const month = months[monthStr];

        if (!isNaN(day) && month) {
            return { day, month };
        }
    }

    // Fallback to Date parsing
    try {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
            return {
                day: date.getDate(),
                month: date.getMonth() + 1
            };
        }
    } catch (e) {}

    return null;
}

// Display activities
function displayActivities(activities) {
    activitiesEl.innerHTML = '';
    
    activities.forEach((activity, index) => {
        const card = createActivityCard(activity, index);
        activitiesEl.appendChild(card);
    });
}

// Create activity card
function createActivityCard(activity, index) {
    const card = document.createElement('div');
    card.className = 'activity-card';
    
    // Extract data
    const date = activity['วันที่'] || activity.date || '';
    const activityName = activity['activity'] || '';
    const location = activity['location'] || '';
    const picture = activity['picture'] || '';
    const mapUrl = activity['map google'] || activity.map || '';
    const etc = activity['ETC'] || '';
    const detail = activity['detail'] || '';
    
    let cardHTML = '';
    
    // Image container with overlay
    if (picture) {
        cardHTML += `
            <div class="activity-image-container">
                <img src="${picture}" 
                     alt="${activityName}" 
                     class="activity-image"
                     onclick="openModal('${picture}')"
                     onerror="this.parentElement.style.display='none'">
                
                <div class="activity-overlay">
                    ${activityName ? `<h2 class="activity-title">${activityName}</h2>` : ''}
                    ${location ? `<div class="activity-location">📍 ${location}</div>` : ''}
                    ${detail ? `<p class="activity-detail">${detail}</p>` : ''}
                </div>
            </div>
        `;
    } else {
        // No image fallback
        cardHTML += `
            <div class="activity-image-container" style="background: linear-gradient(135deg, #c0c0c0 0%, #e0e0e0 100%); display: flex; align-items: center; justify-content: center;">
                <div style="text-align: center; color: #666;">
                    <div style="font-size: 4rem;">📷</div>
                    <p>ไม่มีรูปภาพ</p>
                </div>
            </div>
        `;
        
        if (activityName || location || detail) {
            cardHTML += `
                <div class="activity-overlay">
                    ${activityName ? `<h2 class="activity-title">${activityName}</h2>` : ''}
                    ${location ? `<div class="activity-location">📍 ${location}</div>` : ''}
                    ${detail ? `<p class="activity-detail">${detail}</p>` : ''}
                </div>
            `;
        }
    }
    
    // Bottom info section
    cardHTML += '<div class="activity-info">';
    
    if (date) {
        cardHTML += `<div class="activity-date">📅 ${formatDate(date)}</div>`;
    }
    
    if (etc) {
        cardHTML += `<div class="activity-etc">💰 ${etc}</div>`;
    }
    
    if (mapUrl) {
        cardHTML += `
            <div class="activity-map">
                <a href="${mapUrl}" target="_blank" class="map-link">
                    🗺️ ดูแผนที่
                </a>
            </div>
        `;
    }
    
    cardHTML += '</div>'; // Close activity-info
    
    card.innerHTML = cardHTML;
    return card;
}

// Format date to Thai
function formatDate(dateString) {
    if (!dateString) return '';  
    
    // Manual parse for "DD MMM" format to avoid year issues
    const parts = dateString.trim().split(/\s+/);
    if (parts.length >= 2) {
        const day = parts[0];
        const monthStr = parts[1].toUpperCase();

        const thaiMonths = {
            'JAN': 'มกราคม', 'FEB': 'กุมภาพันธ์', 'MAR': 'มีนาคม', 'APR': 'เมษายน',
            'MAY': 'พฤษภาคม', 'JUN': 'มิถุนายน', 'JUL': 'กรกฎาคม', 'AUG': 'สิงหาคม',
            'SEP': 'กันยายน', 'OCT': 'ตุลาคม', 'NOV': 'พฤศจิกายน', 'DEC': 'ธันวาคม'
        };

        if (thaiMonths[monthStr]) {
            return `${day} ${thaiMonths[monthStr]}`;
        }
    }

    try {
        const date = new Date(dateString);
        
        if (isNaN(date.getTime())) {
            return dateString;
        }
        
        // Use 'th-TH' but only day and month to avoid year confusion
        const options = { 
            month: 'long', 
            day: 'numeric' 
        };
        
        return date.toLocaleDateString('th-TH', options);
    } catch (error) {
        return dateString;
    }
}

// Cache helpers
function saveToCache(data) {
    try {
        const cacheObj = {
            timestamp: Date.now(),
            data: data
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheObj));
    } catch (e) {
        console.warn('Failed to save to cache', e);
    }
}

function loadFromCache() {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    try {
        const { data } = JSON.parse(cached);
        // We could check timestamp here if we wanted to expire cache
        return data;
    } catch (e) {
        return null;
    }
}

// Open image modal
function openModal(imageSrc) {
    modalImageEl.src = imageSrc;
    modalEl.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// Close image modal
function closeModal() {
    modalEl.classList.add('hidden');
    document.body.style.overflow = 'auto';
}
