import type { Metadata } from 'next';
import '@/styles/css/v2.css';
import '@/styles/css/v2-sub.css';
import '@/styles/css/timelineStyles.css';
import { sbFetch } from '@/lib/supabase';
import { ASSET_VERSION } from '@/lib/version';
import Scripts from '../Scripts';
import SubShell from '../components/SubShell';

export const revalidate = 120;

export const metadata: Metadata = {
  title: 'Timeline - Sumit Adak',
  description:
    'Timeline - Sumit Adak - A Full Stack and AI Developer crafting modern web applications and AI-powered solutions.',
  alternates: { canonical: 'https://sumitadak.dev/timeline/' },
  openGraph: {
    type: 'website', url: 'https://sumitadak.dev/timeline/', title: 'Timeline - Sumit Adak',
    description: 'Welcome to a visual journey that blends code & creativity. Engineered with precision & crafted with passion.',
    images: ['https://sumitadak.dev/assets/sumit-hero.png'],
  },
};

type Ev = { title: string; description: string; tag: string; date_label: string; images: string[] | string };

const FALLBACK: Ev[] = [
  { title: 'Production Systems & Architectures', description: 'Focused on creating production-grade applications including Interview-AI, Edu Hub, AI Code Reviewer, and an Advanced Banking Ledger Backend System. Exploring scalable architectures, API integrations, and software engineering practices.', tag: '2026', date_label: 'Present', images: ['/assets/sumit-hero.png'] },
  { title: 'Entering the AI Development Space', description: 'Transitioned into AI-powered tools, prompt engineering, and intelligent automation systems. Started integrating Large Language Models (LLMs) to create smarter digital solutions.', tag: '2025', date_label: 'Late 2025', images: ['/assets/projects/2.png'] },
  { title: 'Going Full-Stack', description: 'Built real-world applications, worked with databases (PostgreSQL/MySQL), authentication systems, RESTful APIs, and modern frameworks like Next.js.', tag: '2025', date_label: 'Early 2025', images: ['/assets/projects/12.png'] },
  { title: 'Frontend Development & React', description: 'Mastered React, modern frontend development workflows, Git version control, and responsive design principles. Developed multiple interactive user interfaces.', tag: '2024', date_label: '2024', images: ['/assets/projects/2.png'] },
  { title: 'Programming Fundamentals', description: 'Started learning programming and web development fundamentals. Built initial website layouts using HTML, CSS, and vanilla JavaScript.', tag: '2023', date_label: '2023', images: ['/assets/projects/12.png'] },
];

export default async function Timeline() {
  let items = await sbFetch<Ev>('timeline_events', 'select=*&visible=eq.true&order=sort');
  if (!items) items = FALLBACK;

  return (
    <>
      <SubShell active="timeline">
        <div className="timeline-container">
          <div className="timeline-title">
            <div className="code-label">
              <span className="code-fn">console</span><span className="code-dot">.</span><span className="code-method">log</span><span className="code-paren">(</span><span className="code-var">currentLife</span><span className="code-paren">)</span>
            </div>
            <h1>Glory<br />Logged.</h1>
          </div>

          <div className="timeline-progress-wrapper" id="timelineProgressWrapper">
            <svg id="snakeSvg" className="snake-svg" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <path id="snakePathBase" className="snake-path-base" fill="none" stroke="#d1d1d1" strokeWidth="4" />
              <path id="snakePathFill" className="snake-path-fill" fill="none" stroke="#F9B646" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </div>

          <div className="timeline" id="timelineItems">
            {items.map((ev, ti) => {
              const side = ti % 2 === 0 ? 'left' : 'right';
              const rawImgs: string[] = Array.isArray(ev.images)
                ? ev.images
                : (() => { try { const v = JSON.parse(ev.images as string); return Array.isArray(v) ? v : []; } catch { return []; } })();
              
              const imgs = rawImgs.map(img => {
                if (img.includes('11.webp')) return '/assets/projects/2.png';
                if (img.includes('12.webp')) return '/assets/projects/12.png';
                if (img.includes('8.webp')) return '/assets/projects/2.png';
                if (img.includes('10.webp')) return '/assets/projects/12.png';
                if (img.includes('1.webp')) return '/assets/projects/1.png';
                if (img.includes('2.webp')) return '/assets/projects/project-2.png';
                if (img.includes('3.webp')) return '/assets/projects/project-3.png';
                return img;
              });

              return (
                <div className={`timeline-item ${side}`} data-images={JSON.stringify(imgs)} key={ti}>
                  <div className="timeline-content">
                    <div className="tag-row">
                      <span className="tag">{ev.tag}</span>
                      <span className="date">{ev.date_label}</span>
                    </div>
                    <h2>{ev.title}</h2>
                    <p>{ev.description}</p>
                  </div>
                  <div className="timeline-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                  </div>
                  <div className="timeline-image">
                    <div className={'img-slider' + (imgs.length < 2 ? ' single' : '')}>
                      {imgs.map((iu, ii) => (
                        <img src={iu} alt={ev.title} className={'slider-img' + (ii === 0 ? ' active' : '')} key={ii} />
                      ))}
                      <button className="slider-btn slider-prev" aria-label="Previous">&#8249;</button>
                      <button className="slider-btn slider-next" aria-label="Next">&#8250;</button>
                      <div className="slider-dots">
                        {imgs.map((_, ii) => (<span className={'dot' + (ii === 0 ? ' active' : '')} key={ii}></span>))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div id="timelineModal" className="timeline-modal">
          <div className="timeline-modal-content">
            <span className="close-modal">&times;</span>
            <button className="modal-arrow modal-prev" aria-label="Previous">&#8249;</button>
            <img id="timelinePopupImg" alt="Fullscreen Certificate" />
            <button className="modal-arrow modal-next" aria-label="Next">&#8250;</button>
            <div className="modal-dots" id="modalDots"></div>
          </div>
        </div>
      </SubShell>

      <Scripts src={['/js/loader.js', '/js/subpage.js', '/js/timelineScript.js']} version={ASSET_VERSION} />
    </>
  );
}
