# Sign Up Module

## API Requirements

### Register User
- **URL**: `${SERVER_URL}/sign_up`
- **Method**: POST
- **Request Body**:
  ```json
  {
    "name": "string",
    "phone": "string",
    "email": "string",
    "password": "string",
    "role": "student|tutor|parent",
    "date_of_birth": "YYYY-MM-DD"
  }
  ```
- **Response**: Success message and/or auto-login
- **Redirects**: To appropriate user homepage upon success
