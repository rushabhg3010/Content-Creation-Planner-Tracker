// 1. Import the necessary Firebase SDK functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 2. PASTE YOUR FIREBASE CONFIGURATION HERE
const firebaseConfig = {
  apiKey: "AIzaSyCu4vs5QdKO3ID1h6EuyVHf3_3mDUVK7rI",
  authDomain: "content-creator-calendar.firebaseapp.com",
  projectId: "content-creator-calendar",
  storageBucket: "content-creator-calendar.firebasestorage.app",
  messagingSenderId: "903975634186",
  appId: "1:903975634186:web:fbe4587f33193122f9e6f3",
  measurementId: "G-YP8PS75G8H"
};

// 3. Initialize Firebase and Firestore Database
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- Dom Elements (Same as before) ---
const calendarDays = document.getElementById("calendar-days");
const monthYearDisplay = document.getElementById("month-year-display");
const prevMonthBtn = document.getElementById("prev-month");
const nextMonthBtn = document.getElementById("next-month");
const taskModal = document.getElementById("task-modal");
const closeModal = document.getElementById("close-modal");
const saveTasksBtn = document.getElementById("save-tasks-btn");
const modalDateTitle = document.getElementById("modal-date-title");

const taskReel = document.getElementById("task-reel");
const taskVideo = document.getElementById("task-video");
const taskPodcast = document.getElementById("task-podcast");

const countReel = document.getElementById("count-reel");
const countVideo = document.getElementById("count-video");
const countPodcast = document.getElementById("count-podcast");
const countTotal = document.getElementById("count-total");

let currentDate = new Date();
let selectedDateKey = ""; 
let contentData = {}; // We will fetch this from Firebase instead of localStorage

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// 4. NEW: Fetch data from Firebase Cloud for the current Month & Year
async function fetchMonthData() {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const docId = `${year}-${month}`; // We store tasks grouped by Year-Month

    const docRef = doc(db, "planner", docId);
    try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            contentData = docSnap.data();
        } else {
            contentData = {}; // Clear if no tasks exist for this month
        }
    } catch (error) {
        console.error("Error loading calendar data from Cloud: ", error);
    }
    
    // Once data arrives from the cloud, build the visual grid
    renderCalendar();
}

// 5. Render Calendar (Updated to include calculated metrics)
function renderCalendar() {
    calendarDays.innerHTML = "";
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    monthYearDisplay.innerText = `${months[month]} ${year}`;
    
    // Initialize counters for the current month
    let totalReels = 0;
    let totalVideos = 0;
    let totalPodcasts = 0;
    let totalCount =0;
    
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDayIndex; i++) {
        const emptyDiv = document.createElement("div");
        emptyDiv.classList.add("day", "empty");
        calendarDays.appendChild(emptyDiv);
    }

    for (let day = 1; day <= totalDays; day++) {
        const dayDiv = document.createElement("div");
        dayDiv.classList.add("day");
        
        const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        dayDiv.innerHTML = `
            <span class="day-number">${day}</span>
            <div class="day-symbols" id="symbols-${dateKey}"></div>
        `;

        const symbolsContainer = dayDiv.querySelector(".day-symbols");
        if (contentData[dateKey]) {
            if (contentData[dateKey].reel) {
                symbolsContainer.innerHTML += `<i class="fab fa-instagram reel-icon"></i>`;
                totalReels++; // Increment counter
            }
            if (contentData[dateKey].video) {
                symbolsContainer.innerHTML += `<i class="fab fa-youtube video-icon"></i>`;
                totalVideos++; // Increment counter
            }
            if (contentData[dateKey].podcast) {
                symbolsContainer.innerHTML += `<i class="fas fa-microphone podcast-icon"></i>`;
                totalPodcasts++; // Increment counter
            }
        }

        dayDiv.addEventListener("click", () => openPlanner(dateKey, day, months[month]));
        calendarDays.appendChild(dayDiv);
    }

    // Update the counter elements in the DOM header
    countReel.innerText = totalReels;
    countVideo.innerText = totalVideos;
    countPodcast.innerText = totalPodcasts;
    totalCount = (totalReels)+(totalVideos)+(totalPodcasts)
    countTotal.innerText = totalCount;
}

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




// 6. NEW: Save selections straight into Firestore Database
saveTasksBtn.addEventListener("click", async () => {
    if (!contentData[selectedDateKey]) {
        contentData[selectedDateKey] = {};
    }
    
    contentData[selectedDateKey].reel = taskReel.checked;
    contentData[selectedDateKey].video = taskVideo.checked;
    contentData[selectedDateKey].podcast = taskPodcast.checked;

    // Clean up local object keys if day is completely wiped
    if (!taskReel.checked && !taskVideo.checked && !taskPodcast.checked) {
        delete contentData[selectedDateKey];
    }

    // Save the entire current month tracking map into Firestore cloud document
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const docId = `${year}-${month}`;

    try {
        await setDoc(doc(db, "planner", docId), contentData);
        taskModal.style.display = "none";
        renderCalendar();
    } catch (e) {
        console.error("Error saving your content updates to Cloud: ", e);
        alert("Failed to sync. Please check your internet connection.");
    }
});

// Navigation handlers fetch fresh documents when changing months
prevMonthBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    fetchMonthData();
});

nextMonthBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    fetchMonthData();
});

closeModal.addEventListener("click", () => taskModal.style.display = "none");
window.addEventListener("click", (e) => {
    if (e.target === taskModal) taskModal.style.display = "none";
});

// Initial boot logic changes from local array mapping to fetching live database records
fetchMonthData();

