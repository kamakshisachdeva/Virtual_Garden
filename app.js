// Initialize Lucide Icons
lucide.createIcons();

// Navigation Logic
const navBtns = document.querySelectorAll('.nav-btn');
const views = document.querySelectorAll('.view-section');

navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons
        navBtns.forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        btn.classList.add('active');

        // Hide all views
        views.forEach(v => v.classList.remove('active'));
        
        // Show target view
        const targetId = btn.getAttribute('data-target');
        const targetView = document.getElementById(targetId);
        if (targetView) {
            // Small delay for smooth opacity transition
            setTimeout(() => {
                targetView.classList.add('active');
            }, 50);
        }
    });
});

// Set current date in Journal
const dateElement = document.getElementById('current-date');
if (dateElement) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateElement.textContent = new Date().toLocaleDateString('en-US', options);
}

// --- Journal Logic ---

const journalMoods = document.querySelectorAll('.mood-btn');
const journalTextarea = document.getElementById('journal-textarea');
const journalSaveBtn = document.getElementById('journal-save-btn');
const journalEntriesList = document.getElementById('journal-entries-list');

let currentMood = '🙂'; // Default

// Mood Selection
journalMoods.forEach(btn => {
    btn.addEventListener('click', () => {
        journalMoods.forEach(b => {
            b.classList.remove('opacity-100');
            b.classList.add('opacity-40');
        });
        btn.classList.remove('opacity-40');
        btn.classList.add('opacity-100');
        currentMood = btn.getAttribute('data-mood');
    });
});

function loadJournalEntries() {
    const entries = JSON.parse(localStorage.getItem('zen_journal') || '[]');
    journalEntriesList.innerHTML = '';
    
    if (entries.length === 0) {
        journalEntriesList.innerHTML = '<p class="text-sm text-zen-charcoal/50 italic p-4">No reflections yet. Start writing...</p>';
        return;
    }

    entries.forEach(entry => {
        const div = document.createElement('div');
        div.className = 'glass-panel p-5 bg-white/60 text-zen-charcoal text-sm hover:bg-white/80 transition-colors cursor-pointer';
        div.innerHTML = `
            <div class="flex justify-between items-center mb-3 border-b border-zen-charcoal/10 pb-2">
                <span class="font-medium text-xs tracking-wider uppercase text-zen-charcoal/70">${entry.date}</span>
                <span class="text-xl">${entry.mood}</span>
            </div>
            <p class="font-serif leading-relaxed line-clamp-3 text-zen-charcoal/90 text-base">${entry.text}</p>
        `;
        // Optional: click to view full entry (expand)
        div.addEventListener('click', () => {
            const p = div.querySelector('p');
            p.classList.toggle('line-clamp-3');
        });
        journalEntriesList.appendChild(div);
    });
}

journalSaveBtn.addEventListener('click', () => {
    const text = journalTextarea.value.trim();
    if (!text) return;

    const entries = JSON.parse(localStorage.getItem('zen_journal') || '[]');
    const newEntry = {
        id: Date.now(),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        mood: currentMood,
        text: text
    };

    entries.unshift(newEntry); // Add to beginning
    localStorage.setItem('zen_journal', JSON.stringify(entries));

    // Clear form
    journalTextarea.value = '';
    
    // Refresh list
    loadJournalEntries();
    
    // Visual feedback on save button
    const originalText = journalSaveBtn.innerHTML;
    journalSaveBtn.innerHTML = '<i data-lucide="check" class="w-5 h-5"></i> Saved';
    lucide.createIcons();
    setTimeout(() => {
        journalSaveBtn.innerHTML = originalText;
        lucide.createIcons();
    }, 2000);
});

// Initial load
loadJournalEntries();

// --- Greenhouse Logic ---

const ghSetup = document.getElementById('gh-setup');
const ghGrowing = document.getElementById('gh-growing');
const ghTimeInput = document.getElementById('gh-time-input');
const ghTimeDisplay = document.getElementById('gh-time-display');
const ghStartBtn = document.getElementById('gh-start-btn');
const ghCancelBtn = document.getElementById('gh-cancel-btn');
const ghActiveTime = document.getElementById('gh-active-time');
const ghProgressBar = document.getElementById('gh-progress-bar');
const ghStageName = document.getElementById('gh-stage-name');
const ghMessageInput = document.getElementById('gh-message-input');

