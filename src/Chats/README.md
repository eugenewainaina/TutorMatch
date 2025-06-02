# Chats Module

## API Requirements

### Get User Chats
- **URL**: `${SERVER_URL}/chats`
- **Method**: GET
- **Authentication**: Uses HTTP-only cookies
- **Response**: Array of chat objects with participants, last message, and timestamps

### Get Chat Messages
- **URL**: `${SERVER_URL}/chats/:id`
- **Method**: GET
- **Authentication**: Uses HTTP-only cookies
- **Response**: Chat details and array of message objects with sender, content, and timestamps

### Send Message
- **URL**: `${SERVER_URL}/chats/:id/messages`
- **Method**: POST
- **Request Body**:
  ```json
  {
    "message": "string"
  }
  ```
- **Authentication**: Uses HTTP-only cookies
- **Response**: Sent message details
