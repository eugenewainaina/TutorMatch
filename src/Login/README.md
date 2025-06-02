# Login Module

## API Requirements

### Login Endpoint
- **URL**: `${SERVER_URL}/login`
- **Method**: POST
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response**: JWT token set as HTTP-only cookie
- **Redirects**: Based on user role to appropriate homepage

### Session Validation
- **URL**: `${SERVER_URL}/validate_session`
- **Method**: GET
- **Authentication**: Uses HTTP-only cookies
- **Response**: User role and authentication status
