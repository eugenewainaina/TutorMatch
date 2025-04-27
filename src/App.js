import logo from './logo.svg';
import './App.css';
import { useEffect } from 'react';
import { messaging, requestFirebaseNotificationPermission } from './notifications/firebase';
import { onMessage } from "firebase/messaging";

function App() {
  useEffect(() => {
    requestFirebaseNotificationPermission();

    onMessage(messaging, (payload) => {
      console.log("Message received. ", payload);

      // show notification
      // const notificationTitle = payload.notification.title;
      // const notificationOptions = {
      //   body: payload.notification.body,
      //   icon: payload.notification.icon,
      // };


      // new Notification(notificationTitle, notificationOptions);
      
    });
  }, []);


  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