const ghSeedBtns = document.querySelectorAll('.gh-seed-btn');
let selectedSeed = 'oak';
let totalGrowthSeconds = 25 * 60;
let currentGrowthSeconds = 0;
let ghTimer = null;

// Seed Selection
ghSeedBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        ghSeedBtns.forEach(b => {
            b.classList.remove('active', 'border-zen-sage');
            b.classList.add('border-transparent');
        });
        btn.classList.add('active', 'border-zen-sage');
        btn.classList.remove('border-transparent');
        selectedSeed = btn.getAttribute('data-seed');
    });
});

// Timer Slider
ghTimeInput.addEventListener('input', (e) => {
    const mins = e.target.value;
    ghTimeDisplay.textContent = `${mins}:00`;
    totalGrowthSeconds = mins * 60;
});

function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function updatePlantStage(percentage) {
    const svgs = ['gh-svg-seed', 'gh-svg-sprout', 'gh-svg-sapling', 'gh-svg-mature'];
    const container = document.getElementById('gh-plant-container');
    
    // Hide all first
    svgs.forEach(id => {
        const el = document.getElementById(id);
        if(el) {
            el.classList.remove('opacity-100');
            el.classList.add('opacity-0');
        }
    });

    let activeSvg = svgs[0];
    let stageStr = 'Seed';
    let scale = 0.3;

    if (percentage >= 100) {
        activeSvg = svgs[3];
        stageStr = 'Mature';
        scale = 1.0;
    } else if (percentage >= 66) {
        activeSvg = svgs[2];
        stageStr = 'Sapling';
        scale = 0.8;
    } else if (percentage >= 33) {
        activeSvg = svgs[1];
        stageStr = 'Sprout';
        scale = 0.5;
    } else {
        activeSvg = svgs[0];
        stageStr = 'Seed';
        scale = 0.3;
    }

    const activeEl = document.getElementById(activeSvg);
    if(activeEl) {
        activeEl.classList.remove('opacity-0');
        activeEl.classList.add('opacity-100');
    }
    ghStageName.textContent = stageStr;
    container.style.transform = `scale(${scale})`;
}

// Start Growth
ghStartBtn.addEventListener('click', () => {
    ghSetup.classList.add('hidden');
    ghGrowing.classList.remove('hidden');
    ghGrowing.classList.add('flex');
    
    currentGrowthSeconds = totalGrowthSeconds;
    ghActiveTime.textContent = formatTime(currentGrowthSeconds);
    ghProgressBar.style.width = '0%';
    updatePlantStage(0);

    ghTimer = setInterval(() => {
        currentGrowthSeconds--;
        ghActiveTime.textContent = formatTime(currentGrowthSeconds);
        
        const progress = ((totalGrowthSeconds - currentGrowthSeconds) / totalGrowthSeconds) * 100;
        ghProgressBar.style.width = `${progress}%`;
        
        updatePlantStage(progress);

        if (currentGrowthSeconds <= 0) {
            clearInterval(ghTimer);
            ghActiveTime.textContent = "00:00";
            ghStageName.textContent = "Fully Grown";
            ghCancelBtn.textContent = "Continue ->";
            ghCancelBtn.classList.remove('text-zen-charcoal/50', 'hover:text-red-500');
            ghCancelBtn.classList.add('text-zen-sage', 'hover:text-zen-dark', 'font-bold');
            saveToGarden(selectedSeed, ghMessageInput ? ghMessageInput.value.trim() : '');
        }
    }, 1000);
});

// Cancel or Continue Growth
ghCancelBtn.addEventListener('click', () => {
    clearInterval(ghTimer);
    ghSetup.classList.remove('hidden');
    ghGrowing.classList.add('hidden');
    ghGrowing.classList.remove('flex');
    
    // Reset button text and style back to original
    ghCancelBtn.textContent = "Abandon Growth";
    ghCancelBtn.classList.remove('text-zen-sage', 'hover:text-zen-dark', 'font-bold');
    ghCancelBtn.classList.add('text-zen-charcoal/50', 'hover:text-red-500');
});

