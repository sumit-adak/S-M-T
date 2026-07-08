import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import '@/styles/css/v2.css';
import '@/styles/css/v2-sub.css';
import '@/styles/css/caseStudy.css';
import SubShell from '@/app/components/SubShell';
import Scripts from '@/app/Scripts';
import { ASSET_VERSION } from '@/lib/version';

type CaseStudy = {
  title: string;
  kicker: string;
  heroImage: string;
  role: string;
  stack: string;
  year: string;
  client: string;
  summary: string;
  problem: string;
  solution: string;
  results: string[];
};

const CASE_STUDIES: Record<string, CaseStudy> = {
  'interview-ai': {
    title: 'Interview-AI',
    kicker: 'AI-Powered Career Prep',
    heroImage: '/assets/projects/1.webp',
    role: 'Full-stack Developer',
    stack: 'Next.js · TypeScript · OpenAI · Tailwind · PostgreSQL',
    year: '2026',
    client: 'Career Prep Initiative',
    summary: 'An intelligent platform helping candidates practice mock interviews, transcribe responses, and receive real-time, constructive speech evaluations.',
    problem: 'Job seekers lack accessible, high-quality, and personalized interview preparation. Mock interviews with human coaches are expensive, and generic question lists fail to prepare candidates for specific, dynamic role requirements.',
    solution: 'Designed and built Interview-AI, which generates tailored mock interview questions based on the candidate\'s resume and target job description. The platform records voice answers, performs speech-to-text transcribing, and uses LLMs to evaluate tone, correctness, grammar, and delivery, delivering a detailed feedback scorecard.',
    results: [
      'Successfully simulated hundreds of customized role-specific interview queries.',
      'Reduced candidate interview anxiety and improved answer structuring using feedback loops.',
      'Accelerated resume-matching accuracy for target applications.',
    ],
  },
  'whiteboard': {
    title: 'WhiteBoard',
    kicker: 'Collaboration — Infinite Canvas',
    heroImage: '/assets/projects/12.webp',
    role: 'Designer & Developer',
    stack: 'Next.js · TypeScript · Tailwind · Liveblocks · Canvas API',
    year: '2025',
    client: 'Personal Project',
    summary: 'A modern, real-time collaborative digital whiteboard optimized with custom rendering for low-latency sketch sync on an infinite canvas.',
    problem: 'Existing collaborative boards often suffer from lag, cursor mismatches, or clunky user interfaces, hindering creative flow during design workshops and teaching sessions.',
    solution: 'Engineered a highly responsive infinite canvas using the HTML5 Canvas API and React. Integrated Liveblocks for real-time WebSocket sync of draw paths, shapes, text, and mouse pointer states, keeping latency below 50ms.',
    results: [
      'Achieved smooth real-time rendering for multiple concurrent active users.',
      'Engineered an intuitive vector sketching and shape creation toolbar.',
      'Reduced synchronization packet size for low-bandwidth connections.',
    ],
  },
  'banking-ledger': {
    title: 'Banking Ledger System',
    kicker: 'Fintech — Backend System',
    heroImage: '/assets/projects/project-3.webp',
    role: 'Backend Developer',
    stack: 'Node.js · Express.js · PostgreSQL · Prisma · JWT',
    year: '2026',
    client: 'Financial Tech Lab',
    summary: 'A scalable, double-entry banking ledger backend guaranteeing financial compliance, auditing accuracy, and crash-resilient transaction logs.',
    problem: 'Transactional systems require strict guarantees against double-spending, data corruption, and race conditions under highly concurrent API traffic.',
    solution: 'Designed and implemented a relational schema enforcing double-entry bookkeeping constraints. Leveraged PostgreSQL serializable transaction isolation levels and row-level locking via Prisma to guarantee absolute data consistency and auditability.',
    results: [
      'Ensured 100% data accuracy across test transaction logs under heavy load conditions.',
      'Implemented full audit trails tracking every ledger change.',
      'Optimized query performance for ledger history fetches.',
    ],
  },
};

export async function generateStaticParams() {
  return [
    { slug: 'interview-ai' },
    { slug: 'whiteboard' },
    { slug: 'banking-ledger' },
  ];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const study = CASE_STUDIES[slug];
  if (!study) return {};
  
  return {
    title: `${study.title} Case Study - Sumit Adak`,
    description: study.summary,
    alternates: { canonical: `https://sumitadak.dev/projects/${slug}/` },
  };
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const study = CASE_STUDIES[slug];
  
  if (!study) {
    notFound();
  }

  return (
    <>
      <SubShell active="projects">
        <main className="case-study-container">
          <Link href="/projects" className="case-study-back">
            <span>←</span> back to projects
          </Link>

          <header className="case-study-header">
            <span className="case-study-kicker">{study.kicker}</span>
            <h1 className="case-study-title">{study.title}</h1>
          </header>

          <div className="case-study-meta-grid">
            <div className="case-study-meta-item">
              <h4>Role</h4>
              <p>{study.role}</p>
            </div>
            <div className="case-study-meta-item">
              <h4>Stack</h4>
              <p>{study.stack}</p>
            </div>
            <div className="case-study-meta-item">
              <h4>Year</h4>
              <p>{study.year}</p>
            </div>
            <div className="case-study-meta-item">
              <h4>Client</h4>
              <p>{study.client}</p>
            </div>
          </div>

          <div className="case-study-hero-img">
            <Image 
              src={study.heroImage} 
              alt={study.title} 
              width={900} 
              height={500} 
              priority
              sizes="(max-width: 900px) 100vw, 900px"
              style={{ objectFit: 'cover' }}
            />
          </div>

          <section className="case-study-section">
            <h2>Overview</h2>
            <p>{study.summary}</p>
          </section>

          <section className="case-study-section">
            <h2>The Challenge</h2>
            <p>{study.problem}</p>
          </section>

          <section className="case-study-section">
            <h2>The Solution</h2>
            <p>{study.solution}</p>
          </section>

          <section className="case-study-section">
            <h2>Key Results</h2>
            <ul>
              {study.results.map((res, idx) => (
                <li key={idx}>{res}</li>
              ))}
            </ul>
          </section>
        </main>
      </SubShell>
      <Scripts src={['/js/loader.js', '/js/subpage.js']} version={ASSET_VERSION} />
    </>
  );
}
