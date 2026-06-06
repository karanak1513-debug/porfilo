// Firebase Admin Dashboard Module
import { 
    auth, 
    db, 
    storage 
} from "./firebase-config.js";

import { 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import { 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc, 
    collection, 
    addDoc, 
    deleteDoc, 
    onSnapshot, 
    query, 
    orderBy 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

import { 
    ref, 
    uploadBytesResumable, 
    getDownloadURL 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

document.addEventListener("DOMContentLoaded", () => {
    const adminDashboard = document.getElementById("admin-dashboard");
    const generalForm = document.getElementById("admin-general-form");
    const contactForm = document.getElementById("admin-contact-form");
    const projectForm = document.getElementById("admin-project-form");
    const certForm = document.getElementById("admin-certificate-form");
    const interestForm = document.getElementById("admin-interest-form");
    const experienceForm = document.getElementById("admin-experience-form");
    const educationForm = document.getElementById("admin-education-form");

    const adminProjectsList = document.getElementById("admin-projects-list");
    const adminCertsList = document.getElementById("admin-certs-list");
    const adminInterestsList = document.getElementById("admin-interests-list");
    const adminExperienceList = document.getElementById("admin-experience-list");
    const adminEducationList = document.getElementById("admin-education-list");

    const uploadProfileInput = document.getElementById("upload-profile-photo");
    const uploadResumeInput = document.getElementById("upload-resume-pdf");

    const btnProjectCancel = document.getElementById("btn-project-cancel");
    const btnProjectSubmit = document.getElementById("btn-project-submit");

    const ADMIN_EMAIL = 'karanak1513@gmail.com';
    let isAdminLoggedIn = false;

    // Track active auth state
    onAuthStateChanged(auth, (user) => {
        if (user && user.email === ADMIN_EMAIL) {
            isAdminLoggedIn = true;
            adminDashboard.classList.remove("hidden");
            bootstrapDatabase(); // Initialize data if empty
            loadAdminDashboardData();
        } else {
            isAdminLoggedIn = false;
            adminDashboard.classList.add("hidden");
        }
    });

    // 1. Database Bootstrapper (Fills DB with default values on first Admin Login)
    async function bootstrapDatabase() {
        try {
            const configRef = doc(db, "portfolio_config", "content");
            const configSnap = await getDoc(configRef);

            if (!configSnap.exists()) {
                console.log("Initializing Firestore with default content...");
                
                // Bootstrap general config
                await setDoc(configRef, {
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
                    resumeUrl: "Karan_Kumar_Resume.pdf",
                    seoTitle: "Karan Kumar | Digital Marketing & Web Design Portfolio",
                    seoDescription: "Portfolio of Karan Kumar - Digital Marketing Intern, Website Designer, and SEO & AI Tools Enthusiast. View my work, experience, certifications, and contact details.",
                    seoKeywords: "Karan Kumar, Digital Marketing Intern, Web Designer, SEO Consultant, AI Tools, Geeta University, TalentGrow Global"
                });

                // Bootstrap projects
                const projects = [
                    {
                        title: "K K Moulding Website",
                        description: "A real business website created for K K Moulding to showcase wooden moulding, doors, chaukhat, interior woodwork and business enquiries.",
                        liveLink: "https://kkmoulding.com",
                        githubLink: "",
                        tech: "SEO, AI Tools, Domain setup, Vercel, Firebase, GitHub, Business Website Development, Google Business Profile Optimization",
                        imageUrl: "",
                        order: 1
                    },
                    {
                        title: "Indian Tournament",
                        description: "Tournament website built with modern web tools.",
                        liveLink: "https://indiantournament.vercel.app/",
                        githubLink: "",
                        tech: "GitHub, Vercel, Firebase",
                        imageUrl: "",
                        order: 2
                    },
                    {
                        title: "Portfolio Website",
                        description: "Personal portfolio showcase website.",
                        liveLink: "https://karankumar-portfolio-showcase.lovable.app/",
                        githubLink: "",
                        tech: "HTML5, CSS3, JavaScript",
                        imageUrl: "",
                        order: 3
                    }
                ];

                for (const proj of projects) {
                    await addDoc(collection(db, "projects"), proj);
                }

                // Bootstrap certificates
                const certs = [
                    { title: "AI Enablement Program – AI Level II", issuer: "Credentials validation & AI application competencies.", order: 1 },
                    { title: "Prompt Engineering for Everyone", issuer: "Mastery in prompting LLMs, systemic interactions, and generative workflows.", order: 2 },
                    { title: "Introduction to Generative AI Studio", issuer: "Familiarity with Google Cloud Generative AI and model tuning parameters.", order: 3 },
                    { title: "Leadership Skill Assessment", issuer: "Validated assessment focusing on team alignment, conflict management, and strategic goals.", order: 4 },
                    { title: "Halloween Fiesta 2025 Participation", issuer: "Event coordination, creative direction, and operations certificate.", order: 5 }
                ];

                for (const cert of certs) {
                    await addDoc(collection(db, "certificates"), cert);
                }

                // Bootstrap interests
                const defaultInterests = [
                    { title: "Growth & Marketing", icon: "fa-rocket", description: "Helping brands scale their online presence through optimized funnels and content strategies.", order: 1 },
                    { title: "Modern Web Design", icon: "fa-code", description: "Developing responsive, speedy websites using modern web design from Antigravity, ChatGPT for doubt, and No-Code website tools.", order: 2 },
                    { title: "AI Tool Integration", icon: "fa-wand-magic-sparkles", description: "Applying Prompt Engineering and Generative AI workflows to speed up writing, designing, and research.", order: 3 }
                ];
                for (const item of defaultInterests) {
                    await addDoc(collection(db, "interests"), item);
                }

                // Bootstrap experiences
                const defaultExperiences = [
                    {
                        role: "Digital Marketing Intern",
                        company: "TalentGrow Global",
                        duration: "June 2026 – Present",
                        type: "Internship",
                        description: "Gaining hands-on experience in executing digital marketing campaigns, generating high-quality creative content, managing company and client website assets, developing online brand positioning strategies, applying advanced AI-powered tools to optimize processes, and working directly on real-world business development projects.",
                        tags: "Digital Marketing, Content Creation, Website Management, AI Tools",
                        order: 1
                    }
                ];
                for (const item of defaultExperiences) {
                    await addDoc(collection(db, "experiences"), item);
                }

                // Bootstrap education
                const defaultEducation = [
                    { degree: "BBA Banking and Finance", institution: "Geeta University", duration: "Aug 2025 – Aug 2029", status: "In Progress", description: "Focusing on financial markets, business economics, corporate operations, digital transformations in banking, and digital marketing tools.", order: 1 },
                    { degree: "Class XII (Commerce)", institution: "Rainbow English Senior Secondary School", duration: "May 2024 – Apr 2025", status: "Completed", description: "Studied accountancy, business studies, economics, mathematics, and English.", order: 2 },
                    { degree: "Class X", institution: "Rainbow English Senior Secondary School", duration: "Apr 2022 – May 2023", status: "Completed", description: "General secondary school curriculum with foundational science, mathematics, and humanities courses.", order: 3 }
                ];
                for (const item of defaultEducation) {
                    await addDoc(collection(db, "education"), item);
                }

                console.log("Database successfully bootstrapped!");
            }
        } catch (error) {
            console.error("Bootstrapping error:", error);
        }
    }

    // 2. Load and Prefill Settings Forms
    async function loadAdminDashboardData() {
        try {
            const configRef = doc(db, "portfolio_config", "content");
            const configSnap = await getDoc(configRef);
            if (configSnap.exists()) {
                const data = configSnap.data();
                document.getElementById("admin-hero-title").value = data.heroTitle || "";
                document.getElementById("admin-hero-typing").value = data.heroTyping || "";
                document.getElementById("admin-hero-desc").value = data.heroDescription || "";
                document.getElementById("admin-about-lead").value = data.aboutLead || "";
                document.getElementById("admin-about-body").value = data.aboutBody || "";
                document.getElementById("admin-skills").value = data.skills || "";
                document.getElementById("admin-seo-title").value = data.seoTitle || "";
                document.getElementById("admin-seo-desc").value = data.seoDescription || "";
                document.getElementById("admin-seo-keywords").value = data.seoKeywords || "";

                document.getElementById("admin-contact-email").value = data.contactEmail || "";
                document.getElementById("admin-contact-phone").value = data.contactPhone || "";
                document.getElementById("admin-contact-linkedin").value = data.contactLinkedIn || "";
                document.getElementById("admin-contact-location").value = data.contactLocation || "";
            }

            // Realtime Projects render in Admin
            onSnapshot(query(collection(db, "projects"), orderBy("order", "asc")), (snapshot) => {
                adminProjectsList.innerHTML = "";
                snapshot.forEach((doc) => {
                    const project = doc.data();
                    const id = doc.id;
                    const item = document.createElement("div");
                    item.className = "crud-item glass-card";
                    item.innerHTML = `
                        <div>
                            <strong>${project.title}</strong>
                            <p style="font-size: 0.8rem; color: var(--text-muted);">${project.tech}</p>
                        </div>
                        <div class="crud-actions">
                            <button class="btn-edit" data-id="${id}"><i class="fa-solid fa-pen"></i></button>
                            <button class="btn-delete" data-id="${id}"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    `;
                    
                    // Bind actions
                    item.querySelector(".btn-edit").addEventListener("click", () => editProject(id, project));
                    item.querySelector(".btn-delete").addEventListener("click", () => deleteProject(id));
                    
                    adminProjectsList.appendChild(item);
                });
            });

            // Realtime Certificates render in Admin
            onSnapshot(query(collection(db, "certificates"), orderBy("order", "asc")), (snapshot) => {
                adminCertsList.innerHTML = "";
                snapshot.forEach((doc) => {
                    const cert = doc.data();
                    const id = doc.id;
                    const item = document.createElement("div");
                    item.className = "crud-item glass-card";
                    item.innerHTML = `
                        <div>
                            <strong>${cert.title}</strong>
                            <p style="font-size: 0.8rem; color: var(--text-muted);">${cert.issuer}</p>
                        </div>
                        <div class="crud-actions">
                            <button class="btn-delete" data-id="${id}"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    `;
                    item.querySelector(".btn-delete").addEventListener("click", () => deleteCertificate(id));
                    adminCertsList.appendChild(item);
                });
            });

            // Realtime Interests render in Admin
            onSnapshot(query(collection(db, "interests"), orderBy("order", "asc")), (snapshot) => {
                adminInterestsList.innerHTML = "";
                snapshot.forEach((doc) => {
                    const interest = doc.data();
                    const id = doc.id;
                    const item = document.createElement("div");
                    item.className = "crud-item glass-card";
                    item.innerHTML = `
                        <div>
                            <strong>${interest.title}</strong>
                            <p style="font-size: 0.8rem; color: var(--text-muted);">${interest.description}</p>
                        </div>
                        <div class="crud-actions">
                            <button class="btn-delete" data-id="${id}"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    `;
                    item.querySelector(".btn-delete").addEventListener("click", () => deleteInterest(id));
                    adminInterestsList.appendChild(item);
                });
            });

            // Realtime Experience render in Admin
            onSnapshot(query(collection(db, "experiences"), orderBy("order", "asc")), (snapshot) => {
                adminExperienceList.innerHTML = "";
                snapshot.forEach((doc) => {
                    const exp = doc.data();
                    const id = doc.id;
                    const item = document.createElement("div");
                    item.className = "crud-item glass-card";
                    item.innerHTML = `
                        <div>
                            <strong>${exp.role} at ${exp.company}</strong>
                            <p style="font-size: 0.8rem; color: var(--text-muted);">${exp.duration} (${exp.type})</p>
                        </div>
                        <div class="crud-actions">
                            <button class="btn-delete" data-id="${id}"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    `;
                    item.querySelector(".btn-delete").addEventListener("click", () => deleteExperience(id));
                    adminExperienceList.appendChild(item);
                });
            });

            // Realtime Education render in Admin
            onSnapshot(query(collection(db, "education"), orderBy("order", "asc")), (snapshot) => {
                adminEducationList.innerHTML = "";
                snapshot.forEach((doc) => {
                    const edu = doc.data();
                    const id = doc.id;
                    const item = document.createElement("div");
                    item.className = "crud-item glass-card";
                    item.innerHTML = `
                        <div>
                            <strong>${edu.degree}</strong>
                            <p style="font-size: 0.8rem; color: var(--text-muted);">${edu.institution} - ${edu.duration} (${edu.status})</p>
                        </div>
                        <div class="crud-actions">
                            <button class="btn-delete" data-id="${id}"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    `;
                    item.querySelector(".btn-delete").addEventListener("click", () => deleteEducation(id));
                    adminEducationList.appendChild(item);
                });
            });

        } catch (error) {
            console.error("Error loading admin dashboard content:", error);
        }
    }

    // 3. Save General Settings
    if (generalForm) {
        generalForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const saveBtn = generalForm.querySelector("button[type='submit']");
            saveBtn.disabled = true;

            try {
                await updateDoc(doc(db, "portfolio_config", "content"), {
                    heroTitle: document.getElementById("admin-hero-title").value.trim(),
                    heroTyping: document.getElementById("admin-hero-typing").value.trim(),
                    heroDescription: document.getElementById("admin-hero-desc").value.trim(),
                    aboutLead: document.getElementById("admin-about-lead").value.trim(),
                    aboutBody: document.getElementById("admin-about-body").value.trim(),
                    skills: document.getElementById("admin-skills").value.trim(),
                    seoTitle: document.getElementById("admin-seo-title").value.trim(),
                    seoDescription: document.getElementById("admin-seo-desc").value.trim(),
                    seoKeywords: document.getElementById("admin-seo-keywords").value.trim()
                });
                alert("General settings saved successfully!");
            } catch (error) {
                console.error("Save general settings error:", error);
                alert("Error saving general settings.");
            } finally {
                saveBtn.disabled = false;
            }
        });
    }

    // 4. Save Contact Settings
    if (contactForm) {
        contactForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const saveBtn = contactForm.querySelector("button[type='submit']");
            saveBtn.disabled = true;

            try {
                await updateDoc(doc(db, "portfolio_config", "content"), {
                    contactEmail: document.getElementById("admin-contact-email").value.trim(),
                    contactPhone: document.getElementById("admin-contact-phone").value.trim(),
                    contactLinkedIn: document.getElementById("admin-contact-linkedin").value.trim(),
                    contactLocation: document.getElementById("admin-contact-location").value.trim()
                });
                alert("Contact settings saved successfully!");
            } catch (error) {
                console.error("Save contact settings error:", error);
                alert("Error saving contact settings.");
            } finally {
                saveBtn.disabled = false;
            }
        });
    }

    // 5. File Upload Helper (Firebase Storage + Base64 Fail-safe Fallback)
    async function uploadFile(file, folder, progressId) {
        const progressBar = document.getElementById(progressId);
        if (progressBar) progressBar.style.width = "0%";

        return new Promise(async (resolve, reject) => {
            // First, try Firebase Storage upload
            try {
                const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
                const uploadTask = uploadBytesResumable(storageRef, file);

                uploadTask.on('state_changed', 
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        if (progressBar) progressBar.style.width = `${progress}%`;
                    }, 
                    async (error) => {
                        // Firebase Storage error: fallback to base64 encoding immediately
                        console.warn("Storage upload failed, falling back to Base64 encoding...", error);
                        const base64Data = await convertToBase64(file);
                        if (progressBar) progressBar.style.width = "100%";
                        resolve(base64Data);
                    }, 
                    async () => {
                        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
                        resolve(downloadUrl);
                    }
                );
            } catch (error) {
                // Instantly fallback if Storage initialization failed altogether
                console.warn("Storage ref failed, falling back to Base64...", error);
                const base64Data = await convertToBase64(file);
                if (progressBar) progressBar.style.width = "100%";
                resolve(base64Data);
            }
        });
    }

    function convertToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    // 6. Media upload events
    if (uploadProfileInput) {
        uploadProfileInput.addEventListener("change", async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const fileUrl = await uploadFile(file, "profile", "progress-profile");
                await updateDoc(doc(db, "portfolio_config", "content"), {
                    profilePhotoUrl: fileUrl
                });
                alert("Profile photo updated successfully!");
            } catch (error) {
                console.error("Photo upload error:", error);
                alert("Failed to update profile photo.");
            }
        });
    }

    if (uploadResumeInput) {
        uploadResumeInput.addEventListener("change", async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const fileUrl = await uploadFile(file, "resumes", "progress-resume");
                await updateDoc(doc(db, "portfolio_config", "content"), {
                    resumeUrl: fileUrl
                });
                alert("Resume PDF updated successfully!");
            } catch (error) {
                console.error("Resume upload error:", error);
                alert("Failed to update resume.");
            }
        });
    }

    // 7. Projects CRUD Handlers
    if (projectForm) {
        projectForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const editId = document.getElementById("project-edit-id").value;
            const title = document.getElementById("project-title-input").value.trim();
            const description = document.getElementById("project-desc-input").value.trim();
            const liveLink = document.getElementById("project-live-input").value.trim();
            const githubLink = document.getElementById("project-github-input").value.trim();
            const tech = document.getElementById("project-tech-input").value.trim();
            const imgFile = document.getElementById("project-img-input").files[0];

            setLoadingState(btnProjectSubmit, true);

            try {
                let imageUrl = "";
                if (imgFile) {
                    imageUrl = await uploadFile(imgFile, "projects", "progress-project-img");
                }

                const projectData = {
                    title,
                    description,
                    liveLink,
                    githubLink,
                    tech,
                    order: 1
                };

                if (imageUrl) {
                    projectData.imageUrl = imageUrl;
                }

                if (editId) {
                    // Update
                    const docRef = doc(db, "projects", editId);
                    await updateDoc(docRef, projectData);
                    alert("Project updated successfully!");
                } else {
                    // Create
                    await addDoc(collection(db, "projects"), {
                        ...projectData,
                        imageUrl: imageUrl || "",
                        order: Date.now()
                    });
                    alert("Project added successfully!");
                }

                resetProjectForm();
            } catch (error) {
                console.error("Project save error:", error);
                alert("Error saving project.");
            } finally {
                setLoadingState(btnProjectSubmit, false);
            }
        });
    }

    function editProject(id, project) {
        document.getElementById("project-edit-id").value = id;
        document.getElementById("project-title-input").value = project.title;
        document.getElementById("project-desc-input").value = project.description;
        document.getElementById("project-live-input").value = project.liveLink || "";
        document.getElementById("project-github-input").value = project.githubLink || "";
        document.getElementById("project-tech-input").value = project.tech;
        
        btnProjectSubmit.textContent = "Update Project";
        btnProjectCancel.classList.remove("hidden");
        projectForm.scrollIntoView({ behavior: "smooth" });
    }

    if (btnProjectCancel) {
        btnProjectCancel.addEventListener("click", resetProjectForm);
    }

    function resetProjectForm() {
        projectForm.reset();
        document.getElementById("project-edit-id").value = "";
        btnProjectSubmit.textContent = "Add Project";
        btnProjectCancel.classList.add("hidden");
        document.getElementById("progress-project-img").style.width = "0%";
    }

    async function deleteProject(id) {
        if (!confirm("Are you sure you want to delete this project?")) return;
        try {
            await deleteDoc(doc(db, "projects", id));
            alert("Project deleted successfully.");
        } catch (error) {
            console.error("Delete project error:", error);
            alert("Failed to delete project.");
        }
    }

    // 8. Certificates CRUD Handlers
    if (certForm) {
        certForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const title = document.getElementById("cert-title-input").value.trim();
            const issuer = document.getElementById("cert-issuer-input").value.trim();
            const imgFile = document.getElementById("cert-img-input").files[0];

            if (!imgFile) {
                alert("Certificate image is required.");
                return;
            }

            const btnSubmit = certForm.querySelector("button[type='submit']");
            setLoadingState(btnSubmit, true);

            try {
                const imageUrl = await uploadFile(imgFile, "certificates", "progress-cert-img");
                await addDoc(collection(db, "certificates"), {
                    title,
                    issuer,
                    imageUrl,
                    order: Date.now()
                });
                alert("Certificate added successfully!");
                certForm.reset();
                document.getElementById("progress-cert-img").style.width = "0%";
            } catch (error) {
                console.error("Certificate add error:", error);
                alert("Failed to add certificate.");
            } finally {
                setLoadingState(btnSubmit, false);
            }
        });
    }

    async function deleteCertificate(id) {
        if (!confirm("Are you sure you want to delete this certificate?")) return;
        try {
            await deleteDoc(doc(db, "certificates", id));
            alert("Certificate deleted.");
        } catch (error) {
            console.error("Delete certificate error:", error);
            alert("Failed to delete certificate.");
        }
    }

    // 9. Interests Form Handler & Delete
    if (interestForm) {
        interestForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const title = document.getElementById("interest-title-input").value.trim();
            const icon = document.getElementById("interest-icon-input").value.trim();
            const description = document.getElementById("interest-desc-input").value.trim();

            const btnSubmit = interestForm.querySelector("button[type='submit']");
            setLoadingState(btnSubmit, true);

            try {
                await addDoc(collection(db, "interests"), {
                    title,
                    icon,
                    description,
                    order: Date.now()
                });
                alert("Interest added successfully!");
                interestForm.reset();
            } catch (error) {
                console.error("Interest add error:", error);
                alert("Failed to add interest.");
            } finally {
                setLoadingState(btnSubmit, false);
            }
        });
    }

    async function deleteInterest(id) {
        if (!confirm("Are you sure you want to delete this interest?")) return;
        try {
            await deleteDoc(doc(db, "interests", id));
            alert("Interest deleted.");
        } catch (error) {
            console.error("Delete interest error:", error);
            alert("Failed to delete interest.");
        }
    }

    // 10. Experience Form Handler & Delete
    if (experienceForm) {
        experienceForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const role = document.getElementById("exp-role-input").value.trim();
            const company = document.getElementById("exp-company-input").value.trim();
            const duration = document.getElementById("exp-duration-input").value.trim();
            const type = document.getElementById("exp-type-input").value.trim();
            const description = document.getElementById("exp-desc-input").value.trim();
            const tags = document.getElementById("exp-tags-input").value.trim();

            const btnSubmit = experienceForm.querySelector("button[type='submit']");
            setLoadingState(btnSubmit, true);

            try {
                await addDoc(collection(db, "experiences"), {
                    role,
                    company,
                    duration,
                    type,
                    description,
                    tags,
                    order: Date.now()
                });
                alert("Experience added successfully!");
                experienceForm.reset();
            } catch (error) {
                console.error("Experience add error:", error);
                alert("Failed to add experience.");
            } finally {
                setLoadingState(btnSubmit, false);
            }
        });
    }

    async function deleteExperience(id) {
        if (!confirm("Are you sure you want to delete this experience?")) return;
        try {
            await deleteDoc(doc(db, "experiences", id));
            alert("Experience deleted.");
        } catch (error) {
            console.error("Delete experience error:", error);
            alert("Failed to delete experience.");
        }
    }

    // 11. Education Form Handler & Delete
    if (educationForm) {
        educationForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const degree = document.getElementById("edu-degree-input").value.trim();
            const institution = document.getElementById("edu-institution-input").value.trim();
            const duration = document.getElementById("edu-duration-input").value.trim();
            const status = document.getElementById("edu-status-input").value.trim();
            const description = document.getElementById("edu-desc-input").value.trim();

            const btnSubmit = educationForm.querySelector("button[type='submit']");
            setLoadingState(btnSubmit, true);

            try {
                await addDoc(collection(db, "education"), {
                    degree,
                    institution,
                    duration,
                    status,
                    description,
                    order: Date.now()
                });
                alert("Education history added successfully!");
                educationForm.reset();
            } catch (error) {
                console.error("Education add error:", error);
                alert("Failed to add education.");
            } finally {
                setLoadingState(btnSubmit, false);
            }
        });
    }

    async function deleteEducation(id) {
        if (!confirm("Are you sure you want to delete this education entry?")) return;
        try {
            await deleteDoc(doc(db, "education", id));
            alert("Education entry deleted.");
        } catch (error) {
            console.error("Delete education error:", error);
            alert("Failed to delete education entry.");
        }
    }

    function setLoadingState(btn, isLoading) {
        if (!btn) return;
        btn.disabled = isLoading;
        if (isLoading) {
            btn.dataset.text = btn.textContent;
            btn.textContent = "Saving...";
        } else {
            btn.textContent = btn.dataset.text || "Save";
        }
    }
});
