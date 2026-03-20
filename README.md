# MorseCode v2 | Tactile Input Tool

A production-ready, ultra-lightweight Morse code input and translation app.

## ✨ New in v2
- **Advanced Timing**: Support for letter separators (500ms) and word separators (1200ms).
- **Tactile Feedback**: Subtle beep sound via Web Audio API and vibration support.
- **Improved UX**: The guide is now directly accessible from the text area.
- **Robust Translation**: Hold the ↔ button to translate entire sentences (supports A-Z, 0-9, and spaces).
- **Responsive v2**: Better support for various viewports using `min()`, `clamp()`, and `dvh`.

## 🕹️ Controls
- **🔴 Red Pad**: 
    - **Tap**: Dot (`•`)
    - **Hold (>200ms)**: Dash (`-`)
    - **Pause (500ms)**: Character Gap
    - **Pause (1200ms)**: Word Gap (` / `)
- **Book (📘)**: Opens the Morse reference guide.
- **↔ (Hold)**: Peek at the English translation.
- **📋 Copy**: Copies current content to clipboard.

## 🚀 Deployment
This app is ready for **GitHub Pages**:
1. Push `index.html`, `style.css`, and `script.js` to a GitHub repository.
2. Enable Pages in **Settings > Pages > Branch: main**.

## License
MIT
