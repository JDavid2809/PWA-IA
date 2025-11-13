const CACHE_NAME = "Smart v1";
const ASSETS = [ 
    "./index.html",
    "./manifest.json",
    "./styles.css",
    "./app.js",
    "./icons/icon-192.png",
    "./icons/icon-512.png"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
        return cache.addAll(ASSETS); 
        }).then(() => {
        return self.skipWaiting();
        })
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(
	    caches.keys().then(keys =>
	    Promise.all(
		    keys
		    .filter(key => key !== CACHE_NAME) 
		    .map(key => caches.delete(key)) 
	    )
	)
    );
    self.clients.claim();
});

self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
        return (
            cachedResponse || 
            fetch(event.request).then(networkResponse => {
            return caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, networkResponse.clone()); 
                return networkResponse; 
            });
            })
         );
        })
    );
});