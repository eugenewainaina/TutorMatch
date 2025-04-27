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

export const requestFirebaseNotificationPermission = async () => {
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


// Mock backend endpoint
const mockApiEndpoint = async (token) => {
    // Simulate an API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log("Mock API endpoint received token:", token);
    return { success: true, message: "Token received successfully" };
};

// Placeholder for sending the token to your backend
const sendTokenToBackend = async (token) => {
    try {
        const response = await mockApiEndpoint(token);
        if (response.success) {
            console.log("Token sent to backend successfully");
        } else {
            console.error("Failed to send token to backend:", response.message);
        }
    } catch (error) {
        console.error("Error sending token to backend:", error);
    }
};

export const sendMessageToToken = async (token, message) => {
    const messagePayload = {
        "message": {
            "token": token,
            "notification": {
                "title": "New Message",
                "body": message
            }
        }
    };

    try {
        const response = await fetch("https://fcm.googleapis.com/v1/projects/myproject-b5ae1/messages:send", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: "Bearer AAAA46v3n5w:APA91bH3W-U7fG9c4U3EwzUo9qUqD2y8746QJp7c4vX4x1k2q56tU91t6_g9kXl9T_K1w54z-r5x0r0-d8e0sQ17u8p1G" },
            body: JSON.stringify(messagePayload),
        });
        return response;
    } catch (error) {
        return error
    }
};

const generateToken = async () => {
    await getToken(messaging, {
        vapidKey: "BOurT8b-a1a1TCAD1HnKDpNm38CZKUL90IprywsQKrCkpzJvNnfZd05rw1SUA4FcjYE4J1p4kbx-gqdzklMZ0Ic"
    })
        .then((currentToken) => {
            if (currentToken) {
                console.log("Current token:", currentToken);

                // Send the token to your backend
                sendTokenToBackend(currentToken);
            } else {
                console.log("No registration token available. Request permission to generate one.");
            }
        })
        .catch((err) => {
            console.log("An error occurred while retrieving token. ", err);
        });

};