// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";
import { SERVER_URL } from "../config";


// Firebase configuration
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a reference to the Firebase Service
export const messaging = getMessaging(app);

export let notification_token_sent = false;
let tokenRetries = 0;
const MAX_RETRIES = 3;

// Request permission to send notifications
export const requestFirebaseNotificationPermission = async () => {
    try {
        // Check the current permission status first
        const currentPermission = Notification.permission;
        console.log("Current notification permission status:", currentPermission);

        // If already granted, no need to request again
        let permission;
        if (currentPermission === "granted") {
            permission = "granted";
            console.log("Notification permission was already granted.");
        } else {
            // Only request permission if not already granted
            permission = await Notification.requestPermission();
            console.log("Requested permission result:", permission);
            // If permission is granted, generate token
            if (permission === "granted") {
                try {
                    const currentToken = await generateToken();

                    if (currentToken) {
                        console.log("Current token generated:", currentToken);
                        await sendTokenWithRetry(currentToken);
                    } else {
                        console.log("No registration token available. Request permission to generate one.");
                    }
                } catch (err) {
                    console.error("An error occurred while retrieving or sending token:", err);
                }
            } else if (permission === "denied") {
                console.log("Notification permission denied.");
            } else {
                console.log("Notification permission default.");
            }
        }



        return permission;
    } catch (err) {
        console.error("Error requesting notification permission:", err);
        return "error";
    }
};

// Function to generate a token and send it to the backend
const generateToken = async () => {
    try {
        return await getToken(messaging, {
            vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY
        });
    } catch (error) {
        console.error("Error generating Firebase token:", error);
        throw error;
    }
};

// Function with retry logic for sending token to backend
const sendTokenWithRetry = async (token) => {
    tokenRetries = 0;

    const attemptSend = async () => {
        try {
            const response = await sendTokenToBackend(token);

            if (response.ok) {
                notification_token_sent = true;
                tokenRetries = 0;
                console.log("Token sent successfully to backend:", notification_token_sent);
                return true;
            } else {
                throw new Error(`Failed to send token: ${response.status}`);
            }
        } catch (error) {
            tokenRetries++;
            console.log(`Token sending attempt ${tokenRetries} failed:`, error);

            if (tokenRetries < MAX_RETRIES) {
                console.log(`Retrying to send token in ${tokenRetries * 2} seconds...`);
                await new Promise(resolve => setTimeout(resolve, tokenRetries * 2000));
                return attemptSend();
            } else {
                notification_token_sent = false;
                console.error("Max retries reached. Failed to send token to backend.");
                return false;
            }
        }
    };

    return attemptSend();
};

// Function to send the token to the backend
const sendTokenToBackend = async (token) => {
    try {
        const response = await fetch(`${SERVER_URL}/store_notification_token`, {
            method: "POST",
            //mode: "cors",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ notification_token: token }),
        });

        console.log("sendTokenToBackend: Response from backend:", response);

        return response;
    } catch (error) {
        console.log("sendTokenToBackend: Sent token to backend: ", notification_token_sent);
        console.log("sendTokenToBackend: Error sending token to backend:", error);

        return error;
    }
};