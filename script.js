 // --- 1. VARIABLES & STATE ---
let isSignUpMode = false;

const motivationQuotes = [
    "Focus on your goals ! 🚀",
    "Don't stop until you're proud. ✨",
    "Distraction is the enemy of success. 🔥",
    "Your future self is watching you right now.",
    "Small steps lead to big results. Keep going!"
];

let quests = JSON.parse(localStorage.getItem('myQuests')) || [
    { text: "1 Hour No Phone", completed: false },
    { text: "Read 5 Pages", completed: false },
    { text: "20 min meditation", completed: false }
];
let countdown;
let enteredPin = "";

// --- 2. AUTHENTICATION (Login/Sign-up) ---
function toggleAuth() {
    isSignUpMode = !isSignUpMode;
    document.getElementById('authTitle').innerText = isSignUpMode ? "Sign Up" : "Login";
    document.getElementById('authBtn').innerText = isSignUpMode ? "CREATE ACCOUNT" : "LOGIN";
    document.getElementById('toggleMsg').innerText = isSignUpMode ? "Already have an account?" : "Don't have an account?";
    document.getElementById('toggleLink').innerText = isSignUpMode ? "Login" : "Sign Up";
}

function handleAuth() {
    const name = document.getElementById('userName').value.trim();
    const pin = document.getElementById('userPass').value.trim();

    if (!name || !pin) {
        alert("Please fill all details!");
        return;
    }

    if (isSignUpMode) {
        localStorage.setItem('savedUser', name);
        localStorage.setItem('savedPin', pin);
        alert("Account Created! Now Login with your details.");
        toggleAuth();
    } else {
        const storedUser = localStorage.getItem('savedUser');
        const storedPin = localStorage.getItem('savedPin');

        if (name === storedUser && pin === storedPin) {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('currentUser', name);
            startApp();
        } else {
            alert("Invalid Credentials! Did you Sign Up first?");
        }
    } 
}

function handleLogout() {
    localStorage.removeItem('isLoggedIn');
    window.location.reload(); 
}

// --- 3. APP CORE LOGIC ---
function startApp() {
    document.getElementById('loginPage').classList.remove('active');
    document.getElementById('mainApp').classList.add('active');

    const user = localStorage.getItem('currentUser') || "User";
    document.getElementById('spanName').innerText = user;
    document.getElementById('initials').innerText = user.charAt(0).toUpperCase();

    if (Notification.permission !== "granted") {
        Notification.requestPermission().then(permission => {
            console.log("Notification permission:", permission);
        });
    }

    loadQuests();
}

function showPage(pageId, element) {
    // 1. Vault check
    if (pageId === 'vaultPage' && document.getElementById('vaultContent').style.display !== 'block') {
        document.getElementById('aiModal').style.display = 'flex';
        return;
    }

    // 2. Hide all pages and RESET opacity
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
        p.style.display = 'none'; // Display block/none zaroori hai
        p.style.opacity = '0';
    });

    // 3. Show target page
    const activePage = document.getElementById(pageId);
    if (activePage) {
        activePage.style.display = 'block';
        activePage.classList.add('active');
        setTimeout(() => {
            activePage.style.opacity = '1';
        }, 10);
    }

    // 4. Refresh stats agar stats page hai
    if(pageId === 'statsPage' || pageId === 'homePage') {
        loadQuests();
        if(typeof updateStrictStats === 'function') updateStrictStats();
    }

    // 5. Update Navigation Icons (Safe way)
    if(element) {
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        element.classList.add('active');
    }
}

// --- 4. QUESTS & PROGRESS LOGIC ---

