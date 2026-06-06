"use client";
import React, { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";

export default function Guestbook({ user }) {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState({ text: "", type: "" });
  const [isFeedLoading, setIsFeedLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "guestbook"), orderBy("timestamp", "desc"), limit(15));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = [];
      snapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() });
      });
      setMessages(msgs);
      setIsFeedLoading(false);
    }, (error) => {
      console.error("Firestore loading error:", error);
      setIsFeedLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    if (!user) {
      setFeedbackMsg({ text: "You must be logged in to post.", type: "error" });
      return;
    }

    setIsLoading(true);
    setFeedbackMsg({ text: "", type: "" });

    try {
      await addDoc(collection(db, "guestbook"), {
        message: messageText.trim(),
        userId: user.uid,
        userName: user.displayName || user.email?.split("@")[0] || user.phoneNumber || "Anonymous Client",
        userPhoto: user.photoURL || null,
        timestamp: serverTimestamp()
      });
      setMessageText("");
      setFeedbackMsg({ text: "Feedback posted successfully!", type: "success" });
    } catch (error) {
      console.error("Error creating post:", error);
      setFeedbackMsg({ text: "Error posting message. Please check permissions.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Just now";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="guestbook-card glass-card">
      <h3>Client Feedback Wall</h3>
      <p className="section-desc-light">Leave a review or comment on this live database board. (Sign in required)</p>
      
      <div id="messages-container" className="messages-list">
        {isFeedLoading ? (
          <div className="message-loading"><i className="fa-solid fa-circle-notch fa-spin"></i> Loading posts...</div>
        ) : messages.length === 0 ? (
          <div className="message-empty">No reviews posted yet. Be the first!</div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="message-item glass-card">
              <div className="msg-avatar-container">
                <img 
                  src={msg.userPhoto || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80"} 
                  alt={msg.userName} 
                />
              </div>
              <div className="msg-content">
                <div className="msg-header">
                  <span className="msg-author">{msg.userName}</span>
                  <span className="msg-date">{formatTimestamp(msg.timestamp)}</span>
                </div>
                <p className="msg-body">{msg.message}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {user ? (
        <form id="guestbook-form" className="guestbook-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <textarea 
              id="guestbook-message" 
              rows="3" 
              placeholder="Write a message or leave some feedback..." 
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              required
            ></textarea>
          </div>
          <button type="submit" className="btn btn-primary btn-post" disabled={isLoading}>
            <span>{isLoading ? "Posting..." : "Post Feedback"}</span> <i className="fa-solid fa-paper-plane"></i>
          </button>
        </form>
      ) : (
        <div id="guestbook-feedback-auth-notice" className="auth-notice">
          <p><i className="fa-solid fa-lock"></i> Please sign in to write a message.</p>
        </div>
      )}

      {feedbackMsg.text && (
        <div className={`auth-feedback ${feedbackMsg.type}`} style={{ marginTop: "10px" }}>
          {feedbackMsg.text}
        </div>
      )}
    </div>
  );
}
