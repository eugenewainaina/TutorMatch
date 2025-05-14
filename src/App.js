import './App.css';
import { useEffect } from 'react';
import { messaging } from './notifications/firebase';
import { onMessage } from "firebase/messaging";
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginForm from './Login/Login';
import SignUp from './Sign Up/Signup';
import RecommendationChatbot from './Students/RecommendationChatbot';
import UserProfile from './Profile';
import TutorProfile from './Tutors/TutorProfile';
import NotFound from './components/NotFound';





// Now I would like to create a chat screen

// when the page loads,
//   when a message is sent, it should be in this JSON request body

// {
//   "message": "message value",
//     "recepient_id": "recipient id"
// }





// TODO: make file with all route strings

function App() {
  useEffect(() => {
    // requestFirebaseNotificationPermission()



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

        <Route path="/tutor_homepage" element={<UserProfile />} />
        <Route path="/student_homepage" element={<UserProfile />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/recommendation-chatbot" element={<RecommendationChatbot />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/tutors/profile/:id" element={<TutorProfile />} />
      </Routes>
    </Router>
  );
}

export default App;
