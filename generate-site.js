// generate-site.js
import fs from 'fs';
import talks from './talks.js';

// --- CSS Content ---
const CSS_CONTENT = `
    body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 20px;
        background-color: #f4f4f4;
        color: #333;
    }
    .container {
        max-width: 900px;
        margin: 0 auto;
        background-color: #fff;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 {
        color: #0056b3;
        text-align: center;
        margin-bottom: 30px;
    }
    .search-container {
        margin-bottom: 20px;
        text-align: center;
    }
    .search-container label {
        font-weight: bold;
        margin-right: 10px;
    }
    .search-container input[type="text"] {
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        width: 300px;
        max-width: 80%;
    }
    .schedule-item {
        background-color: #e9ecef;
        border: 1px solid #dee2e6;
        border-radius: 5px;
        padding: 15px;
        margin-bottom: 10px;
    }
    .schedule-item.talk {
        background-color: #f8f9fa;
    }
    .schedule-item.break {
        background-color: #ffeeba;
        border-color: #ffc107;
        font-weight: bold;
        text-align: center;
    }
    .schedule-time {
        font-weight: bold;
        color: #0056b3;
        margin-bottom: 5px;
    }
    .talk-title {
        font-size: 1.2em;
        color: #0056b3;
        margin-bottom: 5px;
    }
    .talk-speakers {
        font-style: italic;
        color: #666;
        margin-bottom: 5px;
    }
    .talk-category {
        font-size: 0.9em;
        color: #007bff;
        margin-bottom: 5px;
    }
    .talk-description {
        font-size: 0.9em;
        line-height: 1.5;
    }
    .category-tag {
        display: inline-block;
        background-color: #007bff;
        color: white;
        padding: 3px 8px;
        border-radius: 12px;
        margin-right: 5px;
        margin-bottom: 3px;
        font-size: 0.8em;
    }
`;

// --- JavaScript Content ---
const JS_CONTENT = `
    document.addEventListener('DOMContentLoaded', () => {
        const searchInput = document.getElementById('categorySearch');
        const scheduleItems = document.querySelectorAll('.schedule-item.talk');

        searchInput.addEventListener('keyup', (event) => {
            const searchTerm = event.target.value.toLowerCase();

            scheduleItems.forEach(item => {
                const categories = item.getAttribute('data-categories').toLowerCase();
                if (categories.includes(searchTerm)) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
`;

// Function to format time
function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Main generation logic
function generateSite() {
    let currentTime = new Date();
    currentTime.setHours(10, 0, 0, 0); // Event starts at 10:00 AM

    const schedule = [];
    let talkIndex = 0;
    const TALK_DURATION = 60; // minutes
    const TRANSITION_DURATION = 10; // minutes
    const LUNCH_DURATION = 60; // minutes

    for (let i = 0; i < talks.length; i++) {
        const talk = talks[i];
        const talkStartTime = new Date(currentTime);
        const talkEndTime = new Date(talkStartTime);
        talkEndTime.setMinutes(talkEndTime.getMinutes() + TALK_DURATION);

        schedule.push({
            type: 'talk',
            ...talk,
            startTime: formatTime(talkStartTime),
            endTime: formatTime(talkEndTime)
        });

        currentTime = new Date(talkEndTime);

        // Add transition or lunch break
        if (i === 2) { // After the 3rd talk, add lunch
            const lunchStartTime = new Date(currentTime);
            const lunchEndTime = new Date(lunchStartTime);
            lunchEndTime.setMinutes(lunchEndTime.getMinutes() + LUNCH_DURATION);
            schedule.push({
                type: 'break',
                title: 'Lunch Break',
                startTime: formatTime(lunchStartTime),
                endTime: formatTime(lunchEndTime)
            });
            currentTime = new Date(lunchEndTime);
        } else if (i < talks.length - 1) { // Add transition between talks
            const transitionStartTime = new Date(currentTime);
            const transitionEndTime = new Date(transitionStartTime);
            transitionEndTime.setMinutes(transitionEndTime.getMinutes() + TRANSITION_DURATION);
            schedule.push({
                type: 'break',
                title: 'Transition',
                startTime: formatTime(transitionStartTime),
                endTime: formatTime(transitionEndTime)
            });
            currentTime = new Date(transitionEndTime);
        }
    }

    // Generate HTML content
    let scheduleHtml = '';
    schedule.forEach(item => {
        if (item.type === 'talk') {
            scheduleHtml += `
                <div class="schedule-item talk" data-categories="${item.category.join(', ')}">
                    <div class="schedule-time">${item.startTime} - ${item.endTime}</div>
                    <div class="talk-title">${item.title}</div>
                    <div class="talk-speakers">Speakers: ${item.speakers.join(', ')}</div>
                    <div class="talk-category">
                        ${item.category.map(cat => `<span class="category-tag">${cat}</span>`).join('')}
                    </div>
                    <div class="talk-description">${item.description}</div>
                </div>
            `;
        } else {
            scheduleHtml += `
                <div class="schedule-item break">
                    <div class="schedule-time">${item.startTime} - ${item.endTime}</div>
                    <div>${item.title}</div>
                </div>
            `;
        }
    });

    const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Technical Talks Event Schedule</title>
            <style>${CSS_CONTENT}</style>
        </head>
        <body>
            <div class="container">
                <h1>Technical Talks Event Schedule</h1>

                <div class="search-container">
                    <label for="categorySearch">Search by Category:</label>
                    <input type="text" id="categorySearch" placeholder="e.g., AI, Web Development">
                </div>

                <div id="schedule">
                    ${scheduleHtml}
                </div>
            </div>
            <script>${JS_CONTENT}</script>
        </body>
        </html>
    `;

    fs.writeFileSync('index.html', htmlContent);
    console.log('index.html generated successfully!');
}

generateSite();
