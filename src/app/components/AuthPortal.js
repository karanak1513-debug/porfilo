"use client";
import React, { useState } from "react";
import { auth } from "../../lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut
} from "firebase/auth";

export default function AuthPortal({ user, onAuthChange }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState({ text: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);

  const showFeedback = (text, type) => {
    setFeedback({ text, type });
  };

  const clearFeedback = () => {
    setFeedback({ text: "", type: "" });
  };



  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    clearFeedback();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      showFeedback("Successfully signed in!", "success");
    } catch (error) {
      showFeedback(formatAuthError(error.code), "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    if (password.length < 6) {
      showFeedback("Password must be at least 6 characters.", "error");
      return;
    }
    setIsLoading(true);
    clearFeedback();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      showFeedback("Account created successfully!", "success");
    } catch (error) {
      showFeedback(formatAuthError(error.code), "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    clearFeedback();
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      showFeedback("Successfully signed in with Google!", "success");
    } catch (error) {
      if (error.code === "auth/unauthorized-domain") {
        showFeedback("Authorized Domain configuration needed. Add your current domain to Firebase console.", "error");
      } else {
        showFeedback(formatAuthError(error.code), "error");
      }
    } finally {
      setIsLoading(false);
    }
  };



  const handleSignOut = async () => {
    try {
      await signOut(auth);
      showFeedback("Successfully signed out.", "success");
    } catch (error) {
      showFeedback("Failed to sign out.", "error");
    }
  };

  const formatAuthError = (code) => {
    switch (code) {
      case "auth/invalid-email":
        return "Invalid email address format.";
      case "auth/user-disabled":
        return "This user account has been disabled.";
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "Incorrect email or password.";
      case "auth/email-already-in-use":
        return "An account already exists with this email.";
      case "auth/weak-password":
        return "Password must be at least 6 characters.";
      default:
        return "Authentication error occurred. Please try again.";
    }
  };

  return (
    <div className="auth-card glass-card">
      {!user ? (
        <div id="auth-signed-out-state">
          <h3 className="auth-card-title">Access Interactive Features</h3>
          
          <div id="panel-email" className="auth-panel" style={{ marginTop: "20px" }}>
            <form id="email-auth-form">
              <div className="form-group">
                <label htmlFor="auth-email">Email Address</label>
                <input 
                  type="email" 
                  id="auth-email" 
                  placeholder="client@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="auth-password">Password</label>
                <input 
                  type="password" 
                  id="auth-password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
              <div className="auth-action-row">
                <button 
                  type="submit" 
                  id="btn-email-signin" 
                  className="btn btn-primary"
                  onClick={handleEmailSignIn}
                  disabled={isLoading}
                >
                  <span>{isLoading ? "Signing In..." : "Sign In"}</span>
                </button>
                <button 
                  type="button" 
                  id="btn-email-signup" 
                  className="btn btn-secondary"
                  onClick={handleEmailSignUp}
                  disabled={isLoading}
                >
                  <span>Create Account</span>
                </button>
              </div>
            </form>
          </div>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <button 
            id="btn-google-signin" 
            className="btn btn-secondary btn-google"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <i className="fa-brands fa-google"></i> <span>Sign In with Google</span>
          </button>
        </div>
      ) : (
        <div id="auth-signed-in-state">
          <h3 className="auth-card-title">Welcome Back</h3>
          <div className="user-profile">
            <div className="user-avatar-container">
              <img 
                id="user-avatar" 
                src={user.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150"} 
                alt="User Avatar" 
              />
            </div>
            <div className="user-meta">
              <h4 id="user-name">{user.displayName || user.email?.split("@")[0] || user.phoneNumber || "Client Member"}</h4>
              <p id="user-info">{user.email || user.phoneNumber || "No contact info"}</p>
            </div>
          </div>
          <div className="auth-action-row" style={{ marginTop: "15px" }}>
            {user.email === "karanak1513@gmail.com" && (
              <a href="#admin-dashboard" id="btn-goto-admin" className="btn btn-primary">
                <i className="fa-solid fa-gauge"></i> <span>Admin Panel</span>
              </a>
            )}
            <button id="btn-signout" className="btn btn-secondary" onClick={handleSignOut}>
              <i className="fa-solid fa-arrow-right-from-bracket"></i> <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {feedback.text && (
        <div className={`auth-feedback ${feedback.type}`}>
          {feedback.text}
        </div>
      )}
    </div>
  );
}