// --- Isometric Garden Space Logic ---
const gardenGrid = document.getElementById('isometric-grid');
const dockAddBtn = document.getElementById('dock-add-btn');
const dockMoveBtn = document.getElementById('dock-move-btn');
const dockWaterBtn = document.getElementById('dock-water-btn');
const dockRemoveBtn = document.getElementById('dock-remove-btn');

let gardenPlants = JSON.parse(localStorage.getItem('zen_garden_plants')) || [];
let gardenMode = 'normal'; // 'normal', 'move', 'water', 'remove'

const plantDetails = {
    'oak': { name: 'Oak', icon: 'tree-deciduous', color: 'text-zen-charcoal' },
    'lavender': { name: 'Lavender', icon: 'flower-2', color: 'text-[#9884B3]' },
    'bonsai': { name: 'Bonsai', icon: 'tree-pine', color: 'text-zen-charcoal' },
    'fern': { name: 'Silver Fern', icon: 'leaf', color: 'text-zen-sage' },
    'rose': { name: 'Wild Rose', icon: 'flower', color: 'text-pink-400' }
};

function saveGarden() {
    localStorage.setItem('zen_garden_plants', JSON.stringify(gardenPlants));
}

function saveToGarden(seedType, message) {
    const x = Math.floor(Math.random() * 600) + 100;
    const y = Math.floor(Math.random() * 600) + 100;
    
    // 20% chance it needs water
    const status = Math.random() > 0.8 ? 'thirsty' : 'healthy';
    
    const plant = {
        id: Date.now(),
        type: seedType,
        message: message || '',
        x, y,
        status
    };
    gardenPlants.push(plant);
    saveGarden();
    renderGarden();
}

function renderGarden() {
    gardenGrid.innerHTML = '';
    gardenPlants.forEach(plant => {
        const details = plantDetails[plant.type] || plantDetails['oak'];
        
        const el = document.createElement('div');
        el.className = 'iso-item flex flex-col items-center group cursor-pointer';
        el.style.left = `${plant.x}px`;
        el.style.top = `${plant.y}px`;
        el.setAttribute('data-id', plant.id);

        let badgeHtml = '';
        if (plant.status === 'thirsty') {
            badgeHtml = `<div class="absolute -bottom-8 bg-[#FBBF24] text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-md z-10 transition-all group-hover:-translate-y-1">NEEDS WATER</div>`;
        }

        let messageHtml = '';
        if (plant.message) {
            messageHtml = `<div class="text-[10px] text-zen-charcoal/80 mt-1 italic max-w-[120px] whitespace-normal text-center leading-tight">"${plant.message}"</div>`;
        }

        el.innerHTML = `
            <div class="relative flex flex-col items-center">
                <i data-lucide="${details.icon}" class="w-16 h-16 ${details.color} drop-shadow-lg transition-transform group-hover:scale-110 duration-300"></i>
                <div class="absolute bottom-full mb-2 glass-panel px-3 py-2 text-xs font-medium text-zen-charcoal whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center shadow-lg pointer-events-none z-50">
                    <span class="font-bold">${details.name}</span>
                    ${messageHtml}
                </div>
                ${badgeHtml}
            </div>
        `;

        el.addEventListener('click', (e) => handlePlantClick(e, plant.id));

        gardenGrid.appendChild(el);
    });
    lucide.createIcons();
}

function handlePlantClick(e, id) {
    if (gardenMode === 'remove') {
        gardenPlants = gardenPlants.filter(p => p.id !== id);
        saveGarden();
        renderGarden();
    } else if (gardenMode === 'water') {
        const p = gardenPlants.find(p => p.id === id);
        if (p && p.status === 'thirsty') {
            p.status = 'healthy';
            saveGarden();
            renderGarden();
        }
    } else if (gardenMode === 'move') {
        const p = gardenPlants.find(p => p.id === id);
        if(p) {
            p.x = Math.floor(Math.random() * 600) + 100;
            p.y = Math.floor(Math.random() * 600) + 100;
            saveGarden();
            renderGarden();
        }
    }
}

function resetDock() {
    [dockMoveBtn, dockWaterBtn, dockRemoveBtn].forEach(btn => btn.classList.remove('bg-black/10', 'shadow-inner'));
}

dockAddBtn.addEventListener('click', () => {
    document.querySelector('[data-target="view-greenhouse"]').click();
});

