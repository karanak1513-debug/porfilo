"use client";
import React, { useState, useEffect } from "react";
import { db, auth } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  onSnapshot,
  collection,
  query,
  orderBy,
  getDoc,
  setDoc,
  addDoc,
  getDocs,
  updateDoc
} from "firebase/firestore";

import Navbar from "./components/Navbar";
import AuthPortal from "./components/AuthPortal";
import AdminDashboard from "./components/AdminDashboard";
import Guestbook from "./components/Guestbook";

export default function Home() {
  const [user, setUser] = useState(null);
  const [generalData, setGeneralData] = useState({
    heroTitle: "Karan Kumar",
    heroTyping: "Digital Marketing Intern,Website Designer,SEO & AI Tools Specialist,BBA Finance Scholar",
    heroDescription: "An enthusiastic BBA Banking & Finance student blending management principles with digital marketing strategy, SEO mastery, and cutting-edge AI tools to build high-converting business websites.",
    location: "Greater Delhi Area, India",
    aboutLead: "I am a BBA Banking & Finance student at Geeta University and a Digital Marketing Intern at TalentGrow Global.",
    aboutBody: "Karan is a BBA Banking & Finance student at Geeta University and a Digital Marketing Intern at TalentGrow Global. He is passionate about digital marketing, website development, SEO, online branding, AI tools and building real business websites. I am continuously learning SEO, AI tools, website design, online branding and modern digital marketing to improve business growth through practical real-world projects.",
    skills: "SEO,AI Tools Learner,Website Design,Business Website Development,Domain Name System DNS,Content Creation,Online Branding,Google Business Profile,Firebase,Vercel,GitHub,Canva,Digital Marketing",
    contactEmail: "karanak1513@gmail.com",
    contactPhone: "+91 8287261653",
    contactLinkedIn: "https://www.linkedin.com/in/karan-kumar-757494338",
    contactLocation: "New Delhi, Greater Delhi Area, India",
    profilePhotoUrl: "",
    resumeUrl: "Karan_Kumar_Resume.pdf"
  });

  const [projects, setProjects] = useState([]);
  const [certs, setCerts] = useState([]);
  const [interests, setInterests] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [education, setEducation] = useState([]);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [activeLightbox, setActiveLightbox] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  // Typing state
  const [typingText, setTypingText] = useState("");
  const [subtitles, setSubtitles] = useState([
    "Digital Marketing Intern",
    "Website Designer",
    "SEO & AI Tools Specialist",
    "BBA Finance Scholar"
  ]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      setUser(usr);
      if (usr && usr.email === "karanak1513@gmail.com") {
        bootstrapDatabase();
      }
    });
    return () => unsubscribe();
  }, []);

  // Database Migration for KK Moulding Image
  useEffect(() => {
    const checkAndMigrateImage = async () => {
      try {
        const q = query(collection(db, "projects"));
        const snap = await getDocs(q);
        snap.forEach(async (docRef) => {
          const data = docRef.data();
          if (data.title === "K K Moulding Website" && !data.imageUrl) {
            await updateDoc(docRef.ref, { imageUrl: "/kkmoulding.png" });
            console.log("Database updated: K K Moulding Website image set to /kkmoulding.png");
          }
        });
      } catch (err) {
        console.warn("Image migration skipped (non-admin or empty db):", err);
      }
    };
    checkAndMigrateImage();
  }, [user]);

  // Database Bootstrapper
  const bootstrapDatabase = async () => {
    try {
      const configRef = doc(db, "portfolio_config", "content");
      const configSnap = await getDoc(configRef);
      if (!configSnap.exists()) {
        console.log("Bootstrapping configs...");
        await setDoc(configRef, {
          ...generalData,
          seoTitle: "Karan Kumar | Digital Marketing & Web Design Portfolio",
          seoDescription: "Portfolio of Karan Kumar - Digital Marketing Intern, Website Designer, and SEO & AI Tools Enthusiast.",
          seoKeywords: "Karan Kumar, Digital Marketing Intern, Web Designer, SEO"
        });

        // Bootstrap lists
        const defaultProjects = [
          {
            title: "K K Moulding Website",
            description: "A real business website created for K K Moulding to showcase wooden moulding, doors, chaukhat, interior woodwork and business enquiries.",
            liveLink: "https://kkmoulding.com",
            githubLink: "",
            tech: "SEO, AI Tools, Domain setup, Vercel, Firebase, GitHub, Business Website Development",
            imageUrl: "/kkmoulding.png",
            order: 1
          }
        ];
        for (const p of defaultProjects) {
          await addDoc(collection(db, "projects"), p);
        }

        const defaultInterests = [
          { title: "Growth & Marketing", icon: "fa-rocket", description: "Helping brands scale their online presence through optimized funnels and content strategies.", order: 1 },
          { title: "Modern Web Design", icon: "fa-code", description: "Developing responsive, speedy websites using modern web design from Antigravity, ChatGPT for doubt, and No-Code website tools.", order: 2 }
        ];
        for (const i of defaultInterests) {
          await addDoc(collection(db, "interests"), i);
        }
      }
    } catch (err) {
      console.error("Bootstrapping error:", err);
    }
  };

  // Sync Content
  useEffect(() => {
    const unsubConfig = onSnapshot(doc(db, "portfolio_config", "content"), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setGeneralData(prev => ({ ...prev, ...data }));
        if (data.heroTyping) {
          const words = data.heroTyping.split(",").map(w => w.trim()).filter(w => w.length > 0);
          if (words.length > 0) setSubtitles(words);
        }
      }
    });

    const unsubProjects = onSnapshot(query(collection(db, "projects"), orderBy("order", "asc")), (snap) => {
      const items = [];
      snap.forEach(d => items.push({ id: d.id, ...d.data() }));
      setProjects(items);
    });

    const unsubCerts = onSnapshot(query(collection(db, "certificates"), orderBy("order", "asc")), (snap) => {
      const items = [];
      snap.forEach(d => items.push({ id: d.id, ...d.data() }));
      setCerts(items);
    });

    const unsubInterests = onSnapshot(query(collection(db, "interests"), orderBy("order", "asc")), (snap) => {
      const items = [];
      snap.forEach(d => items.push({ id: d.id, ...d.data() }));
      setInterests(items);
    });

    const unsubExp = onSnapshot(query(collection(db, "experiences"), orderBy("order", "asc")), (snap) => {
      const items = [];
      snap.forEach(d => items.push({ id: d.id, ...d.data() }));
      setExperiences(items);
    });

    const unsubEdu = onSnapshot(query(collection(db, "education"), orderBy("order", "asc")), (snap) => {
      const items = [];
      snap.forEach(d => items.push({ id: d.id, ...d.data() }));
      setEducation(items);
    });

    return () => {
      unsubConfig();
      unsubProjects();
      unsubCerts();
      unsubInterests();
      unsubExp();
      unsubEdu();
    };
  }, []);

  // Typing loop
  useEffect(() => {
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let timer;

    const type = () => {
      if (subtitles.length === 0) return;
      const currentWord = subtitles[wordIndex];

      if (isDeleting) {
        setTypingText(currentWord.substring(0, charIndex - 1));
        charIndex--;
      } else {
        setTypingText(currentWord.substring(0, charIndex + 1));
        charIndex++;
      }

      let delay = 150;
      if (isDeleting) delay /= 2;

      if (!isDeleting && charIndex === currentWord.length) {
        isDeleting = true;
        delay = 2000;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % subtitles.length;
        delay = 300;
      }

      timer = setTimeout(type, delay);
    };

    timer = setTimeout(type, 500);
    return () => clearTimeout(timer);
  }, [subtitles]);

  // Group skills into three columns
  const skillsList = generalData.skills.split(",").map(s => s.trim()).filter(s => s.length > 0);
  const midPoint1 = Math.ceil(skillsList.length / 3);
  const midPoint2 = Math.ceil((skillsList.length - midPoint1) / 2) + midPoint1;
  const col1 = skillsList.slice(0, midPoint1);
  const col2 = skillsList.slice(midPoint1, midPoint2);
  const col3 = skillsList.slice(midPoint2);

  const heroSphereBg = generalData.profilePhotoUrl 
    ? { backgroundImage: `url('${generalData.profilePhotoUrl}')`, backgroundSize: "cover", backgroundPosition: "center", borderRadius: "50%" } 
    : {};

  return (
    <>
      <Navbar />

      <main>
        {/* Home Section */}
        <section id="home" className="hero-section">
          <div className="container hero-container">
            <div className="hero-content">
              <span className="badge"><i className="fa-solid fa-sparkles"></i> Open for Opportunities</span>
              <h1 className="hero-title">
                Hi, I'm <span className="gradient-text">{generalData.heroTitle}</span>
              </h1>
              <h2 className="hero-subtitle">
                I am a <span id="typing-text">{typingText}</span><span className="cursor">|</span>
              </h2>
              <p className="hero-description" id="hero-description-text">
                {generalData.heroDescription}
              </p>
              <div className="location-badge" id="hero-location-text">
                <i className="fa-solid fa-location-dot"></i> {generalData.location}
              </div>
              <div className="hero-ctas">
                <a href="#projects" className="btn btn-primary">
                  <span>View Projects</span> <i className="fa-solid fa-arrow-right"></i>
                </a>
                <a href="#contact" className="btn btn-secondary">
                  <span>Contact Me</span>
                </a>
                <a 
                  href={generalData.resumeUrl || "Karan_Kumar_Resume.pdf"} 
                  download 
                  className="btn btn-tertiary resume-download-link"
                >
                  <i className="fa-solid fa-download"></i> <span>Download Resume</span>
                </a>
              </div>
            </div>
            <div className="hero-visual">
              <div className="glass-sphere-container">
                <div className="glass-sphere" style={heroSphereBg}>
                  {!generalData.profilePhotoUrl && (
                    <div className="sphere-inner">
                      <i className="fa-solid fa-chart-line accent-icon-1"></i>
                      <i className="fa-solid fa-laptop-code accent-icon-2"></i>
                      <i className="fa-solid fa-magnifying-glass-chart accent-icon-3"></i>
                      <i className="fa-solid fa-brain accent-icon-4"></i>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="about-section">
          <div className="container">
            <div className="section-header">
              <span className="section-tag">About Me</span>
              <h2 className="section-title">Bridging Business & Tech</h2>
            </div>
            <div className="about-grid">
              <div className="about-text-card glass-card">
                <div className="card-glow"></div>
                <p className="lead-text" id="about-lead-text">{generalData.aboutLead}</p>
                <p id="about-body-text">{generalData.aboutBody}</p>
                
                <div className="quick-facts">
                  <div className="fact-item">
                    <span className="fact-number">1+</span>
                    <span className="fact-label">Years Learning & Coding</span>
                  </div>
                  <div className="fact-item">
                    <span className="fact-number">3+</span>
                    <span className="fact-label">Real Projects Hosted</span>
                  </div>
                  <div className="fact-item">
                    <span className="fact-number">5+</span>
                    <span className="fact-label">Professional Certifications</span>
                  </div>
                </div>
              </div>

              <div className="about-interest-card glass-card">
                <h3 className="card-title">What I Drive For</h3>
                <ul className="interest-list" id="interests-container">
                  {interests.length === 0 ? (
                    <li style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>No driving factors listed yet.</li>
                  ) : (
                    interests.map(i => (
                      <li key={i.id}>
                        <div className="interest-icon"><i className={`fa-solid ${i.icon}`}></i></div>
                        <div className="interest-content">
                          <h4>{i.title}</h4>
                          <p>{i.description}</p>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section id="skills" className="skills-section">
          <div className="container">
            <div className="section-header">
              <span className="section-tag">Skills</span>
              <h2 className="section-title">My Technical Toolbox</h2>
            </div>
            <div className="skills-grid" id="skills-container">
              <div className="skills-category-card glass-card">
                <div className="category-header">
                  <i className="fa-solid fa-bullseye"></i>
                  <h3>Marketing & Branding</h3>
                </div>
                <div className="skills-list">
                  {col1.map((skill, index) => (
                    <div key={index} className="skill-pill">{skill} <span className="dot"></span></div>
                  ))}
                </div>
              </div>

              <div className="skills-category-card glass-card">
                <div className="category-header">
                  <i className="fa-solid fa-code-branch"></i>
                  <h3>Development & Platforms</h3>
                </div>
                <div className="skills-list">
                  {col2.map((skill, index) => (
                    <div key={index} className="skill-pill">{skill} <span className="dot"></span></div>
                  ))}
                </div>
              </div>

              <div className="skills-category-card glass-card">
                <div className="category-header">
                  <i className="fa-solid fa-robot"></i>
                  <h3>AI & Modern Tools</h3>
                </div>
                <div className="skills-list">
                  {col3.map((skill, index) => (
                    <div key={index} className="skill-pill">{skill} <span className="dot"></span></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Experience Section */}
        <section id="experience" className="experience-section">
          <div className="container">
            <div className="section-header">
              <span className="section-tag">Experience</span>
              <h2 className="section-title">Professional Journey</h2>
            </div>
            <div className="timeline" id="experience-container">
              {experiences.length === 0 ? (
                <div style={{ color: "var(--text-muted)", textAlign: "center", width: "100%" }}>No experiences listed yet.</div>
              ) : (
                experiences.map(e => (
                  <div key={e.id} className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div className="timeline-card glass-card">
                      <div className="timeline-header">
                        <span className="timeline-date">{e.duration}</span>
                        <span className="company-badge">{e.type}</span>
                      </div>
                      <h3 className="role-title">{e.role}</h3>
                      <h4 className="company-name">{e.company}</h4>
                      <p className="experience-desc">{e.description}</p>
                      <div className="experience-tags">
                        {e.tags && e.tags.split(",").map((t, idx) => (
                          <span key={idx} className="tag">{t.trim()}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section id="projects" className="projects-section">
          <div className="container">
            <div className="section-header">
              <span className="section-tag">Projects</span>
              <h2 className="section-title">Featured Creations</h2>
            </div>
            <div className="projects-grid" id="projects-container">
              {projects.length === 0 ? (
                <div className="message-empty">No projects posted yet.</div>
              ) : (
                projects.map(p => (
                  <article key={p.id} className="project-card glass-card">
                    <div 
                      className="project-img-placeholder"
                      onClick={() => p.imageUrl && setActiveLightbox(p.imageUrl)}
                      style={p.imageUrl ? { backgroundImage: `url('${p.imageUrl}')`, backgroundSize: "cover", backgroundPosition: "center", fontSize: 0, cursor: "zoom-in" } : {}}
                    >
                      {!p.imageUrl && <i className="fa-solid fa-laptop-code"></i>}
                      <div className="project-type">Project</div>
                    </div>
                    <div className="project-info">
                      <h3 className="project-title">{p.title}</h3>
                      <p className="project-desc">{p.description}</p>
                      <div className="project-tech">
                        {p.tech && p.tech.split(",").map((t, idx) => (
                          <span key={idx}>{t.trim()}</span>
                        ))}
                      </div>
                      <div className="project-links">
                        {p.liveLink && (
                          <a href={p.liveLink} target="_blank" rel="noopener noreferrer" className="project-link-btn">
                            Visit Website <i className="fa-solid fa-up-right-from-square"></i>
                          </a>
                        )}
                        {p.githubLink && (
                          <a href={p.githubLink} target="_blank" rel="noopener noreferrer" className="project-link-btn" style={{ marginLeft: "15px" }}>
                            <i className="fa-brands fa-github"></i> Code
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Certifications Section */}
        <section id="certifications" className="certifications-section">
          <div className="container">
            <div className="section-header">
              <span className="section-tag">Certifications</span>
              <h2 className="section-title">Credentials & Achievements</h2>
            </div>
            <div className="certifications-grid" id="certificates-container">
              {certs.length === 0 ? (
                <div className="message-empty">No certifications listed yet.</div>
              ) : (
                certs.map(c => (
                  <div key={c.id} className="cert-card glass-card">
                    <div 
                      className="cert-icon" 
                      onClick={() => c.imageUrl && setActiveLightbox(c.imageUrl)}
                      style={c.imageUrl ? { padding: 0, overflow: "hidden", cursor: "zoom-in" } : {}}
                    >
                      {c.imageUrl ? (
                        <img src={c.imageUrl} alt={c.title} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                      ) : (
                        <i className="fa-solid fa-award"></i>
                      )}
                    </div>
                    <h3>{c.title}</h3>
                    <p className="cert-issuer">{c.issuer}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Education Section */}
        <section id="education" className="education-section">
          <div className="container">
            <div className="section-header">
              <span className="section-tag">Education</span>
              <h2 className="section-title">Academic Background</h2>
            </div>
            <div className="education-timeline" id="education-container">
              {education.length === 0 ? (
                <div style={{ color: "var(--text-muted)", textAlign: "center", width: "100%" }}>No education history listed yet.</div>
              ) : (
                education.map(e => (
                  <div key={e.id} className="edu-item glass-card">
                    <div className="edu-header">
                      <span className="edu-duration">{e.duration}</span>
                      <span className="edu-status">{e.status}</span>
                    </div>
                    <h3>{e.degree}</h3>
                    <h4 className="edu-institution">{e.institution}</h4>
                    <p className="edu-detail">{e.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Interactive Guestbook Portal */}
        <section id="portal" className="portal-section">
          <div className="container">
            <div className="section-header">
              <span className="section-tag">Interactive</span>
              <h2 className="section-title">Client & Guest Portal</h2>
            </div>
            <div className="portal-grid">
              <Guestbook user={user} />
              <AuthPortal user={user} />
            </div>
          </div>
        </section>

        {/* Admin Console Dashboard */}
        {user?.email === "karanak1513@gmail.com" && <AdminDashboard user={user} />}

        {/* Contact Section */}
        <section id="contact" className="contact-section">
          <div className="container">
            <div className="section-header">
              <span className="section-tag">Get In Touch</span>
              <h2 className="section-title">Let's Build Something Great</h2>
            </div>
            <div className="contact-grid">
              <div className="contact-info-card glass-card">
                <h3>Contact Information</h3>
                <p>Feel free to reach out to me for internship opportunities, website development collaborations, or SEO strategy discussions.</p>
                
                <ul className="contact-details-list">
                  <li>
                    <div className="detail-icon"><i className="fa-solid fa-envelope"></i></div>
                    <div className="detail-content">
                      <span className="detail-label">Email Me</span>
                      <a href={`mailto:${generalData.contactEmail}`} className="detail-link">{generalData.contactEmail}</a>
                    </div>
                  </li>
                  <li>
                    <div className="detail-icon"><i className="fa-solid fa-phone"></i></div>
                    <div className="detail-content">
                      <span className="detail-label">Call Me</span>
                      <a href={`tel:${generalData.contactPhone.replace(/\s+/g, '')}`} className="detail-link">{generalData.contactPhone}</a>
                    </div>
                  </li>
                  <li>
                    <div className="detail-icon"><i className="fa-brands fa-linkedin-in"></i></div>
                    <div className="detail-content">
                      <span className="detail-label">LinkedIn</span>
                      <a href={generalData.contactLinkedIn} target="_blank" rel="noopener noreferrer" className="detail-link">LinkedIn Profile</a>
                    </div>
                  </li>
                  <li>
                    <div className="detail-icon"><i className="fa-solid fa-location-crosshairs"></i></div>
                    <div className="detail-content">
                      <span className="detail-label">Location</span>
                      <span className="detail-value">{generalData.contactLocation}</span>
                    </div>
                  </li>
                </ul>
                <div className="contact-resume-download" style={{ marginTop: "30px" }}>
                  <a href={generalData.resumeUrl || "Karan_Kumar_Resume.pdf"} download className="btn btn-secondary resume-download-link">
                    <i className="fa-solid fa-download"></i> <span>Download Resume</span>
                  </a>
                </div>
              </div>

              <div className="contact-form-card glass-card">
                <h3>Send a Message</h3>
                <form id="contact-form" onSubmit={(e) => { e.preventDefault(); showToast("Message sent successfully!"); e.target.reset(); }}>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="contact-name">Your Name</label>
                      <input type="text" id="contact-name" placeholder="John Doe" required />
                    </div>
                    <div className="form-group">
                      <label htmlFor="contact-email">Email Address</label>
                      <input type="email" id="contact-email" placeholder="john@example.com" required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="contact-subject">Subject</label>
                    <input type="text" id="contact-subject" placeholder="Project Inquiry / Hiring" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="contact-message">Your Message</label>
                    <textarea id="contact-message" rows="5" placeholder="Hi Karan, I'd like to talk about..." required></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary">
                    <span>Send Message</span> <i className="fa-solid fa-paper-plane"></i>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <a href="#home" className="logo">
                <span className="logo-accent">K</span>aran<span className="logo-dot">.</span>
              </a>
              <p>Digital Marketing & Web Design Specialist. Building modern business websites with optimized organic growth funneling.</p>
            </div>
            <div className="footer-links-group">
              <div className="footer-links-col">
                <h4>Navigation</h4>
                <a href="#home">Home</a>
                <a href="#about">About</a>
                <a href="#skills">Skills</a>
                <a href="#projects">Projects</a>
              </div>
              <div className="footer-links-col">
                <h4>Portal</h4>
                <a href="#portal">Guestbook</a>
                <a href="#contact">Contact</a>
                <a href={generalData.resumeUrl || "Karan_Kumar_Resume.pdf"} download className="resume-download-link">Resume</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} Karan Kumar. All rights reserved. Powered by Next.js & Firebase.</p>
            <div className="footer-socials">
              <a href={generalData.contactLinkedIn} target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-linkedin-in"></i></a>
              <a href={`mailto:${generalData.contactEmail}`}><i className="fa-solid fa-envelope"></i></a>
              <a href={`tel:${generalData.contactPhone.replace(/\s+/g, '')}`}><i className="fa-solid fa-phone"></i></a>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom Toast Overlay */}
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          <i className={`fa-solid ${toast.type === "success" ? "fa-circle-check" : "fa-circle-exclamation"}`}></i>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Lightbox Modal */}
      {activeLightbox && (
        <div 
          className="lightbox-overlay" 
          onClick={() => setActiveLightbox(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "zoom-out",
            animation: "fadeIn 0.2s ease"
          }}
        >
          <img 
            src={activeLightbox} 
            alt="Preview" 
            style={{ 
              maxWidth: "90%", 
              maxHeight: "90%", 
              objectFit: "contain", 
              borderRadius: "var(--radius-md)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
              animation: "scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
            }} 
          />
          <button 
            onClick={() => setActiveLightbox(null)}
            style={{
              position: "absolute",
              top: "24px",
              right: "24px",
              background: "rgba(255,255,255,0.1)",
              border: "none",
              color: "#fff",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.2rem"
            }}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      )}
    </>
  );
}
