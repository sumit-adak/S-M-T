"use client";

import React, { useState } from 'react';

export default function SiteHeader({ active = '', base = '/' }: { active?: string; base?: string }) {
  const root = base;
  const [navOpen, setNavOpen] = useState(false);

  const toggleNav = () => setNavOpen(!navOpen);
  const closeNav = () => setNavOpen(false);

  return (
    <>
      <header className="site-header">
        <a className="brand" href={root}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 44" width="160" height="44">
            <text x="0" y="32" fontFamily="'Clash Display', 'Arial Black', sans-serif" fontSize="28" fontWeight="700" fill="#FFFFFF" letterSpacing="-0.02em">SMT<tspan fill="#7C3AED">.</tspan></text>
          </svg>
        </a>
        <nav className="desktop-nav">
          <ul>
            <li><a href={root} className={active === 'home' ? 'active' : undefined}>Home</a></li>
            <li><a href={`${root}#intro`}>Intro</a></li>
            <li><a href={`${root}projects`} className={active === 'projects' ? 'active' : undefined}>Projects</a></li>
            <li><a href={`${root}timeline`} className={active === 'timeline' ? 'active' : undefined}>Timeline</a></li>
            <li><a href={`${root}blogs`} className={active === 'blogs' ? 'active' : undefined}>Blogs</a></li>
            <li><a href={`${root}#contact`}>Contact</a></li>
            <li><a href={`${root}#about`}>About</a></li>
          </ul>
        </nav>
        <button 
          className={`nav-toggle-btn ${navOpen ? 'active' : ''}`} 
          onClick={toggleNav}
          aria-label="Toggle navigation"
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>
        <div className="header-flag"><img src={`${root}assets/india.svg`} alt="Made in India" /></div>
      </header>

      <div className={`mobile-nav-overlay ${navOpen ? 'open' : ''}`} onClick={closeNav}>
        <nav className="mobile-nav-menu" onClick={(e) => e.stopPropagation()}>
          <ul>
            <li><a href={root} onClick={closeNav} className={active === 'home' ? 'active' : undefined}>Home</a></li>
            <li><a href={`${root}#intro`} onClick={closeNav}>Intro</a></li>
            <li><a href={`${root}projects`} onClick={closeNav} className={active === 'projects' ? 'active' : undefined}>Projects</a></li>
            <li><a href={`${root}timeline`} onClick={closeNav} className={active === 'timeline' ? 'active' : undefined}>Timeline</a></li>
            <li><a href={`${root}blogs`} onClick={closeNav} className={active === 'blogs' ? 'active' : undefined}>Blogs</a></li>
            <li><a href={`${root}#contact`} onClick={closeNav}>Contact</a></li>
            <li><a href={`${root}#about`} onClick={closeNav}>About</a></li>
          </ul>
          <div className="mobile-nav-footer">
            <img src={`${root}assets/india.svg`} alt="Made in India" />
          </div>
        </nav>
      </div>
    </>
  );
}
