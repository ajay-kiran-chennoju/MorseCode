const MORSE_MAP = {
  ".-": "A", "-...": "B", "-.-.": "C", "-..": "D", ".": "E", "..-.": "F",
  "--.": "G", "....": "H", "..": "I", ".---": "J", "-.-": "K", ".-..": "L",
  "--": "M", "-.": "N", "---": "O", ".--.": "P", "--.-": "Q", ".-.": "R",
  "...": "S", "-": "T", "..-": "U", "...-": "V", ".--": "W", "-..-": "X",
  "-.--": "Y", "--..": "Z", ".----": "1", "..---": "2", "...--": "3",
  "....-": "4", ".....": "5", "-....": "6", "--...": "7", "---..": "8",
  "----.": "9", "-----": "0"
};

// UI Elements
const output = document.getElementById('output');
const morsePad = document.getElementById('morse-pad');
const copyBtn = document.getElementById('copy-btn');
const translateBtn = document.getElementById('translate-btn');
const clearBtn = document.getElementById('clear-btn');
const helpBtn = document.getElementById('help-btn');
const helpModal = document.getElementById('help-modal');
const closeModal = document.querySelector('.close-modal');
const alphabetGrid = document.getElementById('alphabet-grid');

// Input state
let pressStartTime = 0;
let lastReleaseTime = Date.now();
let letterTimer = null;
let wordTimer = null;
let originalMorse = ""; // We'll store what's currently in the textarea (as Morse)

// Audio context for beep
let audioCtx = null;
let oscillator = null;

// --- Audio Initialization ---
function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function playBeep() {
  initAudio();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  
  oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
  
  gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); // Low volume
  
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  oscillator.start();
}

function stopBeep() {
  if (oscillator) {
    oscillator.stop();
    oscillator = null;
  }
}

// --- Logic Functions ---

function addSymbol(symbol) {
  output.value += symbol;
  output.scrollTop = output.scrollHeight;
  originalMorse = output.value;
}

function startInput(e) {
  if (e) e.preventDefault(); // Prevent double triggering and zoom on mobile
  
  pressStartTime = Date.now();
  clearTimeout(letterTimer);
  clearTimeout(wordTimer);
  
  morsePad.classList.add('active');
  if (navigator.vibrate) navigator.vibrate(20);
  
  playBeep();
}

function endInput(e) {
  if (e) e.preventDefault();
  
  const duration = Date.now() - pressStartTime;
  stopBeep();
  morsePad.classList.remove('active');
  
  if (duration > 0) {
    if (duration < 200) {
      addSymbol('•');
    } else {
      addSymbol('-');
    }
  }

  // Set timers for gaps
  letterTimer = setTimeout(() => {
    addSymbol(' ');
  }, 500);

  wordTimer = setTimeout(() => {
    // Replace last space with a word separator
    if (output.value.endsWith(' ')) {
      output.value = output.value.slice(0, -1) + ' / ';
      originalMorse = output.value;
    }
  }, 1200);
}

// --- Translation Engine ---

function decodeMorse(morseStr) {
  // Normalize symbols: • -> .
  const normalized = morseStr.replace(/•/g, '.');
  
  // Split into words by /
  const words = normalized.trim().split(/\s\/\s/);
  
  return words.map(word => {
    // Split word into letters by spaces
    const letters = word.split(/\s+/);
    return letters.map(letter => MORSE_MAP[letter] || '?').join('');
  }).join(' ');
}

function handleTranslationToggle(isHolding) {
  if (isHolding) {
    if (!output.value) return;
    translateBtn.classList.add('holding');
    const english = decodeMorse(output.value);
    output.value = english;
  } else {
    translateBtn.classList.remove('holding');
    output.value = originalMorse;
  }
}

// --- Event Listeners ---

// Input pad (Multi-touch support)
const inputEvents = [
  ['mousedown', startInput], ['mouseup', endInput], ['mouseleave', endInput],
  ['touchstart', startInput], ['touchend', endInput]
];
inputEvents.forEach(([ev, fn]) => morsePad.addEventListener(ev, fn, { passive: false }));

// Action Buttons
copyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(output.value);
    const span = copyBtn.querySelector('span');
    const originalText = span.innerText;
    span.innerText = "Copied!";
    setTimeout(() => span.innerText = originalText, 1500);
  } catch (err) { console.error(err); }
});

clearBtn.addEventListener('click', () => {
  output.value = "";
  originalMorse = "";
});

// Translation Toggle
const transEvents = [
  ['mousedown', () => handleTranslationToggle(true)],
  ['mouseup', () => handleTranslationToggle(false)],
  ['mouseleave', () => handleTranslationToggle(false)],
  ['touchstart', () => handleTranslationToggle(true)],
  ['touchend', () => handleTranslationToggle(false)]
];
transEvents.forEach(([ev, fn]) => translateBtn.addEventListener(ev, fn, { passive: false }));

// Modal
helpBtn.addEventListener('click', () => {
  helpModal.style.display = 'block';
  setTimeout(() => helpModal.classList.add('show'), 10);
});

const closeHelp = () => {
  helpModal.classList.remove('show');
  setTimeout(() => helpModal.style.display = 'none', 300);
};
closeModal.addEventListener('click', closeHelp);
window.addEventListener('click', (e) => { if (e.target === helpModal) closeHelp(); });

// Init alphabet
function renderAlphabet() {
  Object.entries(MORSE_MAP).sort().forEach(([morse, key]) => {
    // Format morse back to • format
    const displayMorse = morse.replace(/\./g, '•');
    const div = document.createElement('div');
    div.className = 'morse-item';
    div.innerHTML = `<span class="morse-key">${key}</span><span class="morse-val">${displayMorse}</span>`;
    alphabetGrid.appendChild(div);
  });
}
renderAlphabet();
