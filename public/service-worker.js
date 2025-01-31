const CACHE_NAME = "notes-app-cache";
const URLS_TO_CACHE = [
  "/",
  "/index.html",
  "/notfound.html",
  "/assets/styles.css",
  "/src/app.js",
  "/assets/manifest.json",
  "/assets/notepad256.png",
  "/assets/notepad512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});

self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener("sync", (event) => {
  if (event.tag === "sync-notes") {
    event.waitUntil(syncNotes(() => console.log("Synchronizing!")));
  }
});

function syncNotes() {
  return new Promise((resolve, reject) => {
    const dbRequest = indexedDB.open("notes-db", 1);

    dbRequest.onsuccess = function (event) {
      const db = event.target.result;
      const transaction = db.transaction(["notes"], "readonly");
      const objectStore = transaction.objectStore("notes");
      const request = objectStore.getAll();

      request.onsuccess = function (event) {
        const notes = event.target.result;
        console.log(notes);
        // glumi slanje podataka na neki backend
        new Promise((r) => setTimeout(r, 2000))
          .then((response) => {
            resolve();
          })
          .then(() => {
            self.registration.showNotification("Notes Sync", {
              body: "Notes have been successfully synced!",
              icon: "/assets/notepad256.png",
            });
          })
          .catch((error) => {
            reject(error);
          });
      };

      request.onerror = function (event) {
        console.log("Request error:", event.target.errorCode);
        reject(event.target.errorCode);
      };
    };

    dbRequest.onerror = function (event) {
      console.log("IndexedDB error:", event.target.errorCode);
      reject(event.target.errorCode);
    };
  });
}
