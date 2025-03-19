import React, { useState, useEffect, useRef, useCallback } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, setDoc, deleteDoc } from 'firebase/firestore';
import './ContactWithUser.css';

const ContactWithUser = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [selectedUserEmail, setSelectedUserEmail] = useState(null);
  const [users, setUsers] = useState([]);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    let unsubscribeAuth, unsubscribeMessages, unsubscribeTyping, unsubscribeUsers;

    const setupSubscriptions = (currentUser) => {
      if (!currentUser) {
        console.log('No user signed in');
        return;
      }

      const messagesQuery = query(collection(db, 'messages'), orderBy('timestamp'));
      unsubscribeMessages = onSnapshot(messagesQuery, async (snapshot) => {
        const allMessages = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setMessages(allMessages);
        scrollToBottom();

        const uniqueEmails = [...new Set(allMessages.filter((msg) => msg.toAdmin).map((msg) => msg.email))];
        const usersQuery = collection(db, 'users');
        unsubscribeUsers = onSnapshot(usersQuery, (userSnap) => {
          const userData = userSnap.docs.map((doc) => ({ email: doc.data().email, name: doc.data().name }));
          const filteredUsers = userData.filter((user) => uniqueEmails.includes(user.email));

          const usersWithDetails = filteredUsers.map((user) => {
            const userMessages = allMessages.filter(
              (msg) =>
                (msg.toAdmin && msg.email === user.email) ||
                (msg.fromAdmin && msg.toUserEmail === user.email)
            );
            const unreadCount = userMessages.filter((msg) => msg.toAdmin && !msg.read).length;
            const lastMessage = userMessages[userMessages.length - 1];
            return {
              ...user,
              unreadCount,
              lastMessage: lastMessage?.text || '',
              lastTimestamp: lastMessage?.timestamp || '',
            };
          });
          setUsers(usersWithDetails);
        }, (error) => console.error('Error fetching users:', error));

        if (selectedUserEmail) {
          const unreadMessages = allMessages.filter(
            (msg) => msg.email === selectedUserEmail && msg.toAdmin && !msg.read
          );
          unreadMessages.forEach((msg) => updateDoc(doc(db, 'messages', msg.id), { read: true }));
          const typingRef = doc(db, 'typing', selectedUserEmail.split('@')[0]);
          unsubscribeTyping = onSnapshot(typingRef, (doc) => {
            setIsUserTyping(doc.exists() && doc.data()?.isTyping);
          }, (error) => console.error('Error fetching typing status:', error));
        }
      }, (error) => console.error('Error fetching messages:', error));
    };

    unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setupSubscriptions(user);
    });

    return () => {
      unsubscribeAuth?.();
      unsubscribeMessages?.();
      unsubscribeUsers?.();
      unsubscribeTyping?.();
    };
  }, [selectedUserEmail, scrollToBottom]); // Added scrollToBottom to dependency array

  const sendMessage = async () => {
    if (!message.trim() || !auth.currentUser || !selectedUserEmail) return;

    try {
      await addDoc(collection(db, 'messages'), {
        text: message.trim(),
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        timestamp: new Date().toISOString(),
        toAdmin: false,
        fromAdmin: true,
        toUserEmail: selectedUserEmail,
        read: false,
      });
      setMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      await deleteDoc(doc(db, 'messages', messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message.');
    }
  };

  const handleTyping = async () => {
    if (!auth.currentUser) return;
    const typingRef = doc(db, 'typing', 'admin');
    try {
      await setDoc(typingRef, { isTyping: true }, { merge: true });
      setTimeout(() => setDoc(typingRef, { isTyping: false }, { merge: true }), 2000);
    } catch (error) {
      console.error('Error updating typing status:', error);
    }
  };

  const formatTimestamp = (timestamp) =>
    timestamp
      ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '';

  const getUserName = (email) => users.find((user) => user.email === email)?.name || email;

  return (
    <div className="messenger-container">
      <div className="sidebar">
        <h2>Contact Users</h2>
        {users.length === 0 ? (
          <p>No users available</p>
        ) : (
          users.map((user) => (
            <div
              key={user.email}
              className={`contact ${selectedUserEmail === user.email ? 'active' : ''}`}
              onClick={() => setSelectedUserEmail(user.email)}
            >
              <div className="profile-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
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
              </div>
              <div className="contact-info">
                <p className="contact-name">{user.name}</p>
                <div className="last-message">
                  {user.lastMessage && (
                    <>
                      <span className="last-message-text">{user.lastMessage}</span>
                      <span className="last-message-time">{formatTimestamp(user.lastTimestamp)}</span>
                    </>
                  )}
                  {user.unreadCount > 0 && (
                    <span className="unread-count">{user.unreadCount}</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="chat-area">
        <div className="chat-header">
          <h3>{selectedUserEmail ? `${getUserName(selectedUserEmail)}` : ''}</h3>
          <span>Admin</span>
        </div>

        <div className="messages-container">
          {selectedUserEmail ? (
            messages
              .filter(
                (msg) =>
                  (msg.toAdmin && msg.email === selectedUserEmail) ||
                  (msg.fromAdmin && msg.toUserEmail === selectedUserEmail)
              )
              .map((msg) => (
                <div
                  key={msg.id}
                  className={`message ${msg.uid === auth.currentUser?.uid ? 'sent' : 'received'} animate-fade-in`}
                >
                  <div className="message-content">
                    <span className="message-text">{msg.text}</span>
                    <div className="message-meta">
                      <span className="timestamp">{formatTimestamp(msg.timestamp)}</span>
                      {msg.read && msg.uid === auth.currentUser?.uid && (
                        <span className="read-receipt">✓✓</span>
                      )}
                      <button className="delete-btn" onClick={() => deleteMessage(msg.id)}>
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))
          ) : (
            <p className="no-selection">Please select a user to start chatting.</p>
          )}
          {isUserTyping && selectedUserEmail && (
            <div className="typing-indicator">
              <span></span><span></span><span></span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {selectedUserEmail && (
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
        )}
      </div>
    </div>
  );
};

export default ContactWithUser;