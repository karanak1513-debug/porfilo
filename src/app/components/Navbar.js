"use client";
import React, { useState, useEffect } from "react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);

    // Initial theme load
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  const toggleMobileMenu = () => {
    setIsMobileOpen(prev => !prev);
  };

  const closeMenu = () => {
    setIsMobileOpen(false);
  };

  return (
    <header id="navbar" className={isScrolled ? "scrolled" : ""}>
      <div className="nav-container">
        <a href="#home" className="logo" onClick={closeMenu}>
          <span className="logo-accent">K</span>aran<span className="logo-dot">.</span>
        </a>
        
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <nav className={`nav-links ${isMobileOpen ? "active" : ""}`} id="nav-links">
            <a href="#home" className="nav-item" onClick={closeMenu}>Home</a>
            <a href="#about" className="nav-item" onClick={closeMenu}>About</a>
            <a href="#skills" className="nav-item" onClick={closeMenu}>Skills</a>
            <a href="#experience" className="nav-item" onClick={closeMenu}>Experience</a>
            <a href="#projects" className="nav-item" onClick={closeMenu}>Projects</a>
            <a href="#certifications" className="nav-item" onClick={closeMenu}>Certifications</a>
            <a href="#education" className="nav-item" onClick={closeMenu}>Education</a>
            <a href="#portal" className="nav-item" onClick={closeMenu}>Portal</a>
            <a href="#contact" className="nav-item" onClick={closeMenu}>Contact</a>
          </nav>

          <button className="theme-switch-btn" onClick={toggleTheme} aria-label="Toggle Theme">
            <i className={`fa-solid ${theme === "dark" ? "fa-sun" : "fa-moon"}`}></i>
          </button>

          <button 
            className="mobile-toggle" 
            id="mobile-toggle" 
            aria-label="Toggle Menu"
            onClick={toggleMobileMenu}
          >
            <i className={`fa-solid ${isMobileOpen ? "fa-xmark" : "fa-bars-staggered"}`}></i>
          </button>
        </div>
      </div>
    </header>
  );
}
