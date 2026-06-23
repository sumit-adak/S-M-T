import type { Metadata } from 'next';
import '@/styles/css/v2.css';
import '@/styles/css/journey.css';
import { sbFetch, sbSetting, sbAsset } from '@/lib/supabase';
import { ASSET_VERSION } from '@/lib/version';
import Scripts from './Scripts';
import Loader from './components/Loader';
import Chrome from './components/Chrome';
import JourneyWrapper from './components/JourneyWrapper';
import ContactCharacter from './components/ContactCharacter';

// Home re-checks Supabase every 120s (mirrors the PHP disk-cache TTL).
export const revalidate = 120;

export const metadata: Metadata = {
  alternates: { canonical: 'https://sumitadak.dev/' },
  openGraph: {
    type: 'website',
    url: 'https://sumitadak.dev/',
    title: 'Sumit Adak ',
    description:
      'Full Stack Developer crafting modern web applications and AI-powered solutions. Building intelligent digital experiences with code, AI, and creativity.',
    images: ['https://sumitadak.dev/assets/sumit-hero.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sumit Adak - Full Stack & AI Developer',
    description:
      'Full Stack Developer crafting modern web applications and AI-powered solutions. Building intelligent digital experiences with code, AI, and creativity.',
    images: ['https://sumitadak.dev/assets/sumit-hero.png'],
  },
};

type Social = { label: string; url: string };
type Stat = { value: number; suffix?: string; label: string; link_text: string; link: string };
type Featured = {
  info: string; name: string; tag: string;
  url?: string | null; video?: string | null; image?: string | null; hover_src: string;
};
type Gallery = { image_url: string; alt?: string | null };
type Skill = { name: string; icon_url: string };

// Internal "projects"/"timeline" → "/projects"; external http(s) passes through.
function navHref(link: string): { href: string; external: boolean } {
  const external = /^https?:\/\//.test(link);
  return { href: external ? link : '/' + link.replace(/^\/+/, ''), external };
}

export default async function Home() {
  // --- Data with identical static fallbacks to index.php ---
  let socials = await sbFetch<Social>('social_links', 'select=*&visible=eq.true&order=sort');
  if (!socials) {
    socials = [
      { label: 'git', url: 'https://github.com/sumit-adak' },
      { label: 'in', url: 'https://www.linkedin.com/in/sumitadak' },
      { label: 'ig', url: 'https://www.instagram.com/async_sumit' },
      { label: 'x', url: 'https://x.com/sumitadak' },
    ];
  }

  let resumeUrl = await sbSetting<string>('resume_url', 'Sumit_Adak_Resume.pdf');
  if (typeof resumeUrl !== 'string') resumeUrl = 'Sumit_Adak_Resume.pdf';

  let contactEmail = await sbSetting<string>('contact_email', 'sumitbackend1@gmail.com');
  if (typeof contactEmail !== 'string' || !contactEmail) contactEmail = 'sumitbackend1@gmail.com';

  const heroCfg = (await sbSetting<any>('hero', {})) || {};
  const heroT1 = heroCfg.title_1 ?? 'Sumit';
  const heroT2 = heroCfg.title_2 ?? 'Adak';
  const heroEyebrow = heroCfg.eyebrow ?? 'full stack developer — AI innovator';
  const heroCopy =
    heroCfg.copy ??
    'Welcome to a digital space that blends code & creativity, where every build tells a story. Engineered with precision & crafted with passion.';

  let stats = await sbSetting<Stat[] | null>('stats', null);
  if (!Array.isArray(stats) || !stats.length) {
    stats = [
      { value: 5, suffix: '', label: 'Developed Live', link_text: 'Coding Projects', link: 'projects' },
      { value: 4, suffix: '', label: 'AI Powered Tools', link_text: 'AI Integrations', link: 'projects' },
      { value: 1, suffix: '', label: 'Live Collaboration App', link_text: 'WhiteBoard', link: 'https://white-board-umber.vercel.app/' },
    ];
  }

  let featured = await sbFetch<Featured>('featured_projects', 'select=*&visible=eq.true&order=sort');
  if (!featured) {
    featured = [
      { info: 'A.I. Tool', name: 'Interview-AI', tag: 'Web Development', url: 'https://github.com/sumit-adak', video: null, image: null, hover_src: 'assets/projects/1.png' },
      { info: 'Collaborative Canvas', name: 'WhiteBoard', tag: 'Realtime Web App', url: 'https://white-board-umber.vercel.app/', video: null, image: null, hover_src: 'assets/projects/12.png' },
      { info: 'A.I. Tool', name: 'AI Code Reviewer', tag: 'Web Development', url: 'https://github.com/sumit-adak', video: null, image: null, hover_src: 'assets/projects/2.png' },
      { info: 'Education', name: 'Edu Hub', tag: 'Web & App Development', url: 'https://github.com/sumit-adak', video: null, image: null, hover_src: 'assets/projects/project-2.png' },
      { info: 'Fintech Ledger', name: 'Banking Ledger System', tag: 'Backend System', url: 'https://github.com/sumit-adak', video: null, image: null, hover_src: 'assets/projects/project-3.png' },
    ];
  } else {
    featured = featured.map(fp => {
      let mapped = fp.hover_src;
      const nameLower = fp.name.toLowerCase();
      if (nameLower.includes('interview-ai') || nameLower.includes('bodo okhrang')) {
        mapped = 'assets/projects/1.png';
      } else if (nameLower.includes('whiteboard') || nameLower.includes('white board') || nameLower.includes('flopshop')) {
        mapped = 'assets/projects/12.png';
      } else if (nameLower.includes('code reviewer') || nameLower.includes('crewspace')) {
        mapped = 'assets/projects/2.png';
      } else if (nameLower.includes('edu hub') || nameLower.includes('kokrajhar university')) {
        mapped = 'assets/projects/project-2.png';
      } else if (nameLower.includes('banking ledger') || nameLower.includes('swrzee')) {
        mapped = 'assets/projects/project-3.png';
      } else if (mapped) {
        if (mapped.includes('1.webp')) mapped = 'assets/projects/1.png';
        else if (mapped.includes('12.webp')) mapped = 'assets/projects/12.png';
        else if (mapped.includes('11.webp')) mapped = 'assets/projects/2.png';
        else if (mapped.includes('2.webp')) mapped = 'assets/projects/project-2.png';
        else if (mapped.includes('3.webp')) mapped = 'assets/projects/project-3.png';
        else mapped = mapped.replace(/\.webp$/, '.png');
      }
      return { ...fp, hover_src: mapped };
    });
  }

  let gallery = await sbFetch<Gallery>('gallery', 'select=*&visible=eq.true&order=sort');
  if (!gallery) {
    gallery = [
      { image_url: 'assets/portfolio/sumit1galary.png', alt: 'Portfolio 1' },
      { image_url: 'assets/portfolio/sumit2galary.png', alt: 'Portfolio 2' },
      { image_url: 'assets/portfolio/sumit3galary.jpeg', alt: 'Portfolio 3' },
      { image_url: 'assets/portfolio/sumit4galary.jpeg', alt: 'Portfolio 4' },
      { image_url: 'assets/portfolio/sumi5galary.jpg', alt: 'Portfolio 5' },
      { image_url: 'assets/portfolio/sumit6galary.jpeg', alt: 'Portfolio 6' },
    ];
  } else {
    gallery = gallery.map(g => {
      let mapped = g.image_url;
      if (mapped.endsWith('portfolio/1.webp') || mapped === 'assets/portfolio/1.webp') {
        mapped = 'assets/portfolio/sumit1galary.png';
      } else if (mapped.endsWith('portfolio/2.webp') || mapped === 'assets/portfolio/2.webp') {
        mapped = 'assets/portfolio/sumit2galary.png';
      } else if (mapped.endsWith('portfolio/3.webp') || mapped === 'assets/portfolio/3.webp') {
        mapped = 'assets/portfolio/sumit3galary.jpeg';
      } else if (mapped.endsWith('portfolio/4.webp') || mapped === 'assets/portfolio/4.webp') {
        mapped = 'assets/portfolio/sumit4galary.jpeg';
      } else if (mapped.endsWith('portfolio/5.webp') || mapped === 'assets/portfolio/5.webp') {
        mapped = 'assets/portfolio/sumi5galary.jpg';
      } else if (mapped.endsWith('portfolio/6.webp') || mapped === 'assets/portfolio/6.webp') {
        mapped = 'assets/portfolio/sumit6galary.jpeg';
      }
      return { ...g, image_url: mapped };
    });
  }

  let skills = await sbFetch<Skill>('skills', 'select=*&visible=eq.true&order=sort');
  if (!skills) {
    const skillFiles: Record<string, string> = {
      'React Native': 'react-native', Flutter: 'flutter', 'Tailwind CSS': 'tailwind', Expo: 'expo',
      PHP: 'php', MySQL: 'mysql', PostgreSQL: 'postgreSQL', 'Adobe Premiere': 'premiere',
      'DaVinci Resolve': 'davinci', CapCut: 'capcut', Figma: 'figma', Krita: 'krita', Canva: 'canva', Jitter: 'jitter',
    };
    skills = Object.entries(skillFiles).map(([name, sf]) => ({ name, icon_url: `assets/skills/${sf}.png` }));
  }

  const gCount = gallery.length;
  const emailGlobals =
    `const EMAIL_PUBLIC_KEY=${JSON.stringify(process.env.EMAILJS_PUBLIC_KEY || '')};` +
    `const EMAIL_SERVICE_ID=${JSON.stringify(process.env.EMAILJS_SERVICE_ID || '')};` +
    `const EMAIL_TEMPLATE_ID=${JSON.stringify(process.env.EMAILJS_TEMPLATE_ID || '')};`;

  return (
    <>
      {/* body class + full-mode loader flag, set before loader.js reads them */}
      <script dangerouslySetInnerHTML={{ __html: "document.body.classList.add('is-loading');document.body.dataset.loader='full';" }} />
      {/* EmailJS config globals (server env → client), exactly like the PHP injection */}
      <script dangerouslySetInnerHTML={{ __html: emailGlobals }} />

      <Loader />
      <Chrome />

      <div className="page">
        {/* ===================== HERO ===================== */}
        <section id="home" className="hero" data-nav-section>
          <header className="site-header">
            <a className="brand" href="/">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 44" width="160" height="44">
                <text x="0" y="32" fontFamily="'Clash Display', 'Arial Black', sans-serif" fontSize="28" fontWeight="700" fill="#FFFFFF" letterSpacing="-0.02em">SMT<tspan fill="#7C3AED">.</tspan></text>
              </svg>
            </a>
            <nav>
              <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#intro">Intro</a></li>
                <li><a href="/projects">Projects</a></li>
                <li><a href="/timeline">Timeline</a></li>
                <li><a href="/blogs">Blogs</a></li>
                <li><a href="#contact">Contact</a></li>
                <li><a href="#about">About</a></li>
              </ul>
            </nav>
            <div className="header-flag"><img src="/assets/india.svg" alt="Made in India" /></div>
          </header>

          <div className="hero-ghost" aria-hidden="true">sumit — sumit</div>

          <div className="hero-inner">
            <div className="hero-left">
              <p className="hero-eyebrow mono">{heroEyebrow}</p>

              <h1 className="hero-title">
                <span className="line"><span className="word">{heroT1}</span></span>
                <span className="line">
                  {heroT1.toLowerCase() !== 'sumit' && (
                    <>
                      <span className="word amp">&amp;</span>&nbsp;
                    </>
                  )}
                  <span className="word">{heroT2}</span>
                </span>
              </h1>

              <svg className="hero-swoosh" viewBox="0 0 420 40" aria-hidden="true">
                <path d="M6 30 C 110 6, 240 6, 300 22 S 400 30, 414 14" />
              </svg>

              <p className="hero-copy">
                {String(heroCopy).split('\n').map((part, i, arr) => (
                  <span key={i}>{part}{i < arr.length - 1 ? <br /> : null}</span>
                ))}
              </p>

              <div className="social-row">
                {socials.map((so, i) => (
                  <a key={i} href={so.url} target="_blank" className="social-icon">{so.label}</a>
                ))}
              </div>

              <div className="cta-row">
                <a href="/Sumit_Adak_Resume.pdf" target="_blank" download="Sumit_Adak_Resume.pdf" className="resume-btn" data-resume-link>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 16L7 11H10V4H14V11H17L12 16ZM6 18V20H18V18H6Z" fill="currentColor" />
                  </svg>
                  resume
                </a>
                <a href="/projects" className="btn-pill cta-secondary">see the work <span className="arr">→</span></a>
              </div>

              <div className="stats">
                {stats.map((st, i) => {
                  const { href, external } = navHref(st.link);
                  return (
                    <div className="stat-item" key={i}>
                      <h2><span className="plus">+</span><span className="count" data-target={Math.trunc(st.value)}>{Math.trunc(st.value)}</span>{st.suffix ?? ''}</h2>
                      <p>{st.label}<br /><a href={href} {...(external ? { target: '_blank' } : {})}>{st.link_text}</a></p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="hero-right">
              <div className="portrait-card">
                <img src="/assets/sumit-hero.png" alt="Sumit Adak Portrait" />
                <span className="portrait-badge">sumit<span className="amber">.</span> — based in india</span>
              </div>
            </div>
          </div>

          <div className="scroll-cue" aria-hidden="true">
            <span>scroll</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="12" y1="2" x2="12" y2="22"></line>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
              <line x1="4.93" y1="19.07" x2="19.07" y2="4.93"></line>
            </svg>
          </div>
        </section>

        {/* ===================== THE JOURNEY 3D EXPERIENCE ===================== */}
        <JourneyWrapper />

        {/* ===================== PORTFOLIO GRID ===================== */}
        <section id="portfolio">
          <div className="section-head">
            <div>
              <p className="section-kicker"><span className="idx">02</span> stills &amp; frames</p>
              <h2 className="section-title">
                <span className="word">the</span> <span className="word amber">gallery</span>
              </h2>
            </div>
            <p className="section-note">a wall of frames — shot, cut &amp; graded by me.</p>
          </div>

          <div className="portfolio">
            <div className="portfolio-grid">
              {gallery.map((g, gi) => (
                <div className={'card' + (gi === gCount - 1 ? ' last-card' : '')} key={gi}>
                  <img src={sbAsset(g.image_url)} alt={g.alt ?? 'Portfolio'} />
                </div>
              ))}
            </div>
            <h2 className="portfolio-title">portfolio</h2>
          </div>
        </section>

        {/* marquee band */}
        <div className="band band-dark" aria-hidden="true">
          <div className="band-track">
            <span className="band-chunk">
              featured <span className="dot"></span> <span className="o">projects</span> <span className="dot"></span>
              selected <span className="dot"></span> <span className="o">work</span> <span className="dot"></span>
              featured <span className="dot"></span> <span className="o">projects</span> <span className="dot"></span>
              selected <span className="dot"></span> <span className="o">work</span> <span className="dot"></span>
            </span>
            <span className="band-chunk">
              featured <span className="dot"></span> <span className="o">projects</span> <span className="dot"></span>
              selected <span className="dot"></span> <span className="o">work</span> <span className="dot"></span>
              featured <span className="dot"></span> <span className="o">projects</span> <span className="dot"></span>
              selected <span className="dot"></span> <span className="o">work</span> <span className="dot"></span>
            </span>
          </div>
        </div>

        {/* ===================== FEATURED PROJECTS ===================== */}
        <section id="project" className="project" data-nav-section>
          <div className="section-head">
            <div>
              <p className="section-kicker"><span className="idx">03</span> selected work</p>
              <h2 className="section-title">
                <span className="word">featured</span> <span className="word amber">projects</span>
              </h2>
            </div>
            <p className="section-note">hover a row for a live preview — click to open.</p>
          </div>

          <div className="preview">
            <div className="preview-img preview-img-1"></div>
            <div className="preview-img preview-img-2"></div>
          </div>
          <div className="menu">
            {featured.map((fp, i) => {
              const dataAttrs: Record<string, string> = {};
              if (fp.url) dataAttrs['data-url'] = fp.url;
              else if (fp.video) dataAttrs['data-video'] = fp.video;
              else if (fp.image) dataAttrs['data-image'] = sbAsset(fp.image);
              return (
                <div className="menu-item" key={i} {...dataAttrs} data-hover-src={sbAsset(fp.hover_src)}>
                  <div className="info"><p>{fp.info}</p></div>
                  <div className="name"><p>{fp.name}</p></div>
                  <div className="tag"><p>{fp.tag}</p></div>
                </div>
              );
            })}

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
          </div>

          <div className="project-cta">
            <a href="/projects" className="btn-pill">view all projects, in detail <span className="arr">→</span></a>
          </div>
        </section>

        {/* marquee band */}
        <div className="band band-light" aria-hidden="true">
          <div className="band-track">
            <span className="band-chunk">
              let&apos;s talk <span className="dot"></span> <span className="o">got a project?</span> <span className="dot"></span>
              let&apos;s talk <span className="dot"></span> <span className="o">got a project?</span> <span className="dot"></span>
              let&apos;s talk <span className="dot"></span> <span className="o">got a project?</span> <span className="dot"></span>
            </span>
            <span className="band-chunk">
              let&apos;s talk <span className="dot"></span> <span className="o">got a project?</span> <span className="dot"></span>
              let&apos;s talk <span className="dot"></span> <span className="o">got a project?</span> <span className="dot"></span>
              let&apos;s talk <span className="dot"></span> <span className="o">got a project?</span> <span className="dot"></span>
            </span>
          </div>
        </div>

        {/* ===================== CONTACT ===================== */}
        <section id="contact" className="contact" data-nav-section>
          <div className="section-head on-dark">
            <div>
              <p className="section-kicker"><span className="idx">04</span> contact</p>
              <h2 className="section-title">
                <span className="word">let&apos;s</span> <span className="word">build</span>
                <span className="word amber">something<span className="coral">.</span></span>
              </h2>
            </div>
            <p className="section-note">avg. reply time: faster than my renders.</p>
          </div>

          <div className="contact-container">
            <div className="contact-image" style={{ transform: 'none', boxShadow: 'none', overflow: 'visible', background: 'transparent' }}>
              <ContactCharacter />
            </div>

            <div className="contact-content">
              <h3 className="gmailTxt">drop a line — <a href={`mailto:${contactEmail}`}>{contactEmail}</a></h3>

              <form id="contactForm">
                <div className="form-row">
                  <div className="form-group">
                    <input type="text" id="name" placeholder=" " required />
                    <label htmlFor="name">Name</label>
                  </div>
                  <div className="form-group">
                    <input type="email" id="email" placeholder=" " required />
                    <label htmlFor="email">Email Address</label>
                  </div>
                </div>

                <div className="selection-group">
                  <label>Category</label>
                  <div className="pills">
                    <button type="button" className="pill-btn active">Project Development</button>
                    <button type="button" className="pill-btn">Visual / Video Editing</button>
                    <button type="button" className="pill-btn">Redesign</button>
                    <button type="button" className="pill-btn">Hire Me</button>
                    <button type="button" className="pill-btn">Others</button>
                  </div>
                </div>

                <div className="form-group message-group">
                  <textarea id="message" placeholder=" " required></textarea>
                  <label htmlFor="message">Your message</label>
                </div>

                <button type="submit" className="submit-btn">send it →</button>
              </form>
            </div>
          </div>
        </section>

        {/* ===================== ABOUT ===================== */}
        <section id="about" className="about" data-nav-section>
          <p className="section-kicker"><span className="idx">05</span> about</p>

          <h2 className="about-statement">
            <span className="w accent">SMT</span> <span className="w">aka</span>
            <span className="w accent">Sumit</span> <span className="w accent">Adak,</span>
            <span className="w">a</span> <span className="w highlight">developer</span> <span className="w">&amp;</span>
            <span className="w highlight">AI</span> <span className="w highlight">innovator.</span>
            <span className="w">I</span> <span className="w">engineer</span>
            <span className="w highlight">modern</span> <span className="w highlight">web</span>
            <span className="w highlight">applications,</span> <span className="w">design</span>
            <span className="w highlight">seamless</span> <span className="w highlight">user</span>
            <span className="w highlight">experiences,</span> <span className="w">&amp;</span>
            <span className="w">build</span> <span className="w highlight">intelligent</span>
            <span className="w highlight">systems</span> <span className="w">that</span>
            <span className="w">solve</span> <span className="w accent">real-world</span>
            <span className="w accent">problems.</span> <span className="w">Turning</span>
            <span className="w highlight">imagination</span> <span className="w">into</span>
            <span className="w highlight">technology</span> <span className="w">is</span>
            <span className="w">my</span> <span className="w accent">passion.</span>
          </h2>

          <div className="logoMarquee">
            <div className="marqueeInner">
              {[0, 1].map((rep) => (
                <div className="logo-set" key={rep}>
                  {skills.map((sk, i) => (
                    <img key={i} src={sbAsset(sk.icon_url)} alt={sk.name} />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <p className="about-quote">
            When things <span className="accent">fall</span>,<br />
            Don&apos;t quit —<br />
            Instead <span className="highlight">redesign</span>..!
          </p>
        </section>

        {/* ===================== FOOTER ===================== */}
        <footer className="site-footer">
          <div className="footer-top">
            <a className="brand" href="/">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 44" width="160" height="44">
                <text x="0" y="32" fontFamily="'Clash Display', 'Arial Black', sans-serif" fontSize="28" fontWeight="700" fill="#050816" letterSpacing="-0.02em">SMT<tspan fill="#7C3AED">.</tspan></text>
              </svg>
            </a>
            <nav>
              <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#intro">Intro</a></li>
                <li><a href="/projects">Projects</a></li>
                <li><a href="/timeline">Timeline</a></li>
                <li><a href="/blogs">Blogs</a></li>
                <li><a href="#contact">Contact</a></li>
                <li><a href="#about">About</a></li>
              </ul>
            </nav>
          </div>

          <div className="footer-giant">
            <span className="row"><span className="ghost">fall back<span className="amber">?</span></span></span>
            <span className="row"><span>redesign<span className="amber">..!</span></span></span>
          </div>

          <div className="footer-bottom">
            <span>© 2026 sumit adak</span>
            <span>engineered with precision — crafted with passion</span>
            <span><a href={`mailto:${contactEmail}`}>{contactEmail}</a></span>
          </div>
        </footer>
      </div>

      <div id="toast-container"></div>

      {/* EmailJS + Crypto-JS SDKs (home contact form) */}
      <Scripts
        src={[
          'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js',
          'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js',
          '/js/loader.js',
          '/js/v2.js',
          '/js/projectScript.js',
          '/js/contactScript.js',
        ]}
        version={ASSET_VERSION}
      />
    </>
  );
}
