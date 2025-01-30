// Variables
const recordBtn = document.getElementById('record-btn');
const saveBtn = document.getElementById('save-btn');
const noteInput = document.getElementById('note-input');
const noteList = document.getElementById('note-list');

// Speech Recognition setup
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'en-US';

// Check if Speech Recognition is available
if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
    recordBtn.disabled = true;
    alert('Speech Recognition is not supported in this browser.');
}

// Start speech recognition when the button is clicked
recordBtn.addEventListener('click', () => {
    recognition.start();
});

// Handle speech recognition results
recognition.onresult = function (event) {
    const transcript = event.results[0][0].transcript;
    noteInput.value = transcript; // Put the transcript in the input field
};

// Save the note when the save button is clicked
saveBtn.addEventListener('click', () => {
    const noteText = noteInput.value.trim();
    if (noteText) {
        const noteElement = document.createElement('p');
        noteElement.textContent = noteText;
        noteList.appendChild(noteElement);
        noteInput.value = ''; // Clear the input after saving
    }
});

// Simple offline caching with Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js').then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);
    }).catch((error) => {
        console.log('Service Worker registration failed:', error);
    });
}
