const CACHE_NAME = 'sarg-v1';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Interceptar el POST del Web Share Target
    if (event.request.method === 'POST' && event.request.url.includes('/_share-target')) {
        event.respondWith((async () => {
            try {
                const formData = await event.request.formData();
                const pdfFile = formData.get('pdfFile');
                
                if (pdfFile) {
                    // Guardar el PDF temporalmente en IndexedDB para que App.tsx lo lea
                    await saveSharedFile(pdfFile);
                }
                
                // Redirigir al usuario al pizarrón
                return Response.redirect('/?open=whiteboard', 303);
            } catch (err) {
                console.error("Error procesando Share Target:", err);
                return Response.redirect('/', 303);
            }
        })());
        return;
    }
});

// Función simple para guardar en IndexedDB
function saveSharedFile(file) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('SargSharedFiles', 1);
        
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('files')) {
                db.createObjectStore('files');
            }
        };
        
        request.onsuccess = (e) => {
            const db = e.target.result;
            const tx = db.transaction('files', 'readwrite');
            const store = tx.objectStore('files');
            store.put(file, 'shared-pdf');
            
            tx.oncomplete = () => {
                db.close();
                resolve();
            };
            tx.onerror = () => reject(tx.error);
        };
        
        request.onerror = () => reject(request.error);
    });
}
