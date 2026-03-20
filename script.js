const MORSE_MAP = {
  ".-": "A", "-...": "B", "-.-.": "C", "-..": "D", ".": "E", "..-.": "F",
  "--.": "G", "....": "H", "..": "I", ".---": "J", "-.-": "K", ".-..": "L",
  "--": "M", "-.": "N", "---": "O", ".--.": "P", "--.-": "Q", ".-.": "R",
  "...": "S", "-": "T", "..-": "U", "...-": "V", ".--": "W", "-..-": "X",
  "-.--": "Y", "--..": "Z", ".----": "1", "..---": "2", "...--": "3",
  "....-": "4", ".....": "5", "-....": "6", "--...": "7", "---..": "8",
  "----.": "9", "-----": "0"
};

// Elements
const output = document.getElementById('output');
const morsePad = document.getElementById('morse-pad');
const copyBtn = document.getElementById('copy-btn');
const translateBtn = document.getElementById('translate-btn');
const clearBtn = document.getElementById('clear-btn');
const helpBtn = document.getElementById('help-btn');
const helpModal = document.getElementById('help-modal');
const closeModal = document.querySelector('.close-modal');
const alphabetGrid = document.getElementById('alphabet-grid');

// State
let pressStartTime = 0;
let lastReleaseTime = Date.now();
let spaceTimer = null;
let currentMorse = ""; // Store original Morse code
let originalDisplay = ""; // Tracking display content

// --- Morse Logic ---

function addMorse(char) {
  output.value += char;
  output.scrollTop = output.scrollHeight;
  originalDisplay = output.value;
}

function handlePressStart(e) {
  if (e) e.preventDefault();
  pressStartTime = Date.now();
  if (spaceTimer) clearTimeout(spaceTimer);

  // Visual & Haptic
  morsePad.classList.add('active');
  if (navigator.vibrate) navigator.vibrate(20);
}

function handlePressEnd(e) {
  if (e) e.preventDefault();
  const duration = Date.now() - pressStartTime;

  if (duration < 200) {
    addMorse('.');
  } else {
    addMorse('-');
  }

  morsePad.classList.remove('active');
  lastReleaseTime = Date.now();

  // Set timer to add space after 500ms of inactivity
  spaceTimer = setTimeout(() => {
    addMorse(' ');
  }, 500);

  wordTimer = setTimeout(() => {
    // Replace last space with a word separator
    if (output.value.endsWith(' ')) {
      output.value = output.value.slice(0, -1) + '    ';
      originalMorse = output.value;
    }
  }, 1200);
}

// --- Translation ---

function translateMorse(morseText) {
  // Split by spaces (assuming each space separates characters as per user spec)
  return morseText
    .trim()
    .split(/\s+/)
    .map(symbol => {
      // Normalize dots
      const normalized = symbol.replace(/\./g, '.');
      return MORSE_MAP[normalized] || '?';
    })
    .join('');
}

function handleTranslationStart() {
  if (!output.value) return;
  originalDisplay = output.value;
  const translated = translateMorse(output.value);
  output.value = translated;
  translateBtn.classList.add('holding');
}

function handleTranslationEnd() {
  output.value = originalDisplay;
  translateBtn.classList.remove('holding');
}

// --- Copy & Clear ---

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(output.value);
    const originalSvg = copyBtn.innerHTML;
    copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="green" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    setTimeout(() => copyBtn.innerHTML = originalSvg, 1500);
  } catch (err) {
    console.error('Failed to copy: ', err);
  }
}

function clearOutput() {
  output.value = "";
  originalDisplay = "";
}

// --- UI Helpers ---

function populateAlphabet() {
  Object.entries(MORSE_MAP)
    .sort((a, b) => a[1].localeCompare(b[1]))
    .forEach(([morse, char]) => {
      const item = document.createElement('div');
      item.className = 'morse-item';
      item.innerHTML = `<span class="morse-key">${char}</span><span class="morse-val">${morse}</span>`;
      alphabetGrid.appendChild(item);
    });
}

// --- Event Listeners ---

// Morse Pad
morsePad.addEventListener('mousedown', handlePressStart);
morsePad.addEventListener('mouseup', handlePressEnd);
morsePad.addEventListener('touchstart', handlePressStart);
morsePad.addEventListener('touchend', handlePressEnd);

// Copy & Clear
copyBtn.addEventListener('click', copyToClipboard);
clearBtn.addEventListener('click', clearOutput);

// Translate Toggle (Hold)
translateBtn.addEventListener('mousedown', handleTranslationStart);
translateBtn.addEventListener('mouseup', handleTranslationEnd);
translateBtn.addEventListener('mouseleave', handleTranslationEnd);
translateBtn.addEventListener('touchstart', handleTranslationStart);
translateBtn.addEventListener('touchend', handleTranslationEnd);

// Help Modal
helpBtn.addEventListener('click', () => {
  helpModal.style.display = 'block';
  setTimeout(() => helpModal.classList.add('show'), 10);
});

closeModal.addEventListener('click', () => {
  helpModal.classList.remove('show');
  setTimeout(() => helpModal.style.display = 'none', 300);
});

window.addEventListener('click', (e) => {
  if (e.target === helpModal) {
    helpModal.classList.remove('show');
    setTimeout(() => helpModal.style.display = 'none', 300);
  }
});

// Initialization
populateAlphabet();
