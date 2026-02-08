/* Import the *compat* SDKs because service‑workers can’t use ES modules easily */
importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-messaging-compat.js');

/* 
   ⚠️ IMPORTANT: Service Workers do not have access to process.env.
   You must replace the values below with your actual Firebase config strings.
   You can find these in your Firebase Console -> Project Settings.
*/
firebase.initializeApp({
    apiKey: "AIzaSyC96V8BLHOeNakXOnYabJuj2PCYqSwR8bM",
    authDomain: "visaplug-4bf52.firebaseapp.com",
    projectId: "visaplug-4bf52",
    storageBucket: "visaplug-4bf52.firebasestorage.app",
    messagingSenderId: "165881291806",
    appId: "1:165881291806:web:bc9ea3dc02f21f3a753a0f",
    measurementId: "G-M11K918X76",
});

const messaging = firebase.messaging();

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
