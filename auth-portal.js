// Firebase Client Portal Module
import { 
    auth, 
    db, 
    GoogleAuthProvider, 
    RecaptchaVerifier, 
    signInWithPhoneNumber 
} from "./firebase-config.js";

import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signInWithPopup,
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import { 
    collection, 
    addDoc, 
    query, 
    orderBy, 
    limit, 
    onSnapshot,
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    // UI Elements
    const tabEmail = document.getElementById("tab-email");
    const tabPhone = document.getElementById("tab-phone");
    const panelEmail = document.getElementById("panel-email");
    const panelPhone = document.getElementById("panel-phone");

    const emailAuthForm = document.getElementById("email-auth-form");
    const phoneAuthForm = document.getElementById("phone-auth-form");
    const phoneCodeForm = document.getElementById("phone-code-form");
    const btnGoogleSignIn = document.getElementById("btn-google-signin");

    const signedOutState = document.getElementById("auth-signed-out-state");
    const signedInState = document.getElementById("auth-signed-in-state");
    const btnSignOut = document.getElementById("btn-signout");
    const btnGotoAdmin = document.getElementById("btn-goto-admin");

    const userName = document.getElementById("user-name");
    const userInfo = document.getElementById("user-info");
    const userAvatar = document.getElementById("user-avatar");
    const authFeedback = document.getElementById("auth-feedback");

    const guestbookForm = document.getElementById("guestbook-form");
    const guestbookAuthNotice = document.getElementById("guestbook-feedback-auth-notice");
    const messagesContainer = document.getElementById("messages-container");
    const guestbookMessage = document.getElementById("guestbook-message");

    let confirmationResult = null;
    let recaptchaVerifier = null;
    let currentUser = null;

    // 1. Authentication Tabs Switcher
    if (tabEmail && tabPhone && panelEmail && panelPhone) {
        tabEmail.addEventListener("click", () => {
            tabEmail.classList.add("active-tab");
            tabPhone.classList.remove("active-tab");
            panelEmail.classList.remove("hidden");
            panelPhone.classList.add("hidden");
            clearFeedback();
        });

        tabPhone.addEventListener("click", () => {
            tabPhone.classList.add("active-tab");
            tabEmail.classList.remove("active-tab");
            panelPhone.classList.remove("hidden");
            panelEmail.classList.add("hidden");
            clearFeedback();
            
            // Initialize Recaptcha if it doesn't exist
            if (!recaptchaVerifier) {
                initRecaptcha();
            }
        });
    }

    // Initialize Recaptcha Verifier
    function initRecaptcha() {
        try {
            recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'normal',
                'callback': (response) => {
                    // reCAPTCHA solved
                },
                'expired-callback': () => {
                    showFeedback("reCAPTCHA expired. Please try again.", "error");
                }
            });
            recaptchaVerifier.render();
        } catch (error) {
            console.error("Recaptcha error:", error);
            showFeedback("Failed to load reCAPTCHA verifier.", "error");
        }
    }

    // 2. Email/Password Sign-In
    if (emailAuthForm) {
        const btnSignIn = document.getElementById("btn-email-signin");
        const btnSignUp = document.getElementById("btn-email-signup");

        btnSignIn.addEventListener("click", (e) => {
            if (!emailAuthForm.checkValidity()) return;
            e.preventDefault();

            const email = document.getElementById("auth-email").value.trim();
            const password = document.getElementById("auth-password").value;

            setLoading(btnSignIn, true);
            signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    showFeedback("Successfully signed in!", "success");
                    setLoading(btnSignIn, false);
                })
                .catch((error) => {
                    showFeedback(formatAuthError(error.code), "error");
                    setLoading(btnSignIn, false);
                });
        });

        btnSignUp.addEventListener("click", (e) => {
            if (!emailAuthForm.checkValidity()) return;
            e.preventDefault();

            const email = document.getElementById("auth-email").value.trim();
            const password = document.getElementById("auth-password").value;

            if (password.length < 6) {
                showFeedback("Password must be at least 6 characters.", "error");
                return;
            }

            setLoading(btnSignUp, true);
            createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    showFeedback("Account created successfully!", "success");
                    setLoading(btnSignUp, false);
                })
                .catch((error) => {
                    showFeedback(formatAuthError(error.code), "error");
                    setLoading(btnSignUp, false);
                });
        });
    }

    // 3. Google Sign-In
    if (btnGoogleSignIn) {
        btnGoogleSignIn.addEventListener("click", () => {
            const provider = new GoogleAuthProvider();
            signInWithPopup(auth, provider)
                .then((result) => {
                    showFeedback("Successfully signed in with Google!", "success");
                })
                .catch((error) => {
                    if (error.code === 'auth/unauthorized-domain') {
                        showFeedback("Authorized Domain configuration needed. Add your current domain to Firebase console.", "error");
                    } else {
                        showFeedback(formatAuthError(error.code), "error");
                    }
                });
        });
    }

    // 4. Phone Number Authentication
    if (phoneAuthForm) {
        phoneAuthForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const phoneNumber = document.getElementById("auth-phone").value.trim();

            if (!recaptchaVerifier) {
                showFeedback("Please reload the page to initialize reCAPTCHA.", "error");
                return;
            }

            const sendBtn = document.getElementById("btn-phone-send-code");
            setLoading(sendBtn, true);

            signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier)
                .then((result) => {
                    confirmationResult = result;
                    phoneAuthForm.classList.add("hidden");
                    phoneCodeForm.classList.remove("hidden");
                    showFeedback("Verification SMS sent! Please enter the code.", "success");
                    setLoading(sendBtn, false);
                })
                .catch((error) => {
                    showFeedback(formatAuthError(error.code), "error");
                    setLoading(sendBtn, false);
                    if (recaptchaVerifier) {
                        recaptchaVerifier.clear();
                        initRecaptcha();
                    }
                });
        });
    }

    if (phoneCodeForm) {
        phoneCodeForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const code = document.getElementById("auth-verification-code").value.trim();

            if (!confirmationResult) {
                showFeedback("Session expired. Please request a new SMS.", "error");
                return;
            }

            const verifyBtn = document.getElementById("btn-phone-verify-code");
            setLoading(verifyBtn, true);

            confirmationResult.confirm(code)
                .then((result) => {
                    showFeedback("Phone verified and signed in!", "success");
                    setLoading(verifyBtn, false);
                })
                .catch((error) => {
                    showFeedback(formatAuthError(error.code), "error");
                    setLoading(verifyBtn, false);
                });
        });
    }

    // 5. Sign Out
    if (btnSignOut) {
        btnSignOut.addEventListener("click", () => {
            signOut(auth)
                .then(() => {
                    showFeedback("Successfully signed out.", "success");
                    // Reset forms
                    if (phoneAuthForm) {
                        phoneAuthForm.classList.remove("hidden");
                        phoneCodeForm.classList.add("hidden");
                        if (recaptchaVerifier) {
                            recaptchaVerifier.clear();
                            initRecaptcha();
                        }
                    }
                })
                .catch((error) => {
                    showFeedback("Failed to sign out.", "error");
                });
        });
    }

    // 6. Observe Auth State changes
    onAuthStateChanged(auth, (user) => {
        currentUser = user;
        clearFeedback();

        if (user) {
            // Toggle login/logout panels
            signedOutState.classList.add("hidden");
            signedInState.classList.remove("hidden");

            // Profile info update
            userName.textContent = user.displayName || user.email?.split("@")[0] || user.phoneNumber || "Client Member";
            userInfo.textContent = user.email || user.phoneNumber || "No contact info";
            userAvatar.src = user.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150";

            // Show admin button if email matches
            if (btnGotoAdmin) {
                if (user.email === "karanak1513@gmail.com") {
                    btnGotoAdmin.classList.remove("hidden");
                } else {
                    btnGotoAdmin.classList.add("hidden");
                }
            }

            // Guestbook controls
            guestbookForm.classList.remove("hidden");
            guestbookAuthNotice.classList.add("hidden");
        } else {
            signedOutState.classList.remove("hidden");
            signedInState.classList.add("hidden");

            // Hide admin button
            if (btnGotoAdmin) {
                btnGotoAdmin.classList.add("hidden");
            }

            // Guestbook controls
            guestbookForm.classList.add("hidden");
            guestbookAuthNotice.classList.remove("hidden");
        }
    });

    // 7. Realtime Guestbook Loading from Firestore
    const q = query(collection(db, "guestbook"), orderBy("timestamp", "desc"), limit(15));
    onSnapshot(q, (snapshot) => {
        messagesContainer.innerHTML = "";
        
        if (snapshot.empty) {
            messagesContainer.innerHTML = '<div class="message-empty">No reviews posted yet. Be the first!</div>';
            return;
        }

        snapshot.forEach((doc) => {
            const data = doc.data();
            const messageElement = document.createElement("div");
            messageElement.className = "message-item glass-card";
            
            // Format timestamp safely
            let formattedDate = "Just now";
            if (data.timestamp) {
                const date = data.timestamp.toDate();
                formattedDate = date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }

            // XSS Safe Text Escaping
            const safeMessage = escapeHTML(data.message);
            const safeName = escapeHTML(data.userName);
            const safeAvatar = data.userPhoto || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80";

            messageElement.innerHTML = `
                <div class="msg-avatar-container">
                    <img src="${safeAvatar}" alt="${safeName}">
                </div>
                <div class="msg-content">
                    <div class="msg-header">
                        <span class="msg-author">${safeName}</span>
                        <span class="msg-date">${formattedDate}</span>
                    </div>
                    <p class="msg-body">${safeMessage}</p>
                </div>
            `;
            messagesContainer.appendChild(messageElement);
        });
    }, (error) => {
        console.error("Firestore loading error:", error);
        messagesContainer.innerHTML = '<div class="message-error">Failed to load real-time reviews.</div>';
    });

    // 8. Submit Message to Guestbook Firestore
    if (guestbookForm) {
        guestbookForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const text = guestbookMessage.value.trim();

            if (!text) return;
            if (!currentUser) {
                showFeedback("You must be logged in to post.", "error");
                return;
            }

            const postBtn = guestbookForm.querySelector(".btn-post");
            const btnText = postBtn.querySelector("span");
            btnText.textContent = "Posting...";
            postBtn.disabled = true;

            try {
                await addDoc(collection(db, "guestbook"), {
                    message: text,
                    userId: currentUser.uid,
                    userName: currentUser.displayName || currentUser.email?.split("@")[0] || currentUser.phoneNumber || "Anonymous Client",
                    userPhoto: currentUser.photoURL || null,
                    timestamp: serverTimestamp()
                });
                guestbookMessage.value = "";
                showFeedback("Feedback posted successfully!", "success");
            } catch (error) {
                console.error("Error creating post:", error);
                showFeedback("Error posting message. Please check permissions.", "error");
            } finally {
                btnText.textContent = "Post Feedback";
                postBtn.disabled = false;
            }
        });
    }

    // Helper functions
    function showFeedback(msg, type) {
        if (!authFeedback) return;
        authFeedback.textContent = msg;
        authFeedback.className = `auth-feedback ${type}`;
        authFeedback.classList.remove("hidden");
    }

    function clearFeedback() {
        if (!authFeedback) return;
        authFeedback.className = "auth-feedback hidden";
    }

    function setLoading(btn, isLoading) {
        if (!btn) return;
        btn.disabled = isLoading;
        const span = btn.querySelector("span");
        if (span) {
            if (isLoading) {
                btn.dataset.originalText = span.textContent;
                span.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
            } else {
                span.textContent = btn.dataset.originalText || "Submit";
            }
        }
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }

    function formatAuthError(code) {
        switch (code) {
            case 'auth/invalid-email':
                return 'Invalid email address format.';
            case 'auth/user-disabled':
                return 'This user account has been disabled.';
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                return 'Incorrect email or password.';
            case 'auth/email-already-in-use':
                return 'An account already exists with this email.';
            case 'auth/weak-password':
                return 'Password must be at least 6 characters.';
            case 'auth/invalid-verification-code':
                return 'Incorrect SMS code entered.';
            case 'auth/quota-exceeded':
                return 'SMS quota exceeded. Please try again later.';
            case 'auth/invalid-phone-number':
                return 'The phone number format is invalid.';
            default:
                return 'Authentication error occurred. Please try again.';
        }
    }
});
