# Connections Module

## API Requirements

### Get Connections
- **URL**: `${SERVER_URL}/connections`
- **Method**: GET
- **Authentication**: Uses HTTP-only cookies
- **Response**: Arrays of connections, pending requests, and received requests

### Send Connection Request
- **URL**: `${SERVER_URL}/connection_request`
- **Method**: POST
- **Request Body**:
  ```json
  {
    "recipient_id": "string"
  }
  ```
- **Authentication**: Uses HTTP-only cookies

### Accept/Reject Connection
- **URL**: `${SERVER_URL}/connection_response`
- **Method**: POST
- **Request Body**:
  ```json
  {
    "connection_id": "string",
    "action": "accept|reject"
  }
  ```
- **Authentication**: Uses HTTP-only cookies
