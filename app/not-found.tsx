import type { Metadata } from 'next';
import Script from 'next/script';
import '@/styles/css/v2.css';
import '@/styles/css/v2-sub.css';
import '@/styles/css/timelineStyles.css';
import '@/styles/css/errorStyles.css';
import { ASSET_VERSION } from '@/lib/version';
import Scripts from './Scripts';
import SubShell from './components/SubShell';

export const metadata: Metadata = { title: '404 Not Found - Sumit Adak' };

export default function NotFound() {
  return (
    <>
      <SubShell>
        <div className="error-container interactive-404">
          <div className="error-code">4<span className="error-highlight">0</span>4</div>
          <h1 className="error-title">Page Not Found</h1>
          <p className="error-message">Oops! Looks like you took a wrong turn. The page you are looking for has been moved, deleted, or possibly never existed.</p>
          <div className="error-actions">
            <a href="/" className="error-btn primary">Return Home</a>
            <a href="/#project" className="error-btn secondary">View Projects</a>
          </div>
        </div>
      </SubShell>

      <Scripts src={['/js/loader.js', '/js/subpage.js']} version={ASSET_VERSION} />
      <Script id="error-anim" strategy="afterInteractive">
        {`if(window.gsap){gsap.to(".error-highlight",{y:-20,duration:1,yoyo:true,repeat:-1,ease:"power1.inOut"});gsap.from(".error-container > *",{y:30,opacity:0,duration:0.8,stagger:0.1,ease:"power2.out"});}`}
      </Script>
    </>
  );
}