function loadQuests() {
    const list = document.getElementById('questList');
    const taskCountEl = document.getElementById('taskCount');
    if(!list) return;

    list.innerHTML = ''; 
    let done = 0;

    quests.forEach((q, i) => {
        const item = document.createElement('div');
        item.className = "glass-card animate-fade";
        item.style.cssText = "margin-bottom:10px; display:flex; align-items:center; padding:12px; justify-content: space-between; flex-wrap: wrap;";
        
        item.innerHTML = `
            <div style="display:flex; align-items:center; flex:1; min-width: 200px;">
                <input type="checkbox" ${q.completed ? 'checked' : ''} 
                    onchange="toggleQuest(${i})" 
                    style="accent-color: #A855F7; width: 20px; height: 20px; cursor:pointer;">
                 <span style="margin-left:12px; color: ${q.completed ? '#888' : '#fff'}; 
                        text-decoration: ${q.completed ? 'line-through' : 'none'}; 
                        font-size: 14px;">${q.text}</span>
            </div>
            
            <div style="display:flex; align-items:center; gap: 10px;">
                ${!q.completed ? `<button onclick="activateDashboardTimer('${q.text}', 15)"  
                    style="background: rgba(168,85,247,0.15); border:1px solid #A855F7; color:#fff; padding:4px 8px; border-radius:6px; font-size:11px; cursor:pointer;">⏱️ Track</button>` : ''}
                
                <button onclick="deleteQuest(${i})" 
                    style="background:none; border:none; color:#ff4444; cursor:pointer; font-size:18px;">🗑️</button>
            </div>
        `;
        list.appendChild(item);
        if(q.completed) done++;
    });

    if(taskCountEl) taskCountEl.innerText = done;
    if(document.getElementById('totalQuests')) document.getElementById('totalQuests').innerText = quests.length;
    
    updateGraph(done, quests.length);
} 

function toggleQuest(i) {
    quests[i].completed = !quests[i].completed;
    localStorage.setItem('myQuests', JSON.stringify(quests));
    loadQuests(); 
}

function deleteQuest(i) {
    if (confirm("Delete this task?")) {
        quests.splice(i, 1);
        localStorage.setItem('myQuests', JSON.stringify(quests));
        loadQuests(); 
    }
}

function updateGraph(done, total) {
    const visualTreeImg = document.getElementById('visualTreeImg');
    const treeStatus = document.getElementById('treeStatus');
    const statPercent = document.getElementById('statPercent'); 
    const circle = document.querySelector('.progress-circle');

    let percentage = total > 0 ? Math.round((done / total) * 100) : 0;

    if (circle) circle.style.background = `conic-gradient(var(--primary) ${percentage}%, #333 ${percentage}%)`;
    if (statPercent) statPercent.innerText = `${percentage}%`; 

    if (visualTreeImg) {
        if (percentage === 0) {
            visualTreeImg.src = "images/stage1.jpg";
            visualTreeImg.style.height = "60px";
            treeStatus.innerText = "Planted your focus seed ! finish a task to sprout.";
        } else if (percentage > 0 && percentage <= 20) {
            visualTreeImg.src = "images/stage2.jpg";
            visualTreeImg.style.height = "80px";
            treeStatus.innerText = "It's suprouting! your focus is breaking ground.";
        } else if (percentage > 20 && percentage <= 30) {
            visualTreeImg.src = "images/stage3.jpg";
            visualTreeImg.style.height = "100px";
            treeStatus.innerText = " Roots are getting stronger! stay steady.";
        } else if (percentage > 30 && percentage <= 55) {
            visualTreeImg.src = "images/stage4.jpg";
            visualTreeImg.style.height = "120px";
            treeStatus.innerText = "Halfway there! your focus tree is branching out.";
        } else if (percentage > 55 && percentage <= 75) {
            visualTreeImg.src = "images/stage5.jpg";
            visualTreeImg.style.height = "140px";
            treeStatus.innerText = "Look at those branches! you're dominating today.";
        } else if (percentage > 75 && percentage < 100) {
            visualTreeImg.src = "images/stage6.jpg";
            visualTreeImg.style.height = "160px";
            treeStatus.innerText = "Almost a full tree! just a final push needed.";
        } else if (percentage === 100) {
            visualTreeImg.src = "images/stage7.jpg";
            visualTreeImg.style.height = "180px";
            treeStatus.innerText = "ZEN MASTER! Your tree is bearing fruit.";
            visualTreeImg.style.filter = "drop-shadow(0 0 20px #164408)";
        }
    }  
}

   // 1.  trigger the custum model on button click
