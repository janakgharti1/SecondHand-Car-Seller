import React, { useState, useEffect, useRef, useCallback } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, setDoc } from 'firebase/firestore';
import { useLocation } from 'react-router-dom';
import './ContactWithAdmin.css';

const ContactWithAdmin = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isAdminTyping, setIsAdminTyping] = useState(false);
  const [userName, setUserName] = useState('');
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const location = useLocation();
  const hasSentAutoMessageRef = useRef(false);
  const shouldScrollToBottomRef = useRef(false);

  const scrollToBottom = useCallback(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

  // Effect to handle initial scroll after component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom(true); // Force scroll on initial load
    }, 300); // Longer delay to ensure everything is rendered
    
    return () => clearTimeout(timer);
  }, [scrollToBottom]);

  // Effect to handle auto-scrolling when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    let unsubscribeMessages, unsubscribeTyping, unsubscribeUser;

    const setupListeners = async (user) => {
      if (!user) {
        setMessages([]);
        setUserName('');
        return;
      }

      // Set user name
      const userRef = doc(db, 'users', user.uid);
      unsubscribeUser = onSnapshot(userRef, (doc) => {
        if (doc.exists()) setUserName(doc.data().name || user.email);
      }, (error) => console.error('Error fetching user name:', error));

      // Set up messages listener
      const messagesQuery = query(collection(db, 'messages'), orderBy('timestamp'));
      unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
        const allMessages = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        const userMessages = allMessages.filter(
          (msg) =>
            (msg.toAdmin && msg.uid === user.uid) ||
            (msg.fromAdmin && msg.toUserEmail === user.email)
        );
        setMessages(userMessages);

        // Mark messages as read
        userMessages
          .filter((msg) => msg.fromAdmin && msg.toUserEmail === user.email && !msg.read)
          .forEach((msg) =>
            updateDoc(doc(db, 'messages', msg.id), { read: true })
          );
      }, (error) => console.error('Error fetching messages:', error));

      // Set up typing indicator
      const typingRef = doc(db, 'typing', 'admin');
      unsubscribeTyping = onSnapshot(typingRef, (doc) => {
        setIsAdminTyping(doc.exists() && doc.data()?.isTyping);
      }, (error) => console.error('Error fetching typing status:', error));

      // Send auto-message only once
      const autoMessage = location.state?.autoMessage;
      if (autoMessage && !hasSentAutoMessageRef.current) {
        await sendAutoMessage(autoMessage, user);
        hasSentAutoMessageRef.current = true;
      }
    };

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        setupListeners(user);
      }
    });

    // Cleanup
    return () => {
      unsubscribeAuth();
      if (unsubscribeMessages) unsubscribeMessages();
      if (unsubscribeTyping) unsubscribeTyping();
      if (unsubscribeUser) unsubscribeUser();
      hasSentAutoMessageRef.current = false;
    };
  }, [location.state]);

  const sendAutoMessage = async (autoMessage, user) => {
    try {
      shouldScrollToBottomRef.current = true; // Set flag to force scroll after sending
      await addDoc(collection(db, 'messages'), {
        text: autoMessage,
        uid: user.uid,
        email: user.email,
        timestamp: new Date().toISOString(),
        toAdmin: true,
        fromAdmin: false,
        read: false,
        isAutoMessage: true,
      });
    } catch (error) {
      console.error('Error sending auto message:', error);
      alert('Failed to send initial message. Please try again.');
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !auth.currentUser) return;

    try {
      shouldScrollToBottomRef.current = true; // Set flag to force scroll after sending
      await addDoc(collection(db, 'messages'), {
        text: message.trim(),
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        timestamp: new Date().toISOString(),
        toAdmin: true,
        fromAdmin: false,
        read: false,
      });
      setMessage('');
      
      // Force scroll to bottom after message is sent
      setTimeout(() => {
        scrollToBottom(true);
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const handleTyping = async () => {
    if (!auth.currentUser) return;

    const typingRef = doc(db, 'typing', auth.currentUser.uid);
    try {
      await setDoc(typingRef, { isTyping: true }, { merge: true });
      setTimeout(() => setDoc(typingRef, { isTyping: false }, { merge: true }), 2000);
    } catch (error) {
      console.error('Error updating typing status:', error);
    }
  };

  const formatTimestamp = (timestamp) =>
    new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (!auth.currentUser) {
    return (
      <div className="user-chat-container">
        <p>Please sign in to contact the admin.</p>
      </div>
    );
  }

  return (
    <div className="user-chat-container">
      <div className="chat-header">
        <svg
          className="profile-icon"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span>{userName || 'User'}</span>
        {location.state?.carDetails && (
          <span className="car-context">
            {` - Regarding: ${location.state.carDetails.brand} ${location.state.carDetails.name}`}
          </span>
        )}
      </div>

      <div className="messages-container" ref={messagesContainerRef}>
        {messages.length === 0 ? (
          <p className="no-messages">No messages yet. Start the conversation!</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`message ${msg.uid === auth.currentUser.uid ? 'sent' : 'received'} animate-fade-in`}
            >
              <div className="message-content">
                <span className="message-text">{msg.text}</span>
                <div className="message-meta">
                  <span className="timestamp">{formatTimestamp(msg.timestamp)}</span>
                  {msg.read && msg.uid === auth.currentUser.uid && (
                    <span className="read-receipt">✓✓</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        {isAdminTyping && (
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        <input
          type="text"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            handleTyping();
          }}
          placeholder="Type a message..."
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage} aria-label="Send message">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ContactWithAdmin;