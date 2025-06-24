# TutorMatch

An AI-Powered Web Platform Connecting Students with Qualified Tutors.
TutorMatch is a web-based platform designed to connect students with qualified tutors through intelligent recommendations, secure communication, and structured lesson scheduling. Built with a strong focus on the Kenyan context, the platform integrates M-Pesa payments, Google Calendar scheduling, email reminders, real-time messaging with AI-powered moderation, and parent-student monitoring features to ensure safe and efficient learning.

The tutor recommendation engine leverages a Large Language Model (LLM) which uses Retrieval Augmented Generation (RAG) to match learners with tutors based on subject, availability, language, pricing, and preferences. A Chat Moderation Model is used to enhance child-safety and ensure safe communication between Tutors and Students. The entire backend logic is orchestrated using n8n, JavaScript, Python, and PostgreSQL and containerized with Docker.

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
- **Real-time Messaging**: Built-in chat functionality between connected users with AI moderation for chats with minors
- **Notification System**: Firebase-powered push notifications for new messages and connection updates
- **Parent Oversight**: Parents can monitor their children's messaging and lesson activities

### Learning Management
- **Lesson Scheduling**: Organize and manage tutoring sessions
- **Skill-based Pricing**: Transparent pricing structure based on teaching mode (online/physical)
- **Educational Resources**: Share and access learning materials


## Project Structure

- `/src`: Main application code
  - `/styles`: Global stylesheets
  - `/Login`: Authentication
  - `/Sign Up`: Registration
  - `/notifications`: Firebase notification setup
  - `/Chats`: Chat functionality components
  - `/components`: Reusable UI components
  - `/Connections`: Connection management
  - `/Lessons`: Lesson scheduling and management
  - `/Parents`: Parent-specific features
  - `/Tutors`: Tutor-specific features
  - `/Students`: Student-specific features

- `config.js` has the root API endpoint defined


## Features in Development

The following features are still in progress or under active development:

### Parent Module
- Parent-Student Account Connection is still under development

### Payment System
- Future versions will include other payment methods like Visa and other mobile providers.

### Service Contracts
- Service contract feature is still pending implementation
- This will allow formal agreements between students/parents and tutors about services rendered and payment 

### Technical Improvements
- Real-time notifications are currently experiencing some bugs
- Performance optimizations are ongoing

