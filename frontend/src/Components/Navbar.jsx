import React, { useState, useEffect } from "react";
import "../App.css";
import { Link, useNavigate } from "react-router-dom";
import myImage from '../Assests/profile.png';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';

const Navbar = () => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  const [userRole, setUserRole] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  const isAuthenticated = !!localStorage.getItem("authToken");

  const handleUserImageClick = () => {
    if (userRole === "Admin") {
      navigate("/admindashboard");
    } else if (userRole === "User") {
      navigate("/userdashboard");
    }
  };

  useEffect(() => {
    let unsubscribeMessages;
    let unsubscribeUser;

    const setupListeners = (user) => {
      if (!user) {
        setUnreadCount(0);
        setUserRole(null);
        setIsAuthLoaded(true);
        return;
      }

      const userRef = doc(db, 'users', user.uid);
      unsubscribeUser = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setUserRole(userData.role || "User");
        } else {
          setUserRole("User");
        }
      }, (error) => {
        console.error("Error fetching user role:", error);
        setUserRole("User");
      });

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

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setupListeners(user);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeMessages) unsubscribeMessages();
      if (unsubscribeUser) unsubscribeUser();
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
        {isAuthenticated && (
          <img 
            src={myImage} 
            alt="User Profile" 
            onClick={handleUserImageClick} 
            style={{ cursor: "pointer" }}
          />
        )}
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