dockMoveBtn.addEventListener('click', () => {
    gardenMode = gardenMode === 'move' ? 'normal' : 'move';
    resetDock();
    if(gardenMode === 'move') dockMoveBtn.classList.add('bg-black/10', 'shadow-inner');
});

dockWaterBtn.addEventListener('click', () => {
    gardenMode = gardenMode === 'water' ? 'normal' : 'water';
    resetDock();
    if(gardenMode === 'water') dockWaterBtn.classList.add('bg-black/10', 'shadow-inner');
});

dockRemoveBtn.addEventListener('click', () => {
    gardenMode = gardenMode === 'remove' ? 'normal' : 'remove';
    resetDock();
    if(gardenMode === 'remove') dockRemoveBtn.classList.add('bg-black/10', 'shadow-inner');
});

renderGarden();


// --- Pomodoro Logic ---

const pomoSetup = document.getElementById('pomo-setup');
const pomoActive = document.getElementById('pomo-active');
const pomoFocusInput = document.getElementById('pomo-focus-input');
const pomoBreakInput = document.getElementById('pomo-break-input');
const pomoRepeatInput = document.getElementById('pomo-repeat-input');
const pomoFocusDisplay = document.getElementById('pomo-focus-display');
const pomoBreakDisplay = document.getElementById('pomo-break-display');
const pomoRepeatDisplay = document.getElementById('pomo-repeat-display');
const pomoSummaryDisplay = document.getElementById('pomo-summary-display');
const pomoStartBtn = document.getElementById('pomo-start-btn');

const pomoTimeDisplay = document.getElementById('pomo-time-display');
const pomoPhaseDisplay = document.getElementById('pomo-phase-display');
const pomoPauseBtn = document.getElementById('pomo-pause-btn');
const pomoRestartBtn = document.getElementById('pomo-restart-btn');
const pomoStopBtn = document.getElementById('pomo-stop-btn');
const pomoSvgProgress = document.getElementById('pomo-svg-progress');
const pomoPlantStatus = document.getElementById('pomo-plant-status');
const pomoPlantContainer = document.getElementById('pomo-plant-container');
const pomoPauseIcon = document.getElementById('pomo-pause-icon');

let pomoFocusMins = 20;
let pomoBreakMins = 5;
let pomoRepeatCount = 1;
let pomoTotalPhases = 2;

let pomoTimer = null;
let pomoIsPaused = false;
let pomoCurrentPhase = 0;
let pomoTimeRemaining = 0;
let pomoPhaseTotalTime = 0;

function updatePomoSummary() {
    pomoFocusMins = parseInt(pomoFocusInput.value);
    pomoBreakMins = parseInt(pomoBreakInput.value);
    pomoRepeatCount = parseInt(pomoRepeatInput.value);
    
    pomoFocusDisplay.textContent = `${pomoFocusMins} min`;
    pomoBreakDisplay.textContent = `${pomoBreakMins} min`;
    pomoRepeatDisplay.textContent = `${pomoRepeatCount}`;
    
    const totalTime = (pomoFocusMins + pomoBreakMins) * pomoRepeatCount;
    pomoSummaryDisplay.textContent = `${totalTime} min`;
}

pomoFocusInput.addEventListener('input', updatePomoSummary);
pomoBreakInput.addEventListener('input', updatePomoSummary);
pomoRepeatInput.addEventListener('input', updatePomoSummary);
updatePomoSummary();

function setPomoPhase(phaseIndex) {
    pomoCurrentPhase = phaseIndex;
    
    if (phaseIndex >= pomoTotalPhases) {
        // Done
        pomoPhaseDisplay.textContent = "Complete";
        pomoPhaseDisplay.classList.replace('text-zen-sky', 'text-zen-sage');
        pomoTimeRemaining = 0;
        pomoPhaseTotalTime = 1; // avoid div by 0
        pomoPlantStatus.textContent = "Fully Grown";
        updatePomoDisplay();
        return;
    }

    if (phaseIndex % 2 === 0) {
        // Focus Phase
        const repeatNum = Math.floor(phaseIndex / 2) + 1;
        pomoPhaseDisplay.textContent = `Focus ${repeatNum}/${pomoRepeatCount}`;
        pomoPhaseDisplay.classList.replace('text-zen-sky', 'text-zen-sage');
        pomoTimeRemaining = pomoFocusMins * 60;
        pomoPhaseTotalTime = pomoFocusMins * 60;
        pomoPlantStatus.textContent = "Growing...";
    } else {
        // Break Phase
        const repeatNum = Math.floor(phaseIndex / 2) + 1;
        pomoPhaseDisplay.textContent = `Break ${repeatNum}/${pomoRepeatCount}`;
        pomoPhaseDisplay.classList.replace('text-zen-sage', 'text-zen-sky');
        pomoTimeRemaining = pomoBreakMins * 60;
        pomoPhaseTotalTime = pomoBreakMins * 60;
        pomoPlantStatus.textContent = "Resting";
    }
    updatePomoDisplay();
}

