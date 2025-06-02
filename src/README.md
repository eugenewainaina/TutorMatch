# Root Source Directory

## Main Components

### App.js
- Entry point for the application
- Sets up routing and Firebase notification handling
- No direct API calls, but initializes Firebase messaging

### Profile.jsx
- **URL**: `${SERVER_URL}/profile`
- **Method**: GET
- **Authentication**: Uses HTTP-only cookies
- **Response**: User profile data based on role (tutor, student, parent)
- Displays different profile layouts based on user role
