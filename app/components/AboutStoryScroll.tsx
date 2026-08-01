'use client';

import React from 'react';
import FlowArt, { FlowSection } from '@/components/ui/story-scroll';
import { sbAsset } from '@/lib/supabase';

type Skill = { name: string; icon_url: string };

interface AboutStoryScrollProps {
  skills: Skill[];
  contactEmail: string;
  resumeUrl: string;
}

export default function AboutStoryScroll({ skills, contactEmail, resumeUrl }: AboutStoryScrollProps) {
  return (
    <section id="about" data-nav-section className="w-full">
      <FlowArt aria-label="About Sumit Adak">
        {/* SLIDE 1: ABOUT OVERVIEW */}
        <FlowSection
          aria-label="About SMT"
          style={{ backgroundColor: '#090a0f', color: '#ffffff' }}
          className="border-b border-white/10"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono font-bold uppercase tracking-[0.25em] text-[#a855f7]">
              05 — ABOUT SMT
            </p>
            <span className="text-xs font-mono tracking-widest text-white/50">INDIA BASED</span>
          </div>

          <hr className="my-[1.5vw] border-none border-t border-white/15" />

          <div>
            <h2 className="text-[clamp(3.2rem,10vw,11rem)] font-extrabold leading-[0.88] uppercase tracking-tighter text-white">
              SMT <span className="text-[#a855f7]">aka</span><br />
              SUMIT <span className="text-[#22c55e]">ADAK</span>
            </h2>
          </div>

          <hr className="my-[1.5vw] border-none border-t border-white/15" />

          <div className="mt-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <p className="max-w-[55ch] text-[clamp(1.1rem,2.2vw,1.85rem)] font-light leading-relaxed text-white/90">
              A <strong className="font-semibold text-[#a855f7]">Full Stack Developer</strong> &amp;{' '}
              <strong className="font-semibold text-[#22c55e]">AI Innovator</strong> crafting modern web applications and AI-powered solutions. Building intelligent digital experiences with code, AI, and creativity.
            </p>
            <span className="text-xs font-mono uppercase tracking-[0.3em] text-white/40">
              Scroll down to explore ↓
            </span>
          </div>
        </FlowSection>

        {/* SLIDE 2: WHAT I ENGINEER */}
        <FlowSection
          aria-label="What I Engineer"
          style={{ backgroundColor: '#000000', color: '#ffffff' }}
          className="border-b border-white/10"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono font-bold uppercase tracking-[0.25em] text-[#38bdf8]">
              02 — WHAT I ENGINEER
            </p>
            <span className="text-xs font-mono tracking-widest text-white/50">FULL STACK &amp; AI</span>
          </div>

          <hr className="my-[1.5vw] border-none border-t border-white/20" />

          <div>
            <h2 className="text-[clamp(3.2rem,10vw,11rem)] font-extrabold leading-[0.88] uppercase tracking-tighter">
              ENGINEER<br />
              <span className="text-[#38bdf8]">MODERN</span><br />
              SYSTEMS
            </h2>
          </div>

          <hr className="my-[1.5vw] border-none border-t border-white/20" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-[2.5vw] my-[1vw]">
            <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
              <p className="mb-2 text-sm font-bold uppercase tracking-wider text-[#38bdf8]">01 — Web &amp; Mobile</p>
              <p className="text-[clamp(0.85rem,1.2vw,1.05rem)] leading-relaxed text-white/80">
                Architecting reactive web platforms &amp; cross-platform mobile applications with React, Next.js, React Native, Flutter, PHP &amp; Tailwind CSS.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
              <p className="mb-2 text-sm font-bold uppercase tracking-wider text-[#a855f7]">02 — AI &amp; Intelligent Tools</p>
              <p className="text-[clamp(0.85rem,1.2vw,1.05rem)] leading-relaxed text-white/80">
                Building AI-driven utilities like Interview-AI &amp; AI Code Reviewer that automate workflows, process intelligent data, and solve real-world problems.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
              <p className="mb-2 text-sm font-bold uppercase tracking-wider text-[#22c55e]">03 — Realtime Collaboration</p>
              <p className="text-[clamp(0.85rem,1.2vw,1.05rem)] leading-relaxed text-white/80">
                Designing real-time collaborative applications like interactive digital WhiteBoards, live canvas engines &amp; scalable backend services.
              </p>
            </div>
          </div>

          <p className="mt-auto max-w-[50ch] text-[clamp(0.95rem,1.8vw,1.4rem)] font-light leading-relaxed text-white/75">
            I engineer modern web applications, design seamless user experiences, &amp; build intelligent systems that solve real-world problems.
          </p>
        </FlowSection>

        {/* SLIDE 3: SKILLS & TOOLING */}
        <FlowSection
          aria-label="Skills & Tooling"
          style={{ backgroundColor: '#0b0f19', color: '#ffffff' }}
          className="border-b border-white/10"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono font-bold uppercase tracking-[0.25em] text-[#eab308]">
              03 — TECH STACK &amp; TOOLS
            </p>
            <span className="text-xs font-mono tracking-widest text-white/50">CRAFT &amp; ARSENAL</span>
          </div>

          <hr className="my-[1.5vw] border-none border-t border-white/15" />

          <div>
            <h2 className="text-[clamp(3.2rem,10vw,11rem)] font-extrabold leading-[0.88] uppercase tracking-tighter">
              CRAFT &amp;<br />
              <span className="text-[#eab308]">TOOLING</span>
            </h2>
          </div>

          <hr className="my-[1.5vw] border-none border-t border-white/15" />

          {/* Marquee of Skills */}
          <div className="my-4 overflow-hidden py-4 rounded-2xl bg-black/40 border border-white/10">
            <div className="flex w-max animate-marquee gap-8 items-center px-4">
              {[...skills, ...skills].map((sk, idx) => (
                <div key={idx} className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 whitespace-nowrap">
                  <img src={sbAsset(sk.icon_url)} alt={sk.name} className="w-6 h-6 object-contain" />
                  <span className="text-sm font-medium tracking-wide text-white">{sk.name}</span>
                </div>
              ))}
            </div>
          </div>

          <hr className="my-[1.5vw] border-none border-t border-white/15" />

          <p className="mt-auto max-w-[50ch] text-[clamp(1rem,2vw,1.5rem)] font-light leading-relaxed text-white/80">
            Equipped with modern web frameworks, mobile SDKs, database architecture, and creative visual editing suites to deliver end-to-end products.
          </p>
        </FlowSection>

        {/* SLIDE 4: PHILOSOPHY */}
        <FlowSection
          aria-label="Philosophy"
          style={{ backgroundColor: '#1A3DE8', color: '#ffffff' }}
          className="border-b border-white/10"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono font-bold uppercase tracking-[0.25em] text-white">
              04 — PHILOSOPHY
            </p>
            <span className="text-xs font-mono tracking-widest text-white/70">MINDSET</span>
          </div>

          <hr className="my-[1.5vw] border-none border-t border-white/40" />

          <div>
            <h2 className="text-[clamp(3.2rem,10vw,11rem)] font-extrabold leading-[0.88] uppercase tracking-tighter">
              INSTEAD<br />
              <span className="text-[#facc15]">REDESIGN</span>
            </h2>
          </div>

          <hr className="my-[1.5vw] border-none border-t border-white/40" />

          <div className="my-[2vw]">
            <p className="text-[clamp(1.5rem,4vw,3.5rem)] font-serif italic leading-tight text-white">
              &ldquo;When things <span className="text-[#facc15] not-italic font-sans font-bold">fall</span>,<br />
              Don&apos;t quit —<br />
              Instead <span className="text-[#22c55e] not-italic font-sans font-bold">redesign</span>..!&rdquo;
            </p>
          </div>

          <hr className="my-[1.5vw] border-none border-t border-white/40" />

          <p className="mt-auto max-w-[55ch] text-[clamp(1rem,2vw,1.6rem)] font-light leading-relaxed text-white/90">
            Turning imagination into technology is my passion. Every challenge in code is an opportunity to re-architect and create a cleaner, smarter solution.
          </p>
        </FlowSection>

        {/* SLIDE 5: CONNECT / JOIN */}
        <FlowSection
          aria-label="Connect"
          style={{ backgroundColor: '#050505', color: '#ffffff' }}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono font-bold uppercase tracking-[0.25em] text-[#a855f7]">
              05 — LET&apos;S CONNECT
            </p>
            <span className="text-xs font-mono tracking-widest text-white/50">OPEN FOR COLLABORATION</span>
          </div>

          <hr className="my-[1.5vw] border-none border-t border-white/15" />

          <div>
            <h2 className="text-[clamp(3.2rem,10vw,11rem)] font-extrabold leading-[0.88] uppercase tracking-tighter">
              READY TO<br />
              <span className="text-[#a855f7]">BUILD?</span>
            </h2>
          </div>

          <hr className="my-[1.5vw] border-none border-t border-white/15" />

          <div className="flex flex-wrap items-center gap-4 my-[1vw]">
            <a
              href={`mailto:${contactEmail}`}
              className="px-6 py-3 rounded-full bg-[#a855f7] text-white font-medium text-sm tracking-wider uppercase transition-transform hover:scale-105"
            >
              Email Me →
            </a>
            <a
              href={sbAsset(resumeUrl)}
              target="_blank"
              download="Sumit_Adak_Resume.pdf"
              className="px-6 py-3 rounded-full bg-white/10 border border-white/20 text-white font-medium text-sm tracking-wider uppercase transition-colors hover:bg-white/20"
            >
              Download Resume 📄
            </a>
            <a
              href="/projects"
              className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white/80 font-medium text-sm tracking-wider uppercase transition-colors hover:text-white"
            >
              Explore Projects →
            </a>
          </div>

          <hr className="my-[1.5vw] border-none border-t border-white/15" />

          <p className="mt-auto max-w-[50ch] text-[clamp(1rem,2.2vw,1.6rem)] font-light leading-relaxed text-white/80">
            Got an idea, project, or opportunity? Let&apos;s turn your vision into code.
          </p>
        </FlowSection>
      </FlowArt>
    </section>
  );
}