function updatePomoPlant() {
    const svgs = ['pomo-svg-seed', 'pomo-svg-sprout', 'pomo-svg-mature'];
    svgs.forEach(id => {
        const el = document.getElementById(id);
        if(el) {
            el.classList.remove('opacity-100');
            el.classList.add('opacity-0');
        }
    });

    let activeSvg = svgs[0];
    let scale = 0.3;

    if (pomoCurrentPhase >= pomoTotalPhases) {
        activeSvg = svgs[2];
        scale = 1.0;
    } else {
        // Calculate total progress across all phases
        const currentPhaseProgress = (pomoPhaseTotalTime - pomoTimeRemaining) / pomoPhaseTotalTime;
        const overallProgress = (pomoCurrentPhase + currentPhaseProgress) / pomoTotalPhases;
        
        if (overallProgress > 0.66) {
            activeSvg = svgs[2];
            scale = 0.6 + (0.4 * (overallProgress - 0.66) / 0.34);
        } else if (overallProgress > 0.33) {
            activeSvg = svgs[1];
            scale = 0.4 + (0.2 * (overallProgress - 0.33) / 0.33);
        } else {
            activeSvg = svgs[0];
            scale = 0.3 + (0.1 * overallProgress / 0.33);
        }
    }

    const activeEl = document.getElementById(activeSvg);
    if(activeEl) {
        activeEl.classList.remove('opacity-0');
        activeEl.classList.add('opacity-100');
    }
    pomoPlantContainer.style.transform = `scale(${scale})`;
}

function updatePomoDisplay() {
    pomoTimeDisplay.textContent = formatTime(Math.ceil(pomoTimeRemaining));
    
    const progress = (pomoPhaseTotalTime - pomoTimeRemaining) / pomoPhaseTotalTime;
    const offset = 879.64 - (progress * 879.64);
    pomoSvgProgress.style.strokeDashoffset = offset;
    
    updatePomoPlant();
}

pomoStartBtn.addEventListener('click', () => {
    pomoSetup.classList.add('hidden');
    pomoActive.classList.remove('hidden');
    pomoActive.classList.add('flex');
    
    pomoIsPaused = false;
    pomoPauseBtn.innerHTML = '<i data-lucide="pause" class="w-6 h-6 ml-0.5"></i>';
    lucide.createIcons();
    
    pomoTotalPhases = pomoRepeatCount * 2;
    setPomoPhase(0);

    pomoTimer = setInterval(() => {
        if (!pomoIsPaused) {
            pomoTimeRemaining--;
            updatePomoDisplay();

            if (pomoTimeRemaining <= 0) {
                const nextPhase = pomoCurrentPhase + 1;
                setPomoPhase(nextPhase);
                if (nextPhase >= pomoTotalPhases) {
                    clearInterval(pomoTimer);
                }
            }
        }
    }, 1000);
});

pomoPauseBtn.addEventListener('click', () => {
    pomoIsPaused = !pomoIsPaused;
    if (pomoIsPaused) {
        pomoPauseBtn.innerHTML = '<i data-lucide="play" class="w-6 h-6 ml-0.5"></i>';
    } else {
        pomoPauseBtn.innerHTML = '<i data-lucide="pause" class="w-6 h-6 ml-0.5"></i>';
    }
    lucide.createIcons();
});

