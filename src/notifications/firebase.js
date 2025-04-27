// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";


// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDvDU4SzqwjuWbWtDCAIIZkS9f2O7GqKNo",
    authDomain: "n8n-4th-project-v1.firebaseapp.com",
    projectId: "n8n-4th-project-v1",
    storageBucket: "n8n-4th-project-v1.firebasestorage.app",
    messagingSenderId: "264871607587",
    appId: "1:264871607587:web:1197fff4a2e49d9674e096"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
export const messaging = getMessaging(app);

export  const requestFirebaseNotificationPermission = async () => {
    await Notification.requestPermission()
        .then((permission) => {
            if (permission === "granted") {
                console.log("Notification permission granted.");
                // Generate a token
                generateToken();
            } else if (permission === "denied") {
                console.log("Notification permission denied.");
            } else {
                console.log("Notification permission default.");
            }
            return permission;
        }
        )
        .catch((err) => {
            console.log("Error requesting notification permission:", err);
        }
        );



};

const generateToken = async () => {
    await getToken(messaging, {
        vapidKey: "BOurT8b-a1a1TCAD1HnKDpNm38CZKUL90IprywsQKrCkpzJvNnfZd05rw1SUA4FcjYE4J1p4kbx-gqdzklMZ0Ic"
    })
        .then((currentToken) => {
            if (currentToken) {
                console.log("Current token:", currentToken);
                
                // Perform any action with the token, like sending it to your server
            } else {
                console.log("No registration token available. Request permission to generate one.");
            }
        })
        .catch((err) => {
            console.log("An error occurred while retrieving token. ", err);
        });

};