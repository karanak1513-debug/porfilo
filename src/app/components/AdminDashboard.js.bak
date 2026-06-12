"use client";
import React, { useState, useEffect } from "react";
import { db, storage } from "../../lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

export default function AdminDashboard({ user }) {
  const [activeTab, setActiveTab] = useState("general");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // General & Contact States
  const [generalData, setGeneralData] = useState({
    heroTitle: "",
    heroTyping: "",
    heroDescription: "",
    aboutLead: "",
    aboutBody: "",
    skills: "",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    contactEmail: "",
    contactPhone: "",
    contactLinkedIn: "",
    contactLocation: ""
  });

  // Lists States
  const [projects, setProjects] = useState([]);
  const [certs, setCerts] = useState([]);
  const [interests, setInterests] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [education, setEducation] = useState([]);

  // Form inputs States
  const [projectInput, setProjectInput] = useState({ id: "", title: "", description: "", liveLink: "", githubLink: "", tech: "", videoUrl: "" });
  const [certInput, setCertInput] = useState({ id: "", title: "", issuer: "", imageUrl: "" });
  const [interestInput, setInterestInput] = useState({ id: "", title: "", icon: "fa-rocket", description: "" });
  const [expInput, setExpInput] = useState({ id: "", role: "", company: "", duration: "", type: "Internship", description: "", tags: "" });
  const [eduInput, setEduInput] = useState({ id: "", degree: "", institution: "", duration: "", status: "In Progress", description: "" });

  // Upload Progress States
  const [uploadProgress, setUploadProgress] = useState({ profile: 0, resume: 0, projectImg: 0, certImg: 0, projectVid: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [profileFile, setProfileFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);

  // Custom Toast helper
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  useEffect(() => {
    if (!user || user.email !== "karanak1513@gmail.com") return;

    // Load initial settings
    const loadSettings = async () => {
      try {
        const docSnap = await getDoc(doc(db, "portfolio_config", "content"));
        if (docSnap.exists()) {
          setGeneralData(docSnap.data());
        }
      } catch (err) {
        console.error("Error loading configs:", err);
      }
    };
    loadSettings();

    // Set up real-time snapshots
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
      unsubProjects();
      unsubCerts();
      unsubInterests();
      unsubExp();
      unsubEdu();
    };
  }, [user]);

  if (!user || user.email !== "karanak1513@gmail.com") return null;

  // File Upload Helper
  const uploadFile = (file, folder, progressKey) => {
    return new Promise((resolve) => {
      setUploadProgress(prev => ({ ...prev, [progressKey]: 20 }));
      convertToBase64(file).then(base64 => {
        setUploadProgress(prev => ({ ...prev, [progressKey]: 100 }));
        resolve(base64);
      }).catch(err => {
        console.error("Base64 conversion failed:", err);
        setUploadProgress(prev => ({ ...prev, [progressKey]: 0 }));
        resolve("");
      });
    });
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (err) => reject(err);
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 500;
          const MAX_HEIGHT = 500;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  // Submit Handlers
  const handleGeneralSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, "portfolio_config", "content"), {
        heroTitle: generalData.heroTitle || "",
        heroTyping: generalData.heroTyping || "",
        heroDescription: generalData.heroDescription || "",
        aboutLead: generalData.aboutLead || "",
        aboutBody: generalData.aboutBody || "",
        skills: generalData.skills || "",
        seoTitle: generalData.seoTitle || "",
        seoDescription: generalData.seoDescription || "",
        seoKeywords: generalData.seoKeywords || ""
      });
      showToast("General & SEO settings saved successfully!");
    } catch (err) {
      console.error(err);
      showToast("Error saving settings.", "error");
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, "portfolio_config", "content"), {
        contactEmail: generalData.contactEmail || "",
        contactPhone: generalData.contactPhone || "",
        contactLinkedIn: generalData.contactLinkedIn || "",
        contactLocation: generalData.contactLocation || ""
      });
      showToast("Contact settings saved successfully!");
    } catch (err) {
      console.error(err);
      showToast("Error saving contact info.", "error");
    }
  };

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) setProfileFile(file);
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file) setResumeFile(file);
  };

  const handleMediaSubmit = async (e) => {
    e.preventDefault();
    if (!profileFile && !resumeFile) {
      showToast("Please select at least one file to upload.", "error");
      return;
    }
    setIsLoading(true);
    try {
      const updates = {};
      if (profileFile) {
        const url = await uploadFile(profileFile, "profile", "profile");
        updates.profilePhotoUrl = url;
      }
      if (resumeFile) {
        const url = await uploadFile(resumeFile, "resumes", "resume");
        updates.resumeUrl = url;
      }
      await updateDoc(doc(db, "portfolio_config", "content"), updates);
      showToast("Media assets uploaded and saved successfully!");
      setProfileFile(null);
      setResumeFile(null);
      setUploadProgress(prev => ({ ...prev, profile: 0, resume: 0 }));
    } catch (err) {
      console.error(err);
      showToast("Failed to upload media assets.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // CRUD Actions
  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const fileEl = document.getElementById("project-img-file");
    const file = fileEl?.files[0];
    try {
      let imageUrl = "";
      if (file) {
        imageUrl = await uploadFile(file, "projects", "projectImg");
      }
      const data = {
        title: projectInput.title,
        description: projectInput.description,
        liveLink: projectInput.liveLink,
        githubLink: projectInput.githubLink,
        tech: projectInput.tech,
        order: 1
      };
      if (imageUrl) data.imageUrl = imageUrl;

      if (projectInput.id) {
        await updateDoc(doc(db, "projects", projectInput.id), data);
        showToast("Project updated successfully!");
      } else {
        await addDoc(collection(db, "projects"), { ...data, order: Date.now() });
        showToast("Project added successfully!");
      }
      setProjectInput({ id: "", title: "", description: "", liveLink: "", githubLink: "", tech: "" });
      if (fileEl) fileEl.value = "";
      setUploadProgress(prev => ({ ...prev, projectImg: 0 }));
    } catch (err) {
      console.error(err);
      showToast("Error saving project.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCertSubmit = async (e) => {
    e.preventDefault();
    const fileEl = document.getElementById("cert-img-file");
    const file = fileEl?.files[0];
    if (!file && !certInput.id) {
      showToast("Image badge is required.", "error");
      return;
    }
    setIsLoading(true);
    try {
      let imageUrl = certInput.imageUrl || "";
      if (file) {
        imageUrl = await uploadFile(file, "certificates", "certImg");
      }
      const data = {
        title: certInput.title,
        issuer: certInput.issuer,
        imageUrl,
        order: 1
      };
      if (certInput.id) {
        await updateDoc(doc(db, "certificates", certInput.id), data);
        showToast("Certificate updated successfully!");
      } else {
        await addDoc(collection(db, "certificates"), { ...data, order: Date.now() });
        showToast("Certificate added successfully!");
      }
      setCertInput({ id: "", title: "", issuer: "", imageUrl: "" });
      if (fileEl) fileEl.value = "";
      setUploadProgress(prev => ({ ...prev, certImg: 0 }));
    } catch (err) {
      console.error(err);
      showToast("Failed to save certificate.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInterestSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        title: interestInput.title,
        icon: interestInput.icon,
        description: interestInput.description,
        order: 1
      };
      if (interestInput.id) {
        await updateDoc(doc(db, "interests", interestInput.id), data);
        showToast("Interest updated successfully!");
      } else {
        await addDoc(collection(db, "interests"), { ...data, order: Date.now() });
        showToast("Interest added successfully!");
      }
      setInterestInput({ id: "", title: "", icon: "fa-rocket", description: "" });
    } catch (err) {
      console.error(err);
      showToast("Failed to save interest.", "error");
    }
  };

  const handleExpSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        role: expInput.role,
        company: expInput.company,
        duration: expInput.duration,
        type: expInput.type,
        description: expInput.description,
        tags: expInput.tags,
        order: 1
      };
      if (expInput.id) {
        await updateDoc(doc(db, "experiences", expInput.id), data);
        showToast("Experience updated successfully!");
      } else {
        await addDoc(collection(db, "experiences"), { ...data, order: Date.now() });
        showToast("Experience added successfully!");
      }
      setExpInput({ id: "", role: "", company: "", duration: "", type: "Internship", description: "", tags: "" });
    } catch (err) {
      console.error(err);
      showToast("Failed to save experience.", "error");
    }
  };

  const handleEduSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        degree: eduInput.degree,
        institution: eduInput.institution,
        duration: eduInput.duration,
        status: eduInput.status,
        description: eduInput.description,
        order: 1
      };
      if (eduInput.id) {
        await updateDoc(doc(db, "education", eduInput.id), data);
        showToast("Education updated successfully!");
      } else {
        await addDoc(collection(db, "education"), { ...data, order: Date.now() });
        showToast("Education added successfully!");
      }
      setEduInput({ id: "", degree: "", institution: "", duration: "", status: "In Progress", description: "" });
    } catch (err) {
      console.error(err);
      showToast("Failed to save education.", "error");
    }
  };

  const deleteItem = async (col, id) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;
    try {
      await deleteDoc(doc(db, col, id));
      showToast("Deleted successfully.");
    } catch (err) {
      console.error(err);
      showToast("Failed to delete entry.", "error");
    }
  };

  return (
    <section id="admin-dashboard" className="admin-section">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Console</span>
          <h2 className="section-title">Admin Dashboard</h2>
          <p style={{ color: "var(--text-secondary)", marginTop: "10px" }}>Configure your portfolio website settings in real-time.</p>
        </div>

        {/* Tab Navigation Menu */}
        <nav className="admin-tab-nav">
          <button 
            className={`admin-tab-btn ${activeTab === "general" ? "active-tab" : ""}`}
            onClick={() => setActiveTab("general")}
          >
            General & Contacts
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === "projects" ? "active-tab" : ""}`}
            onClick={() => setActiveTab("projects")}
          >
            Projects
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === "timeline" ? "active-tab" : ""}`}
            onClick={() => setActiveTab("timeline")}
          >
            Timelines (Exp/Edu)
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === "extras" ? "active-tab" : ""}`}
            onClick={() => setActiveTab("extras")}
          >
            Credentials & Factors
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === "media" ? "active-tab" : ""}`}
            onClick={() => setActiveTab("media")}
          >
            Media Manager
          </button>
        </nav>

        {/* Tab 1: General & Contacts */}
        {activeTab === "general" && (
          <div className="admin-grid">
            <div className="admin-card glass-card">
              <h3>General & SEO Settings</h3>
              <form onSubmit={handleGeneralSubmit}>
                <div className="form-group">
                  <label>Hero Title</label>
                  <input 
                    type="text" 
                    value={generalData.heroTitle || ""}
                    onChange={(e) => setGeneralData({ ...generalData, heroTitle: e.target.value })}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Typing Subtitles (Comma-separated)</label>
                  <input 
                    type="text" 
                    value={generalData.heroTyping || ""}
                    onChange={(e) => setGeneralData({ ...generalData, heroTyping: e.target.value })}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Hero Description</label>
                  <textarea 
                    rows="3"
                    value={generalData.heroDescription || ""}
                    onChange={(e) => setGeneralData({ ...generalData, heroDescription: e.target.value })}
                    required
                  ></textarea>
                </div>
                <div className="form-group">
                  <label>About Lead Line</label>
                  <input 
                    type="text"
                    value={generalData.aboutLead || ""}
                    onChange={(e) => setGeneralData({ ...generalData, aboutLead: e.target.value })}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>About Body Text</label>
                  <textarea 
                    rows="4"
                    value={generalData.aboutBody || ""}
                    onChange={(e) => setGeneralData({ ...generalData, aboutBody: e.target.value })}
                    required
                  ></textarea>
                </div>
                <div className="form-group">
                  <label>Skills (Comma-separated)</label>
                  <textarea 
                    rows="3"
                    value={generalData.skills || ""}
                    onChange={(e) => setGeneralData({ ...generalData, skills: e.target.value })}
                    required
                  ></textarea>
                </div>
                
                <h3 style={{ marginTop: "30px", fontSize: "1.25rem", borderLeft: "3px solid var(--accent-primary)", paddingLeft: "10px" }}>SEO Tags</h3>
                <div className="form-group">
                  <label>Page Title</label>
                  <input 
                    type="text" 
                    value={generalData.seoTitle || ""}
                    onChange={(e) => setGeneralData({ ...generalData, seoTitle: e.target.value })}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Meta Description</label>
                  <textarea 
                    rows="3"
                    value={generalData.seoDescription || ""}
                    onChange={(e) => setGeneralData({ ...generalData, seoDescription: e.target.value })}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Meta Keywords</label>
                  <input 
                    type="text" 
                    value={generalData.seoKeywords || ""}
                    onChange={(e) => setGeneralData({ ...generalData, seoKeywords: e.target.value })}
                    required 
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ marginTop: "15px" }}>Save General Settings</button>
              </form>
            </div>

            <div className="admin-card glass-card">
              <h3>Contact Settings</h3>
              <form onSubmit={handleContactSubmit}>
                <div className="form-group">
                  <label>Email address</label>
                  <input 
                    type="email" 
                    value={generalData.contactEmail || ""}
                    onChange={(e) => setGeneralData({ ...generalData, contactEmail: e.target.value })}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input 
                    type="text" 
                    value={generalData.contactPhone || ""}
                    onChange={(e) => setGeneralData({ ...generalData, contactPhone: e.target.value })}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>LinkedIn profile URL</label>
                  <input 
                    type="text" 
                    value={generalData.contactLinkedIn || ""}
                    onChange={(e) => setGeneralData({ ...generalData, contactLinkedIn: e.target.value })}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Location address</label>
                  <input 
                    type="text" 
                    value={generalData.contactLocation || ""}
                    onChange={(e) => setGeneralData({ ...generalData, contactLocation: e.target.value })}
                    required 
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ marginTop: "15px" }}>Save Contacts</button>
              </form>
            </div>
          </div>
        )}

        {/* Tab 2: Projects */}
        {activeTab === "projects" && (
          <div className="admin-crud-section glass-card" style={{ padding: "40px" }}>
            <h3>Manage Projects</h3>
            <div className="crud-grid">
              <form onSubmit={handleProjectSubmit} className="crud-form">
                <div className="form-group">
                  <label>Project Title</label>
                  <input 
                    type="text" 
                    value={projectInput.title}
                    onChange={(e) => setProjectInput({ ...projectInput, title: e.target.value })}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea 
                    rows="3" 
                    value={projectInput.description}
                    onChange={(e) => setProjectInput({ ...projectInput, description: e.target.value })}
                    required
                  ></textarea>
                </div>
                <div className="form-group">
                  <label>Live URL Link</label>
                  <input 
                    type="url" 
                    value={projectInput.liveLink}
                    onChange={(e) => setProjectInput({ ...projectInput, liveLink: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>GitHub Code Link</label>
                  <input 
                    type="url" 
                    value={projectInput.githubLink}
                    onChange={(e) => setProjectInput({ ...projectInput, githubLink: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Skills Used (Comma-separated)</label>
                  <input 
                    type="text" 
                    value={projectInput.tech}
                    onChange={(e) => setProjectInput({ ...projectInput, tech: e.target.value })}
                    placeholder="Vercel, Firebase, SEO"
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Image asset file</label>
                  <input type="file" id="project-img-file" accept="image/*" />
                  <div className="upload-progress-container">
                    <div className="upload-progress-bar" style={{ width: `${uploadProgress.projectImg}%` }}></div>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                  {projectInput.id ? "Update Project" : "Add Project"}
                </button>
                {projectInput.id && (
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    style={{ marginLeft: "10px" }}
                    onClick={() => setProjectInput({ id: "", title: "", description: "", liveLink: "", githubLink: "", tech: "" })}
                  >
                    Cancel Edit
                  </button>
                )}
              </form>

              <div className="crud-list-container">
                <h4>Current Projects</h4>
                <div className="crud-list">
                  {projects.map(p => (
                    <div key={p.id} className="crud-item glass-card" style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                      {p.imageUrl && (
                        <img 
                          src={p.imageUrl} 
                          alt={p.title} 
                          style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", flexShrink: 0 }} 
                        />
                      )}
                      <div style={{ flexGrow: 1 }}>
                        <strong>{p.title}</strong>
                        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{p.tech}</p>
                      </div>
                      <div className="crud-actions">
                        <button className="btn-edit" onClick={() => setProjectInput(p)}><i className="fa-solid fa-pen"></i></button>
                        <button className="btn-delete" onClick={() => deleteItem("projects", p.id)}><i className="fa-solid fa-trash"></i></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Timelines (Experience & Education) */}
        {activeTab === "timeline" && (
          <div className="admin-grid">
            <div className="admin-card glass-card">
              <h3>Manage Experiences</h3>
              <form onSubmit={handleExpSubmit} className="crud-form" style={{ marginBottom: "32px" }}>
                <div className="form-group">
                  <label>Job Title / Role</label>
                  <input 
                    type="text" 
                    value={expInput.role}
                    onChange={(e) => setExpInput({ ...expInput, role: e.target.value })}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Company Name</label>
                  <input 
                    type="text" 
                    value={expInput.company}
                    onChange={(e) => setExpInput({ ...expInput, company: e.target.value })}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Duration</label>
                  <input 
                    type="text" 
                    value={expInput.duration}
                    onChange={(e) => setExpInput({ ...expInput, duration: e.target.value })}
                    placeholder="June 2026 – Present"
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Job Type Badge</label>
                  <input 
                    type="text" 
                    value={expInput.type}
                    onChange={(e) => setExpInput({ ...expInput, type: e.target.value })}
                    placeholder="Internship"
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea 
                    rows="3" 
                    value={expInput.description}
                    onChange={(e) => setExpInput({ ...expInput, description: e.target.value })}
                    required
                  ></textarea>
                </div>
                <div className="form-group">
                  <label>Skills tags (Comma-separated)</label>
                  <input 
                    type="text" 
                    value={expInput.tags}
                    onChange={(e) => setExpInput({ ...expInput, tags: e.target.value })}
                    placeholder="SEO, Digital Marketing"
                    required 
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  {expInput.id ? "Update Experience" : "Add Experience"}
                </button>
                {expInput.id && (
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    style={{ marginLeft: "10px" }}
                    onClick={() => setExpInput({ id: "", role: "", company: "", duration: "", type: "Internship", description: "", tags: "" })}
                  >
                    Cancel Edit
                  </button>
                )}
              </form>

              <h4>Current Experience</h4>
              <div className="crud-list">
                {experiences.map(e => (
                  <div key={e.id} className="crud-item glass-card">
                    <div>
                      <strong>{e.role} at {e.company}</strong>
                      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{e.duration}</p>
                    </div>
                    <div className="crud-actions">
                      <button className="btn-edit" onClick={() => setExpInput(e)}><i className="fa-solid fa-pen"></i></button>
                      <button className="btn-delete" onClick={() => deleteItem("experiences", e.id)}><i className="fa-solid fa-trash"></i></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="admin-card glass-card">
              <h3>Manage Education</h3>
              <form onSubmit={handleEduSubmit} className="crud-form" style={{ marginBottom: "32px" }}>
                <div className="form-group">
                  <label>Degree / Class Name</label>
                  <input 
                    type="text" 
                    value={eduInput.degree}
                    onChange={(e) => setEduInput({ ...eduInput, degree: e.target.value })}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Institution Name</label>
                  <input 
                    type="text" 
                    value={eduInput.institution}
                    onChange={(e) => setEduInput({ ...eduInput, institution: e.target.value })}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Duration</label>
                  <input 
                    type="text" 
                    value={eduInput.duration}
                    onChange={(e) => setEduInput({ ...eduInput, duration: e.target.value })}
                    placeholder="Aug 2025 – Aug 2029"
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <input 
                    type="text" 
                    value={eduInput.status}
                    onChange={(e) => setEduInput({ ...eduInput, status: e.target.value })}
                    placeholder="In Progress"
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Details / Description</label>
                  <textarea 
                    rows="3" 
                    value={eduInput.description}
                    onChange={(e) => setEduInput({ ...eduInput, description: e.target.value })}
                    required
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-primary">
                  {eduInput.id ? "Update Education" : "Add Education"}
                </button>
                {eduInput.id && (
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    style={{ marginLeft: "10px" }}
                    onClick={() => setEduInput({ id: "", degree: "", institution: "", duration: "", status: "In Progress", description: "" })}
                  >
                    Cancel Edit
                  </button>
                )}
              </form>

              <h4>Current Education</h4>
              <div className="crud-list">
                {education.map(e => (
                  <div key={e.id} className="crud-item glass-card">
                    <div>
                      <strong>{e.degree}</strong>
                      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{e.institution}</p>
                    </div>
                    <div className="crud-actions">
                      <button className="btn-edit" onClick={() => setEduInput(e)}><i className="fa-solid fa-pen"></i></button>
                      <button className="btn-delete" onClick={() => deleteItem("education", e.id)}><i className="fa-solid fa-trash"></i></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Credentials & Factors */}
        {activeTab === "extras" && (
          <div className="admin-grid">
            <div className="admin-card glass-card">
              <h3>Manage Certificates</h3>
              <form onSubmit={handleCertSubmit} className="crud-form" style={{ marginBottom: "32px" }}>
                <div className="form-group">
                  <label>Certificate Title</label>
                  <input 
                    type="text" 
                    value={certInput.title}
                    onChange={(e) => setCertInput({ ...certInput, title: e.target.value })}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Issuer Details</label>
                  <input 
                    type="text" 
                    value={certInput.issuer}
                    onChange={(e) => setCertInput({ ...certInput, issuer: e.target.value })}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Badge file image</label>
                  <input type="file" id="cert-img-file" accept="image/*" />
                  <div className="upload-progress-container">
                    <div className="upload-progress-bar" style={{ width: `${uploadProgress.certImg}%` }}></div>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                  {certInput.id ? "Update Certificate" : "Add Certificate"}
                </button>
                {certInput.id && (
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    style={{ marginLeft: "10px" }}
                    onClick={() => setCertInput({ id: "", title: "", issuer: "", imageUrl: "" })}
                  >
                    Cancel Edit
                  </button>
                )}
              </form>

              <h4>Current Certificates</h4>
              <div className="crud-list">
                {certs.map(c => (
                  <div key={c.id} className="crud-item glass-card" style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                    {c.imageUrl && (
                      <img 
                        src={c.imageUrl} 
                        alt={c.title} 
                        style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", flexShrink: 0 }} 
                      />
                    )}
                    <div style={{ flexGrow: 1 }}>
                      <strong>{c.title}</strong>
                      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{c.issuer}</p>
                    </div>
                    <div className="crud-actions">
                      <button className="btn-edit" onClick={() => setCertInput({ id: c.id, title: c.title, issuer: c.issuer, imageUrl: c.imageUrl || "" })}><i className="fa-solid fa-pen"></i></button>
                      <button className="btn-delete" onClick={() => deleteItem("certificates", c.id)}><i className="fa-solid fa-trash"></i></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="admin-card glass-card">
              <h3>Manage Interests</h3>
              <form onSubmit={handleInterestSubmit} className="crud-form" style={{ marginBottom: "32px" }}>
                <div className="form-group">
                  <label>Interest Title</label>
                  <input 
                    type="text" 
                    value={interestInput.title}
                    onChange={(e) => setInterestInput({ ...interestInput, title: e.target.value })}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>FontAwesome Icon Class</label>
                  <input 
                    type="text" 
                    value={interestInput.icon}
                    onChange={(e) => setInterestInput({ ...interestInput, icon: e.target.value })}
                    placeholder="fa-rocket"
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea 
                    rows="3" 
                    value={interestInput.description}
                    onChange={(e) => setInterestInput({ ...interestInput, description: e.target.value })}
                    required
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-primary">
                  {interestInput.id ? "Update Interest" : "Add Interest"}
                </button>
                {interestInput.id && (
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    style={{ marginLeft: "10px" }}
                    onClick={() => setInterestInput({ id: "", title: "", icon: "fa-rocket", description: "" })}
                  >
                    Cancel Edit
                  </button>
                )}
              </form>

              <h4>Current Interests</h4>
              <div className="crud-list">
                {interests.map(i => (
                  <div key={i.id} className="crud-item glass-card">
                    <div>
                      <strong>{i.title}</strong>
                      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{i.description}</p>
                    </div>
                    <div className="crud-actions">
                      <button className="btn-edit" onClick={() => setInterestInput({ id: i.id, title: i.title, icon: i.icon, description: i.description })}><i className="fa-solid fa-pen"></i></button>
                      <button className="btn-delete" onClick={() => deleteItem("interests", i.id)}><i className="fa-solid fa-trash"></i></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Media uploads */}
        {activeTab === "media" && (
          <div className="admin-card glass-card" style={{ maxWidth: "600px", margin: "0 auto" }}>
            <h3>Media Asset uploads</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "24px" }}>
              Choose files and click "Save Media Assets" to upload and apply changes to your website.
            </p>
            <form onSubmit={handleMediaSubmit} className="crud-form">
              <div className="media-upload-group" style={{ display: "flex", flexDirection: "column", gap: "24px", marginBottom: "20px" }}>
                <div className="form-group">
                  <label style={{ fontWeight: 600 }}>Profile Display Photo</label>
                  {generalData.profilePhotoUrl && (
                    <div style={{ margin: "8px 0" }}>
                      <img 
                        src={generalData.profilePhotoUrl} 
                        alt="Current display photo" 
                        style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "50%", border: "1px solid var(--border-color)" }} 
                      />
                    </div>
                  )}
                  <input type="file" id="profile-photo-file" accept="image/*" onChange={handleProfilePhotoChange} style={{ marginTop: "6px" }} />
                  <div className="upload-progress-container">
                    <div className="upload-progress-bar" style={{ width: `${uploadProgress.profile}%` }}></div>
                  </div>
                </div>
                
                <div className="form-group" style={{ borderTop: "1px solid var(--border-color)", paddingTop: "20px" }}>
                  <label style={{ fontWeight: 600 }}>Resume Document (PDF)</label>
                  {generalData.resumeUrl && (
                    <div style={{ margin: "8px 0" }}>
                      <a 
                        href={generalData.resumeUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        style={{ fontSize: "0.85rem", textDecoration: "underline", color: "var(--accent-primary)" }}
                      >
                        View Current Resume Document <i className="fa-solid fa-up-right-from-square" style={{ fontSize: "0.75rem" }}></i>
                      </a>
                    </div>
                  )}
                  <input type="file" id="resume-pdf-file" accept=".pdf" onChange={handleResumeChange} style={{ marginTop: "6px" }} />
                  <div className="upload-progress-container">
                    <div className="upload-progress-bar" style={{ width: `${uploadProgress.resume}%` }}></div>
                  </div>
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ width: "100%" }}>
                {isLoading ? "Saving & Uploading..." : "Save Media Assets"}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Custom Toast Overlay */}
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          <i className={`fa-solid ${toast.type === "success" ? "fa-circle-check" : "fa-circle-exclamation"}`}></i>
          <span>{toast.message}</span>
        </div>
      )}
    </section>
  );
}
