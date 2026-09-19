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
self.addEventListener('activate', (event) => event.waitUntil(clients.claim()));

/* 1️⃣  Handle background message */
messaging.onBackgroundMessage(({ data }) => {
    if (!data) return; // safety check

    self.registration.showNotification(data.title ?? 'New notification', {
        body: data.body ?? '',
        icon: data.icon ?? '/512.png',
        vibrate: [200, 100, 200], // ✅ Vibration pattern
        badge: '/badge.png',       // optional: small badge icon
        data: {
            url: data.link ?? '/',  // used in notificationclick
            dateOfArrival: Date.now()
        }
    });
});

/* 2️⃣  Focus existing tab or open new */
self.addEventListener('notificationclick', event => {
    const url = event.notification?.data?.url ?? '/';
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