pomoRestartBtn.addEventListener('click', () => {
    clearInterval(pomoTimer);
    
    pomoIsPaused = false;
    pomoPauseBtn.innerHTML = '<i data-lucide="pause" class="w-6 h-6 ml-0.5"></i>';
    lucide.createIcons();
    
    pomoTotalPhases = pomoRepeatCount * 2;
    setPomoPhase(0);

    pomoTimer = setInterval(() => {
        if (!pomoIsPaused) {
            pomoTimeRemaining--;
            updatePomoDisplay();

            if (pomoTimeRemaining <= 0) {
                // If we just finished a focus phase (even index)
                if (pomoCurrentPhase % 2 === 0) {
                    saveToGarden('fern', 'Pomodoro Focus Session');
                }

                const nextPhase = pomoCurrentPhase + 1;
                setPomoPhase(nextPhase);
                if (nextPhase >= pomoTotalPhases) {
                    clearInterval(pomoTimer);
                }
            }
        }
    }, 1000);
});

pomoStopBtn.addEventListener('click', () => {
    clearInterval(pomoTimer);
    pomoSetup.classList.remove('hidden');
    pomoActive.classList.add('hidden');
    pomoActive.classList.remove('flex');
});

// --- Soundscape Logic ---

const soundCards = document.querySelectorAll('.sound-card');
const globalAudioElements = {};

soundCards.forEach(card => {
    const src = card.getAttribute('data-src');
    const playBtn = card.querySelector('.sound-play-btn');
    const icon = card.querySelector('.sound-icon');
    const slider = card.querySelector('.sound-volume-slider');

    // Create audio element
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = slider.value / 100;
    globalAudioElements[src] = audio;

    let isPlaying = false;

    playBtn.addEventListener('click', () => {
        isPlaying = !isPlaying;
        if (isPlaying) {
            audio.play().catch(e => console.log("Audio play blocked until interaction:", e));
            icon.setAttribute('data-lucide', 'pause');
            playBtn.classList.replace('bg-zen-sage', 'bg-zen-charcoal');
        } else {
            audio.pause();
            icon.setAttribute('data-lucide', 'play');
            playBtn.classList.replace('bg-zen-charcoal', 'bg-zen-sage');
        }
        lucide.createIcons();
    });

    slider.addEventListener('input', (e) => {
        audio.volume = e.target.value / 100;
    });
});

// Also wire up the Greenhouse music selector
const ghMusicSelect = document.getElementById('gh-music-select');
const ghMusicToggle = document.getElementById('gh-music-toggle');
const ghMusicIcon = document.getElementById('gh-music-icon');
let currentGhAudio = null;
let ghMusicPlaying = false;

const musicMap = {
    'rain': 'https://upload.wikimedia.org/wikipedia/commons/4/42/Rain_on_a_Tin_Roof.ogg',
    'birds': 'https://upload.wikimedia.org/wikipedia/commons/3/30/Forest_birds.ogg',
    'bowls': 'https://upload.wikimedia.org/wikipedia/commons/d/df/Tibetan_Singing_Bowl.ogg'
};

if (ghMusicToggle && ghMusicSelect) {
    ghMusicToggle.addEventListener('click', () => {
        const choice = ghMusicSelect.value;
        if (choice === 'none') return;
        
        const src = musicMap[choice];
        
        if (currentGhAudio && currentGhAudio.src !== src) {
            currentGhAudio.pause();
            ghMusicPlaying = false;
        }

        if (!currentGhAudio || currentGhAudio.src !== src) {
            currentGhAudio = new Audio(src);
            currentGhAudio.loop = true;
            currentGhAudio.volume = 0.5;
        }

        ghMusicPlaying = !ghMusicPlaying;
        
        if (ghMusicPlaying) {
            currentGhAudio.play().catch(e => console.log(e));
            ghMusicIcon.setAttribute('data-lucide', 'pause');
        } else {
            currentGhAudio.pause();
            ghMusicIcon.setAttribute('data-lucide', 'play');
        }
        lucide.createIcons();
    });

    ghMusicSelect.addEventListener('change', () => {
        if (currentGhAudio) {
            currentGhAudio.pause();
            ghMusicPlaying = false;
            ghMusicIcon.setAttribute('data-lucide', 'play');
            lucide.createIcons();
        }
    });
}

// --- Quotes Logic ---

const quoteAddBtn = document.getElementById('quote-add-btn');
const quoteCancelBtn = document.getElementById('quote-cancel-btn');
const quoteSaveBtn = document.getElementById('quote-save-btn');
const quoteFormContainer = document.getElementById('quote-form-container');
const quotesGrid = document.getElementById('quotes-grid');

