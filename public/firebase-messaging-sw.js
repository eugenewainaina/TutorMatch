importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');


// Firebase configuration
firebase.initializeApp({
    apiKey: "AIzaSyDvDU4SzqwjuWbWtDCAIIZkS9f2O7GqKNo",
    authDomain: "n8n-4th-project-v1.firebaseapp.com",
    projectId: "n8n-4th-project-v1",
    storageBucket: "n8n-4th-project-v1.firebasestorage.app",
    messagingSenderId: "264871607587",
    appId: "1:264871607587:web:1197fff4a2e49d9674e096"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log(
        '[firebase-messaging-sw.js] Received background message ',
        payload
    );
    // Customize notification here
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.icon,
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
})