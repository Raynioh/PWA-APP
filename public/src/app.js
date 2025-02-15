const recordBtn = document.getElementById('record-btn');
const saveBtn = document.getElementById('save-btn');
const noteInput = document.getElementById('note-input');
const noteList = document.getElementById('note-list');

// speech recognition
if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
    recordBtn.disabled = true;
    alert('Speech Recognition is not supported in this browser.');
}

if ('Notification' in window && navigator.serviceWorker) {
    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            console.log('Notification permission granted.');
        } else {
            console.log('Notification permission denied.');
        }
    });
}

const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'hr-HR';

recordBtn.addEventListener('click', () => {
    recognition.start();
});

recognition.onresult = function (event) {
    const transcript = event.results[0][0].transcript;
    noteInput.value = transcript;
};

// indexedDB
const dbPromise = indexedDB.open('notes-db', 1);

dbPromise.onupgradeneeded = function(event) {
    const db = event.target.result;
    if (!db.objectStoreNames.contains('notes')) {
        db.createObjectStore('notes', { keyPath: 'id', autoIncrement: true });
    }
};

dbPromise.onsuccess = function(event) {
    const db = event.target.result;
    displayNotes(db);
};

dbPromise.onerror = function(event) {
    console.log('IndexedDB error:', event.target.errorCode);
};

saveBtn.addEventListener('click', () => {
    const noteText = noteInput.value.trim();
    if (noteText) {
        const db = dbPromise.result;
        const transaction = db.transaction(['notes'], 'readwrite');
        const objectStore = transaction.objectStore('notes');
        const note = { text: noteText, timestamp: new Date().toISOString() };
        objectStore.add(note);

        transaction.oncomplete = function() {
            displayNotes(db);
        };

        noteInput.value = '';

        // sync
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
            navigator.serviceWorker.ready.then((registration) => {
                return registration.sync.register('sync-notes');
            }).catch((error) => {
                console.log('Sync registration failed:', error);
            });
        }
    }
});

function displayNotes(db) {
    const transaction = db.transaction(['notes'], 'readonly');
    const objectStore = transaction.objectStore('notes');
    const request = objectStore.getAll();

    request.onsuccess = function(event) {
        const notes = event.target.result;
        noteList.innerHTML = '';
        notes.forEach(note => {
            const noteElement = document.createElement('p');
            noteElement.textContent = note.text;
            noteList.appendChild(noteElement);
        });
    };
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js').then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);
    }).catch((error) => {
        console.log('Service Worker registration failed:', error);
    });
}
