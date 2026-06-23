import type { Metadata } from 'next';
import '@/styles/css/v2.css';
import '@/styles/css/projectsPage.css';
import { sbFetch, sbAsset } from '@/lib/supabase';
import { ASSET_VERSION } from '@/lib/version';
import Scripts from '../Scripts';
import Loader from '../components/Loader';
import Chrome from '../components/Chrome';
import SiteHeader from '../components/SiteHeader';

export const revalidate = 120;

export const metadata: Metadata = {
  title: 'Projects — Sumit Adak',
  description:
    'All projects by Sumit Adak — full stack development, frontend projects, and AI integrations, each in detail.',
  alternates: { canonical: 'https://sumitadak.dev/projects' },
  openGraph: {
    type: 'website',
    url: 'https://sumitadak.dev/projects',
    title: 'Projects — Sumit Adak',
    description: 'Every build and every architecture — the full garage of projects, in detail.',
    images: ['https://sumitadak.dev/assets/sumit-hero.png'],
  },
};

type Project = {
  title: string; cat: string; cat_label: string; img: string; desc: string;
  role: string; stack: string; year: string; action: string;
  url?: string | null; video?: string | null; image?: string | null;
};

const FALLBACK: Project[] = [
  { title: 'Interview-AI', cat: 'development', cat_label: 'A.I. Tool — Career Prep', img: '/assets/projects/1.png', desc: 'An <strong>intelligent career preparation platform</strong> designed to help students and job seekers. The system analyzes skills and experience to generate personalized interview questions, roadmaps, and ATS-friendly resumes.', role: 'Full-stack Developer', stack: 'Next.js · TypeScript · OpenAI · Tailwind · PostgreSQL', year: '2026 — dev', action: 'view source', url: 'https://github.com/sumit-adak' },
  { title: 'WhiteBoard', cat: 'development', cat_label: 'Collaboration — Infinite Canvas', img: '/assets/projects/12.png', desc: 'A modern <strong>collaborative whiteboard platform</strong> built for brainstorming, teaching, and real-time team collaboration. Users sketch ideas and work together on an infinite canvas with live sync.', role: 'Designer & Developer', stack: 'Next.js · TypeScript · Tailwind · Liveblocks · Canvas API', year: '2025 — live', action: 'visit live site', url: 'https://white-board-umber.vercel.app/' },
  { title: 'AI Code Reviewer', cat: 'development', cat_label: 'A.I. Tool — Code Review', img: '/assets/projects/2.png', desc: 'An <strong>AI-powered code review assistant</strong> that helps developers improve quality, security, and performance. Analyzes source code and provides senior-developer level optimization recommendations.', role: 'Creator & Developer', stack: 'React · Next.js · TypeScript · OpenAI API · Node.js', year: '2025 — dev', action: 'view source', url: 'https://github.com/sumit-adak' },
  { title: 'Edu Hub', cat: 'development', cat_label: 'Education — Learning Assistant', img: '/assets/projects/project-2.png', desc: 'A personal <strong>AI learning assistant</strong> designed for students. Helps manage schedules, classes, assignments, and study progress while providing smart educational assistance.', role: 'Web & App Developer', stack: 'Next.js · TypeScript · Node.js · PostgreSQL · OpenAI', year: '2025 — dev', action: 'view source', url: 'https://github.com/sumit-adak' },
  { title: 'Banking Ledger System', cat: 'development', cat_label: 'Fintech — Backend System', img: '/assets/projects/project-3.png', desc: 'A <strong>scalable enterprise-grade backend system</strong> designed for banking transaction management. Focuses on consistency, auditability, security, and high-performance transaction processing.', role: 'Backend Developer', stack: 'Node.js · Express.js · PostgreSQL · Prisma · JWT', year: '2026 — dev', action: 'view source', url: 'https://github.com/sumit-adak' },
  { title: 'Building AI Apps with Next.js', cat: 'video', cat_label: 'Education — Video Tutorial', img: '/assets/projects/project-4.png', desc: 'A comprehensive <strong>video tutorial</strong> explaining how to integrate OpenAI API in Next.js applications, covering API routes, streaming responses, and UI updates.', role: 'Creator & Speaker', stack: 'Next.js · OpenAI · YouTube', year: '2025', action: 'watch the tutorial', url: 'https://github.com/sumit-adak' },
  { title: 'Whiteboard System Architecture', cat: 'video', cat_label: 'Vlog — System Architecture', img: '/assets/projects/1.png', desc: 'A detailed <strong>developer vlog</strong> discussing the architecture and real-time syncing principles used in the collaborative whiteboard system.', role: 'Creator & Presenter', stack: 'System Design · Liveblocks', year: '2025', action: 'watch the devlog', url: 'https://github.com/sumit-adak' },
  { title: 'Portfolio Website Design', cat: 'design', cat_label: 'Portfolio — UI/UX Design', img: '/assets/projects/2.png', desc: 'A clean, modern <strong>UI/UX portfolio design concept</strong> featuring dark mode, glassmorphism, and smooth micro-animations. Designed for high performance and optimal readability.', role: 'UI/UX Designer', stack: 'Figma · CSS', year: '2025', action: 'view the design', image: '/assets/projects/2.png' },
  { title: 'Product Landing Page', cat: 'design', cat_label: 'Marketing — Landing Page', img: '/assets/projects/12.png', desc: 'A conversion-oriented <strong>landing page design</strong> for modern digital products, featuring strong typographic hierarchy, high-contrast layouts, and sleek animations.', role: 'UI/UX Designer', stack: 'Figma · Tailwind', year: '2024', action: 'view the design', image: '/assets/projects/12.png' },
];

