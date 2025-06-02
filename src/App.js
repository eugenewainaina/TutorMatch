import './App.css';
import { useEffect } from 'react';
import { messaging, requestFirebaseNotificationPermission } from './notifications/firebase';
import { onMessage } from "firebase/messaging";
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import LoginForm from './Login/Login';
import SignUp from './Sign Up/Signup';
import RecommendationChatbot from './Students/RecommendationChatbot';
import UserProfile from './Profile';
import TutorProfile from './Tutors/TutorProfile';
import StudentProfile from './Students/StudentProfile';
import ParentProfile from './Parents/ParentProfile';
import StudentMessages from './Parents/StudentMessages';
import StudentLessons from './Parents/StudentLessons';
import NotFound from './components/NotFound';
import Chats from './Chats/Chats';
import ChatScreen from './Chats/ChatScreen';
import Lessons from './Lessons/Lessons';
import Connections from './Connections/Connections';
import Navbar from './components/Navbar';


// TODO: make file with all route strings

// Layout component to conditionally render the Navbar
const Layout = ({ children }) => {
  const location = useLocation();
  const path = location.pathname;
  
  // Don't show navbar on login, signup, lessons, connections, or not found pages
  const hideNavbar = path === '/login' || 
                    path === '/signup' || 
                    path.match(/^\/(?!\w)/);
  
  return (
    <>
      {!hideNavbar && <Navbar />}
      {children}
    </>
  );
};

function App() {
  useEffect(() => {
    // Request notification permissions when the app loads
    // Login, Signup and ChatScreen components will also request permissions
    requestFirebaseNotificationPermission()
      .then((permission) => {
        console.log("App: Firebase notification permission status:", permission);
      })
      .catch(err => {
        console.error("App: Error requesting notification permission:", err);
      });

    onMessage(messaging, (payload) => {
      console.log("Message received. ", payload);

      // show notification
      const notificationTitle = payload.notification.title;
      const notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.icon,
      };

      new Notification(notificationTitle, notificationOptions);
    });

  }, []);


  return (
    <Router>
      <Routes>
        <Route path="/*" element={<NotFound />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignUp />} />
        
        <Route path="/tutor_homepage" element={<Layout><UserProfile /></Layout>} />
        <Route path="/student_homepage" element={<Layout><UserProfile /></Layout>} />
        <Route path="/parent_homepage" element={<Layout><ParentProfile /></Layout>} />
        <Route path="/recommendation-chatbot" element={<Layout><RecommendationChatbot /></Layout>} />
        <Route path="/profile" element={<Layout><UserProfile /></Layout>} />
        <Route path="/parent/profile" element={<Layout><ParentProfile /></Layout>} />
        <Route path="/parent/student_messages" element={<Layout><StudentMessages /></Layout>} />
        <Route path="/parent/student_lessons" element={<Layout><StudentLessons /></Layout>} />
        <Route path="/tutors/profile/:id" element={<Layout><TutorProfile /></Layout>} />
        <Route path="/students/profile/:id" element={<Layout><StudentProfile /></Layout>} />
        <Route path="/connections" element={<Layout><Connections /></Layout>} />
        <Route path="/chats" element={<Layout><Chats /></Layout>} />
        <Route path="/chats/:id" element={<Layout><ChatScreen /></Layout>} />
        <Route path="/lessons" element={<Layout><Lessons /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;
