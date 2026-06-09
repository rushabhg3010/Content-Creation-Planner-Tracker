const calendarDays = document.getElementById("calendar-days");
const monthYearDisplay = document.getElementById("month-year-display");
const prevMonthBtn = document.getElementById("prev-month");
const nextMonthBtn = document.getElementById("next-month");

const taskModal = document.getElementById("task-modal");
const closeModal = document.getElementById("close-modal");
const saveTasksBtn = document.getElementById("save-tasks-btn");
const modalDateTitle = document.getElementById("modal-date-title");

// Checkboxes
const taskReel = document.getElementById("task-reel");
const taskVideo = document.getElementById("task-video");
const taskPodcast = document.getElementById("task-podcast");

let currentDate = new Date();
let selectedDateKey = ""; // Used to track data format: YYYY-MM-DD

// Load tracking structure from localStorage or start empty
let contentData = JSON.parse(localStorage.getItem("creatorPlannerData")) || {};

const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
];

function renderCalendar() {
    calendarDays.innerHTML = "";
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    monthYearDisplay.innerText = `${months[month]} ${year}`;
    
    // First day of the current month index (0 = Sun, 1 = Mon...)
    const firstDayIndex = new Date(year, month, 1).getDay();
    // Total days in current month
    const totalDays = new Date(year, month + 1, 0).getDate();

    // Render Blank Cells for preceding month padding
    for (let i = 0; i < firstDayIndex; i++) {
        const emptyDiv = document.createElement("div");
        emptyDiv.classList.add("day", "empty");
        calendarDays.appendChild(emptyDiv);
    }

    // Render Actual Days
    for (let day = 1; day <= totalDays; day++) {
        const dayDiv = document.createElement("div");
        dayDiv.classList.add("day");
        
        const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        dayDiv.innerHTML = `
            <span class="day-number">${day}</span>
            <div class="day-symbols" id="symbols-${dateKey}"></div>
        `;

        // Append active saved symbols right away if they exist
        const symbolsContainer = dayDiv.querySelector(".day-symbols");
        if (contentData[dateKey]) {
            if (contentData[dateKey].reel) symbolsContainer.innerHTML += `<i class="fab fa-instagram reel-icon"></i>`;
            if (contentData[dateKey].video) symbolsContainer.innerHTML += `<i class="fab fa-youtube video-icon"></i>`;
            if (contentData[dateKey].podcast) symbolsContainer.innerHTML += `<i class="fas fa-microphone podcast-icon"></i>`;
        }

        // Add Click listener to open editor
        dayDiv.addEventListener("click", () => openPlanner(dateKey, day, months[month]));
        
        calendarDays.appendChild(dayDiv);
    }
}

// Open modal and load stored values for clicked date
function openPlanner(dateKey, day, monthName) {
    selectedDateKey = dateKey;
    modalDateTitle.innerText = `Content for ${monthName} ${day}`;
    
    if (contentData[dateKey]) {
        taskReel.checked = contentData[dateKey].reel || false;
        taskVideo.checked = contentData[dateKey].video || false;
        taskPodcast.checked = contentData[dateKey].podcast || false;
    } else {
        taskReel.checked = false;
        taskVideo.checked = false;
        taskPodcast.checked = false;
    }
    
    taskModal.style.display = "flex";
}

// Save selections to structural data Object & LocalStorage
saveTasksBtn.addEventListener("click", () => {
    if (!contentData[selectedDateKey]) {
        contentData[selectedDateKey] = {};
    }
    
    contentData[selectedDateKey].reel = taskReel.checked;
    contentData[selectedDateKey].video = taskVideo.checked;
    contentData[selectedDateKey].podcast = taskPodcast.checked;

    // Clean memory if all items unchecked
    if (!taskReel.checked && !taskVideo.checked && !taskPodcast.checked) {
        delete contentData[selectedDateKey];
    }

    localStorage.setItem("creatorPlannerData", JSON.stringify(contentData));
    taskModal.style.display = "none";
    renderCalendar(); // Refresh UI dynamically
});

// Navigation Handlers
prevMonthBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

nextMonthBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

// Close Modal Controls
closeModal.addEventListener("click", () => taskModal.style.display = "none");
window.addEventListener("click", (e) => {
    if (e.target === taskModal) taskModal.style.display = "none";
});

// Initial Fire
renderCalendar();