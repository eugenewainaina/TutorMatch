# Lessons Module

## API Requirements

### Get Lessons
- **URL**: `${SERVER_URL}/lessons`
- **Method**: GET
- **Authentication**: Uses HTTP-only cookies
- **Response**: Array of lesson objects with participants, date/time, status

### Create Lesson
- **URL**: `${SERVER_URL}/lessons`
- **Method**: POST
- **Request Body**:
  ```json
  {
    "tutor_id": "string",
    "student_id": "string",
    "date": "YYYY-MM-DD",
    "time": "HH:MM",
    "duration": "number",
    "skill": "string",
    "mode": "online|physical",
    "description": "string"
  }
  ```
- **Authentication**: Uses HTTP-only cookies

### Update Lesson Status
- **URL**: `${SERVER_URL}/lessons/:id`
- **Method**: PUT
- **Request Body**:
  ```json
  {
    "status": "scheduled|completed|cancelled",
    "description": "string" // Optional
  }
  ```
- **Authentication**: Uses HTTP-only cookies
