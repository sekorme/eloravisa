/* Import the *compat* SDKs because service-workers can't use ES modules easily.
   Keep this version in lockstep with the `firebase` version in package.json —
   a mismatched major here opens the shared IndexedDB databases with a
   different schema version than the page SDK and throws
   "VersionError: The requested version (N) is less than the existing version (M)". */
importScripts('https://www.gstatic.com/firebasejs/12.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.8.0/firebase-messaging-compat.js');

/* Service workers can't read process.env, so the public client config is
   inlined (same values as NEXT_PUBLIC_FIREBASE_* — they ship in the page
   bundle anyway and are not secrets). */
firebase.initializeApp({
    apiKey: "AIzaSyApPFNSrcGcMQ51_diOVU7shQtjtswNiiI",
    authDomain: "eloravisa-100f2.firebaseapp.com",
    projectId: "eloravisa-100f2",
    storageBucket: "eloravisa-100f2.firebasestorage.app",
    messagingSenderId: "327000978490",
    appId: "1:327000978490:web:d2a69cf511f6872d48f103",
    measurementId: "G-MTJNLY1HGN",
});

const messaging = firebase.messaging();

/* Replace the previously shipped broken worker (old SDK + wrong project)
   as soon as this one installs, instead of waiting for every tab to close. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil((async () => {
    // Lets page loads start on the network while the worker boots, so
    // handling navigations below adds no delay.
    if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable();
    }
    await clients.claim();
})()));

/* 0️⃣  Offline page.
   This worker is registered on every page (components/InstallAppPrompt.tsx)
   so the site is installable as an app. Page loads go straight to the
   network as before; only when that fails (no connection) is this small
   offline page shown instead of the browser's error. Nothing is cached, so
   there's no risk of serving stale pages. Other requests aren't touched. */
const OFFLINE_HTML = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>You're offline · Elora Visa</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0A2720;color:#fff;font:16px/1.5 system-ui,-apple-system,sans-serif;text-align:center;padding:24px;box-sizing:border-box}
h1{font-size:1.5rem;margin:0 0 8px}p{margin:0 0 24px;color:#BFE2D1}
button{font:inherit;font-weight:600;border:0;border-radius:999px;padding:12px 28px;background:#D4AF37;color:#0A2720;cursor:pointer}</style></head>
<body><main><h1>You're offline</h1><p>Elora Visa needs a connection. Check your internet and try again.</p>
<button onclick="location.reload()">Try again</button></main></body></html>`;

self.addEventListener('fetch', (event) => {
    if (event.request.mode !== 'navigate') return;
    event.respondWith((async () => {
        try {
            const preloaded = await event.preloadResponse;
            if (preloaded) return preloaded;
            return await fetch(event.request);
        } catch {
            return new Response(OFFLINE_HTML, {
                status: 503,
                headers: { 'Content-Type': 'text/html; charset=utf-8' },
            });
        }
    })());
});

/* 1️⃣  Background messages.
   Messages with a webpush `notification` (everything lib/push.ts sends) are
   shown by the browser/Firebase itself, with fcmOptions.link opened on tap;
   showing them here too would duplicate them. Data-only messages (older
   senders) are shown here, and the promise is returned so the push event
   waits for it: iOS revokes subscriptions whose pushes show nothing. */
messaging.onBackgroundMessage((payload) => {
    if (payload.notification || !payload.data) return;
    const data = payload.data;
    return self.registration.showNotification(data.title ?? 'Elora Visa', {
        body: data.body ?? '',
        icon: data.icon ?? '/512.png',
        badge: '/512.png',
        vibrate: [200, 100, 200],
        data: { url: data.link ?? '/dashboard', dateOfArrival: Date.now() },
    });
});

/* 2️⃣  Focus existing tab or open new */
self.addEventListener('notificationclick', event => {
    const d = event.notification?.data ?? {};
    const url = d.url ?? d.FCM_MSG?.fcmOptions?.link ?? d.FCM_MSG?.data?.link ?? '/dashboard';
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(clientList => {
                for (const client of clientList) {
                    if (client.url === url && 'focus' in client) {
                        return client.focus();
                    }
                }
                return clients.openWindow(url);
            })
    );
});
