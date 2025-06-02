# Students Module

## API Requirements

### Get Student Profile
- **URL**: `${SERVER_URL}/students/:id`
- **Method**: GET
- **Authentication**: Uses HTTP-only cookies
- **Response**: Student profile data including education and learning preferences

### Recommendation Chatbot
- **URL**: `${SERVER_URL}/chatbot`
- **Method**: POST
- **Request Body**:
  ```json
  {
    "chatInput": "string",
    "action": "sendMessage",
    "sessionId": "string"
  }
  ```
- **Authentication**: Uses HTTP-only cookies
- **Response**: Structured message response with tutor recommendations
