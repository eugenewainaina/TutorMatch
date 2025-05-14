// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";
import { SERVER_URL } from "../config";


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

// Get a reference to the Firebase Service
export const messaging = getMessaging(app);

export let notification_token_sent = false;


// Request permission to send notifications
export const requestFirebaseNotificationPermission = async () => {
    await Notification.requestPermission()
        .then((permission) => {
            // If the user accepts, generate the token
            if (permission === "granted") {
                console.log("Notification permission granted.");

                generateToken()
                    .then((currentToken) => {
                        if (currentToken) {
                            console.log("Current token:", currentToken);

                            // Send the token to the backend
                            sendTokenToBackend(currentToken)
                                .then((response) => {
                                    if (response.ok) {
                                        notification_token_sent = true;
                                        console.log("Token sent successfully to backend:", notification_token_sent);
                                    } else {
                                        notification_token_sent = false;
                                        console.log("Token not sent: ", response);
                                        console.error("generateToken:\nError sending token to backend:", response);
                                    }
                                });
                        } else {
                            console.log("No registration token available. Request permission to generate one.");
                        }
                    })
                    .catch((err) => {
                        console.error("An error occurred while retrieving token. ", err);
                    });

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



// Function to generate a token and send it to the backend
const generateToken = async () => {
    return await getToken(messaging, {
        // TODO: save in a safe place
        vapidKey: "BOurT8b-a1a1TCAD1HnKDpNm38CZKUL90IprywsQKrCkpzJvNnfZd05rw1SUA4FcjYE4J1p4kbx-gqdzklMZ0Ic"
    });

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

        console.log("sendTokenToBackend:\nResponse from backend:", response);

        return response;
    } catch (error) {
        console.log("sendTokenToBackend:\nSent token to backend: ", notification_token_sent);
        console.log("sendTokenToBackend:\nError sending token to backend:", error);

        return error
    }
};