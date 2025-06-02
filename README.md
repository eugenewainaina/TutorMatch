# TutorMatch

TutorMatch is a comprehensive online platform connecting students with tutors. This web application facilitates educational connections, personalized learning experiences, and efficient communication between students, tutors, and parents.

## Features

### User Roles & Profiles
- **Multi-role System**: Support for students, tutors, and parents with role-specific features
- **Detailed Profiles**: Comprehensive profiles showcasing educational background, skills, work experience, certifications, and languages spoken
- **Profile Management**: Easy-to-use interface for viewing and editing profile information

### Connection System
- **Tutor Discovery**: Browse and connect with qualified tutors
- **Connection Management**: Send, accept, and manage connection requests
- **Recommendation Engine**: AI-powered chatbot for personalized tutor recommendations based on learning needs

### Communication
- **Real-time Messaging**: Built-in chat functionality between connected users
- **Notification System**: Firebase-powered push notifications for new messages and connection updates
- **Parent Oversight**: Parents can monitor their children's messaging and lesson activities

### Learning Management
- **Lesson Scheduling**: Organize and manage tutoring sessions
- **Skill-based Pricing**: Transparent pricing structure based on teaching mode (online/physical)
- **Educational Resources**: Share and access learning materials

## Technology Stack

- **Frontend**: React.js with React Router for navigation
- **UI/UX**: Custom CSS with responsive design
- **Authentication**: Session-based authentication system
- **Real-time Communication**: Firebase for notifications
- **Data Management**: RESTful API integration

## Getting Started

### Prerequisites
- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/eugenewainaina/tutormatch-frontend.git
cd 4th_yr_frontend
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm start
```

The application will be available at http://localhost:3000

## Project Structure

- `/src`: Main application code
  - `/Chats`: Chat functionality components
  - `/components`: Reusable UI components
  - `/Connections`: Connection management
  - `/Lessons`: Lesson scheduling and management
  - `/Login`: Authentication
  - `/notifications`: Firebase notification setup
  - `/Parents`: Parent-specific features
  - `/Sign Up`: Registration
  - `/Students`: Student-specific features
  - `/styles`: Global stylesheets
  - `/Tutors`: Tutor-specific features

## API Integration

The frontend communicates with a backend API to manage user data, connections, messages, and lessons. The API endpoints are defined in `config.js`.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- This project was developed as part of a 4th year university project.