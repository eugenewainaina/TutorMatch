# Parents Module

## API Requirements

### Get Parent Profile
- **URL**: `${SERVER_URL}/profile`
- **Method**: GET
- **Authentication**: Uses HTTP-only cookies for parent accounts
- **Response**: Parent profile data including linked students

### Student Messages
- **URL**: `${SERVER_URL}/student_messages`
- **Method**: GET
- **Authentication**: Uses HTTP-only cookies for parent accounts
- **Response**: Messages between parent's children and tutors

### Student Lessons
- **URL**: `${SERVER_URL}/student_lessons`
- **Method**: GET
- **Authentication**: Uses HTTP-only cookies for parent accounts
- **Response**: Lessons scheduled for parent's children
