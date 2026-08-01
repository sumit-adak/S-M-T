"use client";

import React from 'react';
import { Component as KineticNavigation } from '@/components/ui/sterling-gate-kinetic-navigation';

export default function SiteHeader({ base = '/' }: { active?: string; base?: string }) {
  const root = base;

  return (
    <header className="site-header">
      <a className="brand" href={root} aria-label="Home">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 44" width="160" height="44">
          <text x="0" y="32" fontFamily="'Clash Display', 'Arial Black', sans-serif" fontSize="28" fontWeight="700" fill="#FFFFFF" letterSpacing="-0.02em">
            SMT<tspan fill="#7C3AED">.</tspan>
          </text>
        </svg>
      </a>

      <div className="site-header-right">
        <KineticNavigation />
        <div className="header-flag">
          <img src={`${root}assets/india.svg`} alt="Made in India" />
        </div>
      </div>
    </header>
  );
}