document.getElementById('addQuestBtn').onclick = function() {
    showTaskInput();
};   

// 2.  function to display the input modal
function showTaskInput() {
    document.getElementById('customTaskInput').style.display = 'flex';
    document.getElementById('newTaskName').focus(); // Direct typing shuru karne ke liye
}

// 3.  function to hide the input modal
function hideTaskInput() {
    document.getElementById('customTaskInput').style.display = 'none';
    document.getElementById('newTaskName').value = ''; // Input clear kar do
}

// 4.  logic to save the new task 
function saveTask() {
    let t = document.getElementById('newTaskName').value;
    
    if (t && t.trim() !== "") {
        //  pushing the new task to the quests array
        quests.push({ text: t, completed: false });
        localStorage.setItem('myQuests', JSON.stringify(quests));
        
        loadQuests();    //  Refresh the task list
        hideTaskInput(); //  close the midal
    } else {
        alert("Khali task nahi chalega!");
    }
}

// --- 5. AI GATEKEEPER 
function openGatekeeper() {
    // 1.  show modal
    document.getElementById('aiModal').style.display = 'flex'; 

    // 2.  update quote with a slight delay
        setTimeout(() => {
        const quoteDisplay = document.getElementById('aiMotiveQuote');
        const randomQuote = motivationQuotes[Math.floor(Math.random() * motivationQuotes.length)];
        
        if (quoteDisplay) {
            quoteDisplay.innerText = `"${randomQuote}"`;
        }
    }, 100); 
}
    
function closeGatekeeper() {
    document.getElementById('aiModal').style.display = 'none';
    document.getElementById('aiResponse').style.display = 'none';
    document.getElementById('aiReason').value = '';
}

function pleadCase() {
    const reason = document.getElementById('aiReason').value.toLowerCase();
    const responseBox = document.getElementById('aiResponse');
    const quoteDisplay = document.getElementById('aiMotiveQuote'); // Quote wala element
    
    // 1.  Change the quote on every click
    if (quoteDisplay) {
        const randomQuote = motivationQuotes[Math.floor(Math.random() * motivationQuotes.length)];
        quoteDisplay.innerText = `"${randomQuote}"`;
    }

    // 2.  Original logic to validate the reason
    if (!reason) { 
        alert("Pehle reason toh likho!"); 
        return; 
    }

    responseBox.style.display = 'block';

    if (reason.includes("study") || reason.includes("work") || reason.includes("project")) {
        responseBox.innerHTML = `<b>AI BOT:</b> Access Granted! ✨`;
        responseBox.style.color = "#00ff88"; 

        setTimeout(() => {
            closeGatekeeper(); 
            showPage('vaultPage');
        }, 2000);
    } 
    else {
        responseBox.innerHTML = `<b>AI BOT:</b> Denied! '${reason}' is a distraction. 🔥`;
        responseBox.style.color = "#FF8C00";
    }
}

function pressPin(num) {
    if (enteredPin.length < 4) {
        enteredPin += num;
        document.getElementById('pinDots').innerText = "*".repeat(enteredPin.length);
    }
}

function clearPin() {
    enteredPin = "";
    document.getElementById('pinDots').innerText = "**";
}

function checkVaultPin() {
    if (enteredPin === localStorage.getItem('savedPin')) {
        document.getElementById('vaultAuth').style.display = 'none';
        document.getElementById('vaultContent').style.display = 'block';
        document.getElementById('journalNotes').value = localStorage.getItem('myJournal') || "";
    } else {
        alert("Wrong PIN!");
        clearPin();
    }
}

function saveNotes() {
    localStorage.setItem('myJournal', document.getElementById('journalNotes').value);
    document.getElementById('saveStatus').style.display = 'block';
    setTimeout(() => { document.getElementById('saveStatus').style.display = 'none'; }, 2000);
}

// --- 6. UTILITIES (Timer & Monitoring) ---