const pad2 = (n: number) => String(n).padStart(2, '0');

export default async function Projects() {
  let projects = FALLBACK;
  const rows = await sbFetch<any>('projects', 'select=*&visible=eq.true&order=sort');
  if (rows) {
    projects = rows.map((r) => {
      let mappedImg = r.img;
      const titleLower = r.title.toLowerCase();
      if (titleLower.includes('interview-ai') || titleLower.includes('bodo okhrang')) {
        mappedImg = 'assets/projects/1.png';
      } else if (titleLower.includes('whiteboard') || titleLower.includes('white board') || titleLower.includes('flopshop')) {
        mappedImg = 'assets/projects/12.png';
      } else if (titleLower.includes('code reviewer') || titleLower.includes('crewspace')) {
        mappedImg = 'assets/projects/2.png';
      } else if (titleLower.includes('edu hub') || titleLower.includes('kokrajhar university')) {
        mappedImg = 'assets/projects/project-2.png';
      } else if (titleLower.includes('banking ledger') || titleLower.includes('swrzee')) {
        mappedImg = 'assets/projects/project-3.png';
      } else if (mappedImg) {
        if (mappedImg.includes('1.webp')) mappedImg = 'assets/projects/1.png';
        else if (mappedImg.includes('12.webp')) mappedImg = 'assets/projects/12.png';
        else if (mappedImg.includes('11.webp')) mappedImg = 'assets/projects/2.png';
        else if (mappedImg.includes('2.webp')) mappedImg = 'assets/projects/project-2.png';
        else if (mappedImg.includes('3.webp')) mappedImg = 'assets/projects/project-3.png';
        else mappedImg = mappedImg.replace(/\.webp$/, '.png');
      }

      let mappedImage = r.image;
      if (mappedImage) {
        if (mappedImage.includes('8.webp')) mappedImage = 'assets/projects/2.png';
        else if (mappedImage.includes('10.webp')) mappedImage = 'assets/projects/12.png';
        else if (mappedImage.includes('1.webp')) mappedImage = 'assets/projects/1.png';
        else if (mappedImage.includes('12.webp')) mappedImage = 'assets/projects/12.png';
        else if (mappedImage.includes('11.webp')) mappedImage = 'assets/projects/2.png';
        else if (mappedImage.includes('2.webp')) mappedImage = 'assets/projects/project-2.png';
        else if (mappedImage.includes('3.webp')) mappedImage = 'assets/projects/project-3.png';
        else mappedImage = mappedImage.replace(/\.webp$/, '.png');
      }

      return {
        title: r.title, cat: r.cat, cat_label: r.cat_label, img: sbAsset(mappedImg),
        desc: r.description, role: r.role, stack: r.stack, year: r.year, action: r.action,
        url: r.url, video: r.video, image: mappedImage ? sbAsset(mappedImage) : null,
      };
    });
  }

  const counts: Record<string, number> = { all: projects.length, development: 0, video: 0, design: 0 };
  for (const p of projects) counts[p.cat]++;

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: "document.body.classList.add('is-loading');" }} />
      <Loader />
      <Chrome />

      <div className="page">
        <SiteHeader active="projects" base="/" />

        <section className="garage-hero">
          <div className="hero-ghost" aria-hidden="true">the garage — the garage</div>
          <h1 className="garage-title">
            <span className="line"><span className="word">all</span></span>
            <span className="line"><span className="word amp" style={{ color: 'var(--amber)', fontStyle: 'italic' }}>projects</span><span className="word">,</span></span>
            <span className="line"><span className="word">in detail.</span></span>
          </h1>
          <div className="garage-sub">
            <p>
              Every build and every cut — web platforms, apps, travel films, event recaps
              and design work. Each entry below is the full story: what it is, what I did,
              and what it shipped with.
            </p>
            <span className="garage-count mono">
              <span className="amber">{pad2(counts.all)}</span> entries — &apos;24 to &apos;26
            </span>
          </div>
        </section>

        <div className="filter-bar">
          <span className="lbl">filter /</span>
          <button className="filter-btn active" data-filter="all">all <span className="n">{counts.all}</span></button>
          <button className="filter-btn" data-filter="development">development <span className="n">{counts.development}</span></button>
          <button className="filter-btn" data-filter="video">video <span className="n">{counts.video}</span></button>
          <button className="filter-btn" data-filter="design">design <span className="n">{counts.design}</span></button>
        </div>

        <div className="cases">
          {projects.map((p, i) => {
            const num = pad2(i + 1);
            const dataAttrs: Record<string, string> = {};
            if (p.url) dataAttrs['data-url'] = p.url;
            else if (p.video) dataAttrs['data-video'] = p.video;
            else if (p.image) dataAttrs['data-image'] = p.image;
            return (
              <article className="case" data-cat={p.cat} key={i}>
                <span className="case-num">{num}</span>
                <div className="case-media" data-open-case="" {...dataAttrs}>
                  <img src={p.img} alt={p.title} loading="lazy" />
                  <span className="case-chip" dangerouslySetInnerHTML={{ __html: p.cat_label }} />
                </div>
                <div className="case-body">
                  <p className="case-kicker">{num} / {p.cat}</p>
                  <h2 className="case-title" dangerouslySetInnerHTML={{ __html: p.title }} />
                  <p className="case-desc" dangerouslySetInnerHTML={{ __html: p.desc }} />
                  <dl className="case-meta">
                    <div><dt>role</dt><dd dangerouslySetInnerHTML={{ __html: p.role }} /></div>
                    <div><dt>toolkit</dt><dd dangerouslySetInnerHTML={{ __html: p.stack }} /></div>
                    <div><dt>year</dt><dd dangerouslySetInnerHTML={{ __html: p.year }} /></div>
                  </dl>
                  <div className="case-actions">
                    {p.url ? (
                      <a href={p.url} target="_blank" className="btn-pill" dangerouslySetInnerHTML={{ __html: `${p.action} <span class="arr">→</span>` }} />
                    ) : (
                      <button className="btn-pill" data-open-case="" {...dataAttrs} dangerouslySetInnerHTML={{ __html: `${p.action} <span class="arr">→</span>` }} />
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <section className="garage-outro">
          <h2 className="ot">got an idea that belongs<br />in this <span className="amber">garage?</span></h2>
          <a href="/#contact" className="btn-pill">let&apos;s build it together <span className="arr">→</span></a>
        </section>

        <footer className="site-footer">
          <div className="footer-bottom" style={{ borderTop: 'none', paddingTop: 0 }}>
            <span>© 2026 sumit adak</span>
            <span>engineered with precision — crafted with passion</span>
            <span><a href="/">back to home →</a></span>
          </div>
        </footer>
      </div>

      <div id="mediaModal" className="media-modal">
        <div className="media-content">
          <span id="closeMedia" className="close-btn">&times;</span>
          <video id="popupVideo" controls>
            <source type="video/mp4" />
            Your browser does not support HTML5 video.
          </video>
          <img id="popupImage" alt="Popup Image" />
        </div>
      </div>

      <Scripts src={['/js/loader.js', '/js/projectsPage.js']} version={ASSET_VERSION} />
    </>
  );
}
