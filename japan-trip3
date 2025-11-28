// API Endpoint
const API_URL = 'https://script.google.com/macros/s/AKfycbx9GzgecT2qgwDLMA1hjIS9BNrqTBaA26UkM2cKNvehTHAF32c3d90TuzkSdvZ6Dy0lQQ/exec';

// DOM Elements
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const activitiesEl = document.getElementById('activities');
const modalEl = document.getElementById('imageModal');
const modalImageEl = document.getElementById('modalImage');

// Fetch and display activities
async function fetchActivities() {
    try {
        loadingEl.classList.remove('hidden');
        errorEl. classList.add('hidden');
        
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        
        loadingEl.classList.add('hidden');
        
        if (! data || data.length === 0) {
            activitiesEl.innerHTML = '<div class="no-data">ไม่มีข้อมูลกิจกรรม</div>';
            return;
        }
        
        displayActivities(data);
        
    } catch (error) {
        console.error('Error fetching data:', error);
        loadingEl.classList.add('hidden');
        errorEl.classList. remove('hidden');
    }
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
    
    // Extract data from activity object
    const number = activity['/'] || activity. number || index + 1;
    const date = activity['วันที่'] || activity.date || '';
    const activityName = activity['activity'] || '';
    const location = activity['location'] || '';
    const picture = activity['picture'] || '';
    const mapUrl = activity['map google'] || activity. map || '';
    const etc = activity['ETC'] || '';
    const detail = activity['detail'] || '';
    
    // Build card HTML
    let cardHTML = '';
    
    // Image
    if (picture) {
        cardHTML += `
            <img src="${picture}" 
                 alt="${activityName}" 
                 class="activity-image"
                 onclick="openModal('${picture}')"
                 onerror="this.style.display='none'">
        `;
    }
    
    cardHTML += '<div class="activity-content">';
    
    // Header with number and date
    cardHTML += `
        <div class="activity-header">
            <div class="activity-number">${number}</div>
            <div class="activity-date">📅 ${formatDate(date)}</div>
        </div>
    `;
    
    // Activity name
    if (activityName) {
        cardHTML += `<h2 class="activity-title">${activityName}</h2>`;
    }
    
    // Location
    if (location) {
        cardHTML += `
            <div class="activity-location">
                📍 ${location}
            </div>
        `;
    }
    
    // Detail
    if (detail) {
        cardHTML += `<p class="activity-detail">${detail}</p>`;
    }
    
    // ETC
    if (etc) {
        cardHTML += `
            <div class="activity-etc">
                💰 ${etc}
            </div>
        `;
    }
    
    // Map
    if (mapUrl) {
        cardHTML += `
            <div class="activity-map">
                <a href="${mapUrl}" target="_blank" class="map-link">
                    🗺️ ดูแผนที่
                </a>
            </div>
        `;
    }
    
    cardHTML += '</div>'; // Close activity-content
    
    card.innerHTML = cardHTML;
    return card;
}

// Format date to Thai
function formatDate(dateString) {
    if (!dateString) return '';
    
    try {
        // Try to parse the date
        const date = new Date(dateString);
        
        if (isNaN(date.getTime())) {
            // If parsing fails, return original string
            return dateString;
        }
        
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        
        return date.toLocaleDateString('th-TH', options);
    } catch (error) {
        return dateString;
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
    document.body. style.overflow = 'auto';
}

// Close modal on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Initialize app
document.addEventListener('DOMContentLoaded', fetchActivities);