function startAccessTimer(minutes) {
    clearInterval(countdown);
    let seconds = minutes * 60;
    const timerBar = document.getElementById('globalTimerBar');
    timerBar.style.display = 'block';

    countdown = setInterval(() => {
        let mins = Math.floor(seconds / 60);
        let secs = seconds % 60;
        document.getElementById('timerClock').innerText = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

        if (seconds <= 0) {
            clearInterval(countdown);
            alert("Time's Up!");
            handleLogout();
        }
        seconds--;
    }, 1000);
}

// --- IMPROVED AI MONITORING FOR MOBILE APK ---
window.addEventListener("blur", () => {
    sendAIAlert();
});

document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        sendAIAlert();
    }
});

function sendAIAlert() {
    if (localStorage.getItem('isLoggedIn') === 'true') {
        const warningTitle = "🚨 AI SECURITY ALERT!";
        const warningOptions = {
            body: " Get back to focus! Activity detected outside the app. 🔥",
            icon: "images/stage1.jpg"
        };

        // Native Alert (Fastest)
        if (Notification.permission === "granted") {
            new Notification(warningTitle, warningOptions);
        }

        // OneSignal Fallback (Reliable)
        if (window.OneSignalDeferred) {
            OneSignalDeferred.push(function(OneSignal) {
                OneSignal.Notifications.displayNotification(warningTitle, warningOptions);
            });
        }
    }
}

function openStatsModal() {
    const total = quests.length;
    const done = quests.filter(q => q.completed).length;
    document.getElementById('modalTotal').innerText = `Total Quests: ${total}`;
    document.getElementById('modalDone').innerText = `Completed: ${done}`;
    document.getElementById('modalPending').innerText = `Pending: ${total - done}`;
    document.getElementById('statsModal').style.display = 'flex';
}

function closeStatsModal() { document.getElementById('statsModal').style.display = 'none'; }

window.onload = () => { if(localStorage.getItem('isLoggedIn') === 'true') startApp(); };

 let timer; 
function startFocus(taskName, index) {  
    let seconds = minutes * 60;
    
    document.getElementById('taskNameDisplay').innerText = taskName;
    document.getElementById('focusModal').style.display = 'flex';

    clearInterval(timer); 

    timer = setInterval(() => {
        let m = Math.floor(seconds / 60);
        let s = seconds % 60;
        document.getElementById('countdownText').innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
        
         if (seconds <= 0) {
            clearInterval(timer);
              
            // ---FIX START---
            // 1. Mark the task a completed in the logic
            if (quests[index]) {
                quests[index].completed = true;
                localStorage.setItem('myQuests', JSON.stringify(quests));
            }

            // 2. Refresh the dashboard to update the checkbox  
            loadQuests(); 

            const done = quests.filter(q => q.completed).length;
            updateGraph(done, quests.length); 

            alert("Detox Complete! , check karo tree grow hua? 🌱");
            document.getElementById('focusModal').style.display = 'none'; //--- FIX END ---
        }    
        seconds--;
    }, 1000);
}
let dashboardCountdown; 

function activateDashboardTimer(taskName, defaultMinutes) {
     clearInterval(dashboardCountdown);
    
    document.getElementById('activeTaskDisplay').innerText = taskName;
    document.getElementById('mainTimerDisplay').innerText = `${defaultMinutes}:00`;
       
    console.log("Tracking started for: " + taskName);
}

