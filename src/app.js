const recordBtn = document.getElementById('record-btn');
const saveBtn = document.getElementById('save-btn');
const noteInput = document.getElementById('note-input');
const noteList = document.getElementById('note-list');

const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'en-US';

if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
    recordBtn.disabled = true;
    alert('Speech Recognition is not supported in this browser.');
}

recordBtn.addEventListener('click', () => {
    recognition.start();
});

recognition.onresult = function (event) {
    const transcript = event.results[0][0].transcript;
    noteInput.value = transcript;
};

saveBtn.addEventListener('click', () => {
    const noteText = noteInput.value.trim();
    if (noteText) {
        const noteElement = document.createElement('p');
        noteElement.textContent = noteText;
        noteList.appendChild(noteElement);
        noteInput.value = '';
    }
});

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js').then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);
    }).catch((error) => {
        console.log('Service Worker registration failed:', error);
    });
}