// Inputs
const quoteInputText = document.getElementById('quote-input-text');
const quoteInputAuthor = document.getElementById('quote-input-author');
const quoteInputBg = document.getElementById('quote-input-bg');
const quoteInputColor = document.getElementById('quote-input-color');
const quoteInputFont = document.getElementById('quote-input-font');

quoteAddBtn.addEventListener('click', () => {
    quoteFormContainer.classList.remove('hidden');
    quoteAddBtn.classList.add('hidden');
});

quoteCancelBtn.addEventListener('click', () => {
    quoteFormContainer.classList.add('hidden');
    quoteAddBtn.classList.remove('hidden');
});

const defaultQuotes = [
    { id: 1, text: "Nature does not hurry, yet everything is accomplished.", author: "Lao Tzu", bg: "rgba(255,255,255,0.7)", color: "#435334", font: "font-serif italic text-xl" },
    { id: 2, text: "Peace comes from within. Do not seek it without.", author: "Buddha", bg: "rgba(193,216,255,0.4)", color: "#435334", font: "font-sans font-medium text-2xl" },
    { id: 3, text: "The mind is like water. When it's turbulent, it's difficult to see. When it's calm, everything becomes clear.", author: "Prasad Mahes", bg: "rgba(206,222,189,0.4)", color: "#435334", font: "font-serif italic text-lg" },
    { id: 4, text: "Quiet the mind, and the soul will speak.", author: "Ma Jaya Sati Bhagavati", bg: "rgba(229,212,255,0.4)", color: "#435334", font: "font-sans font-medium text-xl" }
];

function loadQuotes() {
    let quotes = JSON.parse(localStorage.getItem('zen_quotes'));
    if (!quotes || quotes.length === 0) {
        quotes = defaultQuotes;
        localStorage.setItem('zen_quotes', JSON.stringify(quotes));
    }
    
    quotesGrid.innerHTML = '';
    quotes.forEach(quote => {
        const div = document.createElement('div');
        div.className = 'break-inside-avoid glass-panel p-8 hover:-translate-y-1 transition-transform relative group';
        div.style.backgroundColor = quote.bg;
        
        div.innerHTML = `
            <i data-lucide="quote" class="w-10 h-10 mb-4 opacity-40" style="color: ${quote.color}"></i>
            <p class="${quote.font} mb-6 leading-relaxed" style="color: ${quote.color}">"${quote.text}"</p>
            <p class="text-sm font-medium text-right uppercase tracking-wider" style="color: ${quote.color}">— ${quote.author}</p>
            <button class="delete-quote-btn absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-white/50 rounded-full p-2 hover:bg-red-100 hover:text-red-600 text-zen-charcoal/50" data-id="${quote.id}">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
        `;
        quotesGrid.appendChild(div);
    });

    lucide.createIcons();

    // Wire up delete buttons
    document.querySelectorAll('.delete-quote-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idToRemove = parseInt(e.currentTarget.getAttribute('data-id'));
            let currentQuotes = JSON.parse(localStorage.getItem('zen_quotes')) || [];
            currentQuotes = currentQuotes.filter(q => q.id !== idToRemove);
            localStorage.setItem('zen_quotes', JSON.stringify(currentQuotes));
            loadQuotes();
        });
    });
}

quoteSaveBtn.addEventListener('click', () => {
    const text = quoteInputText.value.trim();
    const author = quoteInputAuthor.value.trim() || 'Unknown';
    if (!text) return;

    function hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    const quotes = JSON.parse(localStorage.getItem('zen_quotes') || '[]');
    const newQuote = {
        id: Date.now(),
        text: text,
        author: author,
        bg: hexToRgba(quoteInputBg.value, 0.6), // make background slightly transparent to keep glassmorphism feel
        color: quoteInputColor.value,
        font: quoteInputFont.value
    };

    quotes.unshift(newQuote);
    localStorage.setItem('zen_quotes', JSON.stringify(quotes));

    // Clear form
    quoteInputText.value = '';
    quoteInputAuthor.value = '';
    
    // Hide form
    quoteFormContainer.classList.add('hidden');
    quoteAddBtn.classList.remove('hidden');

    loadQuotes();
});

// Initial load
loadQuotes();