function startFocusMode() {
    const timeDisplay = document.getElementById('mainTimerDisplay');
    const taskDisplay = document.getElementById('activeTaskDisplay');
    
    let timeText = timeDisplay.innerText;
    let mins = parseInt(timeText.split(':')[0]);
    let seconds = mins * 60;

    clearInterval(dashboardCountdown); 

    dashboardCountdown = setInterval(() => {
        let m = Math.floor(seconds / 60);
        let s = seconds % 60;
        timeDisplay.innerText = `${m}:${s < 10 ? '0' : ''}${s}`;

        if (seconds <= 0) {
            clearInterval(dashboardCountdown);
            let taskName = taskDisplay.innerText.trim() || "Focus Session";
            saveToHistory(taskName,mins);
            
            // 1. Quests & Stats Update
            quests.forEach((q) => { if(q.text === taskName) q.completed = true; });
            localStorage.setItem('myQuests', JSON.stringify(quests));
            loadQuests(); 
            updateStrictStats(mins);

            // 2. Play Sound
            playSuccessTone();

            // 3.  Notification LOGIC
            const notifyTitle = "Focus Complete! 🎉";
            const notifyOptions = {
                body: "Amazing work ! You finished: " + taskName,
                icon: "images/my-logo.png"
            };

            if (window.OneSignalDeferred) {
                OneSignalDeferred.push(async function(OneSignal) {
                    try {
                        // Sahi syntax: Title aur Options object
                        await OneSignal.Notifications.displayNotification(notifyTitle, notifyOptions);
                    } catch (err) {
                        // Agar OneSignal fail ho toh Browser notification dikhao
                        new Notification(notifyTitle, notifyOptions);
                    }
                });
            } else {
                new Notification(notifyTitle, notifyOptions);
            }

            alert("Session Complete! Great job ! 🏆");
        }
        seconds--;
    }, 1000);
}

//  Function to reset the dashboard timer (e.g , 15 , 20 , 50 min quick buttons)
function setTimer(minutes, taskName = "Manual Session") {
    // Purana timer stop karo
    clearInterval(dashboardCountdown);
    
    //  Stop the existing timer before resetting 
    document.getElementById('activeTaskDisplay').innerText = "Manual Session" ;
    document.getElementById('mainTimerDisplay').innerText = `${minutes}:00`;
    
    console.log("Timer set for: " + taskName);
}
   //  Update the UI with the selected task and time 
function editCustomTime() {
     
    let currentTask = document.getElementById('activeTaskDisplay').innerText;
    
    //  default to " Manual Session" if no specific task is active 
    if (!currentTask || currentTask === "") {
        currentTask = "Manual Session";
    }

    let customMins = prompt("Enter duration in minutes:", "25");
    
    if (customMins !== null && !isNaN(customMins) && customMins > 0) {
        clearInterval(dashboardCountdown);
        
        // LOGIC FIX : Maintain the current task name while updating the duration
        document.getElementById('activeTaskDisplay').innerText = currentTask;
        document.getElementById('mainTimerDisplay').innerText = `${customMins}:00`;
    }
}

  // --- STRICT PROGRESS & SYNC LOGIC ---
let weeklyProgress = JSON.parse(localStorage.getItem('myWeeklyProgress')) || [0, 0, 0, 0, 0, 0, 0];
let strictStreak = parseInt(localStorage.getItem('userStrictStreak')) || 0;
let lastCheckInDate = localStorage.getItem('lastCheckInDate') || "";

function updateStrictStats(newMins = 0) {
    const user = localStorage.getItem('currentUser') || 'Guest'; // Login user ka naam
    const now = new Date();
    const todayIndex = now.getDay(); 
    const todayStr = now.toDateString();

    // --- ID-BASED DATA FETCHING ---
    let userWeeklyProgress = JSON.parse(localStorage.getItem(`weeklyProgress_${user}`)) || [0, 0, 0, 0, 0, 0, 0];
    let userStrictStreak = parseInt(localStorage.getItem(`strictStreak_${user}`)) || 0;
    let userLastCheckIn = localStorage.getItem(`lastCheckIn_${user}`) || "";

    // 1. Minutes Update (User specific)
    if(newMins > 0) {
        userWeeklyProgress[todayIndex] += newMins;
        localStorage.setItem(`weeklyProgress_${user}`, JSON.stringify(userWeeklyProgress));
    }

    // 2. Streak Logic (User specific)
    if (newMins > 0 && userLastCheckIn !== todayStr) {
        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);
        
        if (userLastCheckIn === yesterday.toDateString()) {
            userStrictStreak++;
        } else {
            userStrictStreak = 1;
        }
        localStorage.setItem(`strictStreak_${user}`, userStrictStreak);
        localStorage.setItem(`lastCheckIn_${user}`, todayStr);
    }

    // 3. UI Sync (IDs should match your HTML)
    if(document.getElementById('dashboardStreak')) document.getElementById('dashboardStreak').innerText = userStrictStreak;
    if(document.getElementById('totalMinsDisplay')) document.getElementById('totalMinsDisplay').innerText = userWeeklyProgress.reduce((a, b) => a + b, 0);

    // 4. Render Graph
    renderGraph(userWeeklyProgress);
}
 
