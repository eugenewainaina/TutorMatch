# Notifications Module

## API Requirements

### Store Device Token
- **URL**: `${SERVER_URL}/register_device`
- **Method**: POST
- **Request Body**:
  ```json
  {
    "token": "string"
  }
  ```
- **Authentication**: Uses HTTP-only cookies

### Firebase Configuration
- Relies on Firebase initialization with the configuration in `firebase.js`
- Uses Firebase Cloud Messaging for push notifications
