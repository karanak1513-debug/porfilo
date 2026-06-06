// Main JavaScript for Karan Kumar Portfolio (Dynamic Firestore-linked version)
import { db } from "./firebase-config.js";
import { 
    doc, 
    onSnapshot, 
    collection, 
    query, 
    orderBy 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    // Reusable Elements
    const heroTitle = document.querySelector(".hero-title");
    const heroDescription = document.getElementById("hero-description-text");
    const heroLocation = document.getElementById("hero-location-text");
    const aboutLead = document.getElementById("about-lead-text");
    const aboutBody = document.getElementById("about-body-text");
    const skillsContainer = document.getElementById("skills-container");
    const projectsContainer = document.getElementById("projects-container");
    const certsContainer = document.getElementById("certificates-container");
    const interestsContainer = document.getElementById("interests-container");
    const experienceContainer = document.getElementById("experience-container");
    const educationContainer = document.getElementById("education-container");
    const contactLocation = document.getElementById("contact-location-text");

    // Typing Animation state
    let words = [
        "Digital Marketing Intern",
        "Website Designer",
        "SEO & AI Tools Specialist",
        "BBA Finance Scholar"
    ];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingTextSpan = document.getElementById("typing-text");
    let typingTimer = null;

    function type() {
        if (!typingTextSpan) return;
        const currentWord = words[wordIndex];
        
        if (isDeleting) {
            typingTextSpan.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typingTextSpan.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
        }

        let delay = 150;
        if (isDeleting) delay /= 2;

        if (!isDeleting && charIndex === currentWord.length) {
            isDeleting = true;
            delay = 2000; // Delay before starting delete
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            delay = 300; // Delay before typing next word
        }

        clearTimeout(typingTimer);
        typingTimer = setTimeout(type, delay);
    }

    // Start initial typing
    typingTimer = setTimeout(type, 500);

    // 1. Dynamic Settings Sync (Hero, About, Skills, Contact, Resume, SEO)
    onSnapshot(doc(db, "portfolio_config", "content"), (docSnap) => {
        if (!docSnap.exists()) return;
        const data = docSnap.data();

        // SEO Page Title & Meta Updates
        if (data.seoTitle) {
            document.title = data.seoTitle;
            const metaTitle = document.getElementById("meta-title");
            if (metaTitle) metaTitle.textContent = data.seoTitle;
            const ogTitle = document.getElementById("og-title");
            if (ogTitle) ogTitle.setAttribute("content", data.seoTitle);
        }
        if (data.seoDescription) {
            const metaDesc = document.getElementById("meta-description");
            if (metaDesc) metaDesc.setAttribute("content", data.seoDescription);
            const ogDesc = document.getElementById("og-description");
            if (ogDesc) ogDesc.setAttribute("content", data.seoDescription);
        }
        if (data.seoKeywords) {
            const metaKeywords = document.getElementById("meta-keywords");
            if (metaKeywords) metaKeywords.setAttribute("content", data.seoKeywords);
        }

        // Hero Content
        if (data.heroTitle && heroTitle) {
            heroTitle.innerHTML = `Hi, I'm <span class="gradient-text">${escapeHTML(data.heroTitle)}</span>`;
        }
        if (data.heroDescription && heroDescription) {
            heroDescription.textContent = data.heroDescription;
        }
        if (data.location && heroLocation) {
            heroLocation.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${escapeHTML(data.location)}`;
        }

        // Typing Words update
        if (data.heroTyping) {
            const newWords = data.heroTyping.split(",").map(w => w.trim()).filter(w => w.length > 0);
            if (newWords.length > 0) {
                words = newWords;
                wordIndex = 0;
                charIndex = 0;
                isDeleting = false;
            }
        }

        // About Content
        if (data.aboutLead && aboutLead) {
            aboutLead.textContent = data.aboutLead;
        }
        if (data.aboutBody && aboutBody) {
            aboutBody.textContent = data.aboutBody;
        }

        // Resume Links
        if (data.resumeUrl) {
            const resumeLinks = document.querySelectorAll(".resume-download-link");
            resumeLinks.forEach(link => {
                link.href = data.resumeUrl;
            });
        }

        // Profile Photo update (optional visual render)
        if (data.profilePhotoUrl) {
            // Replace sphere visual with profile picture if uploaded
            const heroSphere = document.querySelector(".glass-sphere");
            if (heroSphere) {
                heroSphere.style.background = `url('${data.profilePhotoUrl}') center/cover no-repeat`;
                heroSphere.innerHTML = ""; // Clear icons
                heroSphere.style.borderRadius = "50%";
            }
        }

        // Contact details update
        if (contactLocation && data.contactLocation) {
            contactLocation.textContent = data.contactLocation;
        }
        if (data.contactEmail) {
            const emailLink = document.querySelector("a[href^='mailto:']");
            if (emailLink) {
                emailLink.href = `mailto:${data.contactEmail}`;
                emailLink.textContent = data.contactEmail;
            }
            const footerEmailLink = document.querySelector("footer a[href^='mailto:']");
            if (footerEmailLink) footerEmailLink.href = `mailto:${data.contactEmail}`;
        }
        if (data.contactPhone) {
            const phoneLink = document.querySelector("a[href^='tel:']");
            if (phoneLink) {
                phoneLink.href = `tel:${data.contactPhone.replace(/\s+/g, '')}`;
                phoneLink.textContent = data.contactPhone;
            }
            const footerPhoneLink = document.querySelector("footer a[href^='tel:']");
            if (footerPhoneLink) footerPhoneLink.href = `tel:${data.contactPhone.replace(/\s+/g, '')}`;
        }
        if (data.contactLinkedIn) {
            const linkedinLinks = document.querySelectorAll("a[href*='linkedin.com']");
            linkedinLinks.forEach(link => {
                link.href = data.contactLinkedIn;
            });
        }

        // Re-render skills dynamically
        if (data.skills && skillsContainer) {
            renderSkills(data.skills);
        }
    });

    // Skills Render Helper
    function renderSkills(skillsString) {
        const skillsList = skillsString.split(",").map(s => s.trim()).filter(s => s.length > 0);
        
        // Group skills into three columns for display matching design system
        const midPoint1 = Math.ceil(skillsList.length / 3);
        const midPoint2 = Math.ceil((skillsList.length - midPoint1) / 2) + midPoint1;
        
        const cat1 = skillsList.slice(0, midPoint1);
        const cat2 = skillsList.slice(midPoint1, midPoint2);
        const cat3 = skillsList.slice(midPoint2);

        skillsContainer.innerHTML = `
            <!-- Marketing & Branding -->
            <div class="skills-category-card glass-card">
                <div class="category-header">
                    <i class="fa-solid fa-bullseye"></i>
                    <h3>Marketing & Branding</h3>
                </div>
                <div class="skills-list">
                    ${cat1.map(skill => `<div class="skill-pill">${escapeHTML(skill)} <span class="dot"></span></div>`).join("")}
                </div>
            </div>

            <!-- Development & Platforms -->
            <div class="skills-category-card glass-card">
                <div class="category-header">
                    <i class="fa-solid fa-code-branch"></i>
                    <h3>Development & Platforms</h3>
                </div>
                <div class="skills-list">
                    ${cat2.map(skill => `<div class="skill-pill">${escapeHTML(skill)} <span class="dot"></span></div>`).join("")}
                </div>
            </div>

            <!-- Innovation & Design -->
            <div class="skills-category-card glass-card">
                <div class="category-header">
                    <i class="fa-solid fa-robot"></i>
                    <h3>AI & Modern Tools</h3>
                </div>
                <div class="skills-list">
                    ${cat3.map(skill => `<div class="skill-pill">${escapeHTML(skill)} <span class="dot"></span></div>`).join("")}
                </div>
            </div>
        `;
    }

    // 2. Realtime Projects rendering from Firestore
    if (projectsContainer) {
        const qProjects = query(collection(db, "projects"), orderBy("order", "asc"));
        onSnapshot(qProjects, (snapshot) => {
            projectsContainer.innerHTML = "";
            if (snapshot.empty) {
                projectsContainer.innerHTML = '<div class="message-empty">No projects posted yet.</div>';
                return;
            }

            snapshot.forEach((doc) => {
                const project = doc.data();
                const card = document.createElement("article");
                card.className = "project-card glass-card";
                
                const techBadges = project.tech.split(",").map(t => `<span>${escapeHTML(t.trim())}</span>`).join("");
                
                const hasImg = project.imageUrl && project.imageUrl.length > 0;
                const imgStyle = hasImg ? `background: url('${project.imageUrl}') center/cover no-repeat; font-size: 0;` : '';
                const fallbackIcon = hasImg ? '' : `<i class="fa-solid fa-laptop-code"></i>`;

                card.innerHTML = `
                    <div class="project-img-placeholder" style="${imgStyle}">
                        ${fallbackIcon}
                        <div class="project-type">Project</div>
                    </div>
                    <div class="project-info">
                        <h3 class="project-title">${escapeHTML(project.title)}</h3>
                        <p class="project-desc">${escapeHTML(project.description)}</p>
                        <div class="project-tech">
                            ${techBadges}
                        </div>
                        <div class="project-links">
                            ${project.liveLink ? `<a href="${project.liveLink}" target="_blank" rel="noopener" class="project-link-btn">Visit Website <i class="fa-solid fa-up-right-from-square"></i></a>` : ''}
                            ${project.githubLink ? `<a href="${project.githubLink}" target="_blank" rel="noopener" class="project-link-btn" style="margin-left: 15px;"><i class="fa-brands fa-github"></i> Code</a>` : ''}
                        </div>
                    </div>
                `;
                projectsContainer.appendChild(card);
            });
        });
    }

    // 3. Realtime Certifications rendering from Firestore
    if (certsContainer) {
        const qCerts = query(collection(db, "certificates"), orderBy("order", "asc"));
        onSnapshot(qCerts, (snapshot) => {
            certsContainer.innerHTML = "";
            if (snapshot.empty) {
                certsContainer.innerHTML = '<div class="message-empty">No certifications listed yet.</div>';
                return;
            }

            snapshot.forEach((doc) => {
                const cert = doc.data();
                const card = document.createElement("div");
                card.className = "cert-card glass-card";
                
                const hasImg = cert.imageUrl && cert.imageUrl.length > 0;
                const iconContent = hasImg 
                    ? `<img src="${cert.imageUrl}" alt="${escapeHTML(cert.title)}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">` 
                    : `<i class="fa-solid fa-award"></i>`;

                card.innerHTML = `
                    <div class="cert-icon" style="${hasImg ? 'padding: 0; overflow: hidden;' : ''}">
                        ${iconContent}
                    </div>
                    <h3>${escapeHTML(cert.title)}</h3>
                    <p class="cert-issuer">${escapeHTML(cert.issuer)}</p>
                `;
                certsContainer.appendChild(card);
            });
        });
    }

    // 3.1 Realtime Interests rendering from Firestore
    if (interestsContainer) {
        const qInterests = query(collection(db, "interests"), orderBy("order", "asc"));
        onSnapshot(qInterests, (snapshot) => {
            interestsContainer.innerHTML = "";
            snapshot.forEach((doc) => {
                const interest = doc.data();
                const li = document.createElement("li");
                li.innerHTML = `
                    <div class="interest-icon"><i class="fa-solid ${escapeHTML(interest.icon)}"></i></div>
                    <div class="interest-content">
                        <h4>${escapeHTML(interest.title)}</h4>
                        <p>${escapeHTML(interest.description)}</p>
                    </div>
                `;
                interestsContainer.appendChild(li);
            });
        });
    }

    // 3.2 Realtime Experience rendering from Firestore
    if (experienceContainer) {
        const qExp = query(collection(db, "experiences"), orderBy("order", "asc"));
        onSnapshot(qExp, (snapshot) => {
            experienceContainer.innerHTML = "";
            snapshot.forEach((doc) => {
                const exp = doc.data();
                const item = document.createElement("div");
                item.className = "timeline-item";
                
                const tagsHTML = exp.tags ? exp.tags.split(",").map(t => `<span class="tag">${escapeHTML(t.trim())}</span>`).join("") : "";
                
                item.innerHTML = `
                    <div class="timeline-dot"></div>
                    <div class="timeline-card glass-card">
                        <div class="timeline-header">
                            <span class="timeline-date">${escapeHTML(exp.duration)}</span>
                            <span class="company-badge">${escapeHTML(exp.type)}</span>
                        </div>
                        <h3 class="role-title">${escapeHTML(exp.role)}</h3>
                        <h4 class="company-name">${escapeHTML(exp.company)}</h4>
                        <p class="experience-desc">${escapeHTML(exp.description)}</p>
                        <div class="experience-tags">
                            ${tagsHTML}
                        </div>
                    </div>
                `;
                experienceContainer.appendChild(item);
            });
        });
    }

    // 3.3 Realtime Education rendering from Firestore
    if (educationContainer) {
        const qEdu = query(collection(db, "education"), orderBy("order", "asc"));
        onSnapshot(qEdu, (snapshot) => {
            educationContainer.innerHTML = "";
            snapshot.forEach((doc) => {
                const edu = doc.data();
                const item = document.createElement("div");
                item.className = "edu-item glass-card";
                
                item.innerHTML = `
                    <div class="edu-header">
                        <span class="edu-duration">${escapeHTML(edu.duration)}</span>
                        <span class="edu-status">${escapeHTML(edu.status)}</span>
                    </div>
                    <h3>${escapeHTML(edu.degree)}</h3>
                    <h4 class="edu-institution">${escapeHTML(edu.institution)}</h4>
                    <p class="edu-detail">${escapeHTML(edu.description)}</p>
                `;
                educationContainer.appendChild(item);
            });
        });
    }

    // 4. Sticky Navbar Scroll Transition
    const navbar = document.getElementById("navbar");
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    });

    // 5. Mobile Navigation Menu Toggle
    const mobileToggle = document.getElementById("mobile-toggle");
    const navLinks = document.getElementById("nav-links");
    const navItems = document.querySelectorAll(".nav-item");

    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener("click", () => {
            navLinks.classList.toggle("active");
            const icon = mobileToggle.querySelector("i");
            if (navLinks.classList.contains("active")) {
                icon.className = "fa-solid fa-xmark";
            } else {
                icon.className = "fa-solid fa-bars-staggered";
            }
        });
    }

    navItems.forEach(item => {
        item.addEventListener("click", () => {
            if (navLinks) navLinks.classList.remove("active");
            if (mobileToggle) {
                const icon = mobileToggle.querySelector("i");
                icon.className = "fa-solid fa-bars-staggered";
            }
        });
    });

    // Helper text escaping
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
});
