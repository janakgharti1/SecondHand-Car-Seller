import React, { useState, useEffect } from "react";
import "../App.css";
import { Link, useNavigate } from "react-router-dom";
import myImage from '../Assests/profile.png';
import { db, auth } from '../firebase'; // Make sure to import these
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const Navbar = () => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  const isAuthenticated = !!localStorage.getItem("authToken");

  // Effect to listen for unread messages
  useEffect(() => {
    let unsubscribeMessages;
    
    const setupMessageListener = (user) => {
      if (!user) {
        setUnreadCount(0);
        setIsAuthLoaded(true);
        return;
      }

      // Query for messages sent to this user that are unread
      const messagesQuery = query(
        collection(db, 'messages'),
        where('toUserEmail', '==', user.email),
        where('fromAdmin', '==', true),
        where('read', '==', false)
      );

      unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
        setUnreadCount(snapshot.docs.length);
      }, (error) => {
        console.error("Error fetching unread messages:", error);
        setUnreadCount(0);
      });

      setIsAuthLoaded(true);
    };

    // Listen for auth state changes
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setupMessageListener(user);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeMessages) unsubscribeMessages();
    };
  }, []);

  return (
    <div id="nav">
      <div id="left">
        <h3>SHCS</h3>
      </div>
      <div id="mid">
        <Link to="/">Home</Link>
        <Link to="/usedcar">Explore Car</Link>
        <Link to="/sellcar">Sell Car</Link>
        <Link to="/comparecar">Compare Car</Link>
        <Link to="/carauction">Auction</Link>
        <Link to="/contactwithadmin" className="chat-link">
          My Chat
          {isAuthLoaded && unreadCount > 0 && (
            <span className="unread-badge">{unreadCount}</span>
          )}
        </Link>
      </div>
      <div id="right">
        {isAuthenticated && <Link to="/userdashboard"><img src={myImage} alt="Logo"/></Link>}
        {isAuthenticated ? (
          <button id="logoutbtn" onClick={handleLogout}>Logout</button>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;