function renderGraph(data) {
    const wrapper = document.getElementById('barWrapper');
    if(!wrapper) return;
    
    wrapper.innerHTML = '';  
    const maxVal = Math.max(...data, 60);  

    data.forEach(val => {
        const bar = document.createElement('div');
        bar.style.height = `${(val / maxVal) * 100}%`;
        bar.style.width = "18px";
        bar.style.background = val > 0 ? "#A855F7" : "#333"; 
        bar.style.borderRadius = "4px";
        bar.style.margin = "0 3px";
        bar.style.transition = "height 0.3s ease";
        wrapper.appendChild(bar);
    });
}
 // function the open the history modal
function openHistory() { 
    renderDetailedHistory(); // Pehle list ko load karo
    
    const modal = document.getElementById('historyModal');
    modal.style.display = 'flex';   
}
 // function to close the history modal
function closeHistory() { 
    document.getElementById('historyModal').style.display = 'none'; 
}
 // Function to generate an audio success tone using Web Audio API
function playSuccessTone() {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = context.createOscillator(); // High-quality sine wave for a smooth sound
    const gainNode = context.createGain();

    oscillator.type = 'sine'; // Sound ki quality
    oscillator.frequency.setValueAtTime(880, context.currentTime);  // set to High pith (A5 note)
    
    gainNode.gain.setValueAtTime(0.1, context.currentTime);  //keep volum subtle
    gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 1); 

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.start();
    oscillator.stop(context.currentTime + 1); //  Play for exactly 1 second 
}
 // Logic to save a completed session to the user's history
function saveToHistory(task, mins) {
    const user = localStorage.getItem('currentUser') || 'Guest';
    let history = JSON.parse(localStorage.getItem(`detailedHistory_${user}`)) || [];
    
    const newEntry = {
        task: task,
        mins: mins,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    history.unshift(newEntry); // Add new entry to the top of the list
    if(history.length > 20) history.pop(); // Max 20 entries
    localStorage.setItem(`detailedHistory_${user}`, JSON.stringify(history));
}

function renderDetailedHistory() {
    const user = localStorage.getItem('currentUser') || 'Guest';
    const logList = document.getElementById('modalLogList');
    const data = JSON.parse(localStorage.getItem(`detailedHistory_${user}`)) || [];

    if (data.length === 0) {
        logList.innerHTML = `<p style="color:#666; text-align:center; margin-top:20px; font-size:12px;">No sessions yet.</p>`;
        return;
    }

    logList.innerHTML = data.map(item => `
        <div style="background: rgba(255,255,255,0.03); padding: 8px 12px; border-radius: 12px; margin-bottom: 8px; border: 1px solid rgba(168, 85, 247, 0.2); display: flex; justify-content: space-between; align-items: center;">
            <div>
                <b style="color:#fff; font-size:13px; display: block;">${item.task}</b>
                <span style="color:#555; font-size:9px;">${item.date} | ${item.time}</span>
            </div>
            <span style="color:#A855F7; font-weight:bold; font-size: 13px;">+${item.mins}m</span>
        </div>
    `).join('');
}
// --- MOBILE KEYBOARD FIX ---
// Hides bottom navigation when the keyboard is active to prevent UI overlap
const inputs = document.querySelectorAll('input, textarea');
const bottomNav = document.querySelector('.bottom-nav');

inputs.forEach(input => {
    input.addEventListener('focus', () => {
        if (window.innerWidth < 600) {
            bottomNav.style.display = 'none';
        }
    });
    input.addEventListener('blur', () => {
        if (window.innerWidth < 600) {
            bottomNav.style.display = 'flex';
        }
    });
});

window.onload = () => { 
    if(localStorage.getItem('isLoggedIn') === 'true') {
        startApp();
        updateStrictStats(); 
    }
};
