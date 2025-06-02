# Tutors Module

## API Requirements

### Get Tutor Profile
- **URL**: `${SERVER_URL}/tutors/:id`
- **Method**: GET
- **Authentication**: Uses HTTP-only cookies
- **Response**: Tutor profile including:
  - Personal details
  - Skills with pricing
  - Education history
  - Work experience
  - Certifications
  - Overall rating

### Update Tutor Profile
- **URL**: `${SERVER_URL}/profile`
- **Method**: PUT
- **Authentication**: Uses HTTP-only cookies
- **Request Body**: FormData with tutor profile fields and optional profile image
