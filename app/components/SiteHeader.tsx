// Port of partials/site_header.php. base is "/" site-root; active highlights a tab.
export default function SiteHeader({ active = '', base = '/' }: { active?: string; base?: string }) {
  const root = base;
  return (
    <header className="site-header">
      <a className="brand" href={root}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 44" width="160" height="44">
          <text x="0" y="32" fontFamily="'Clash Display', 'Arial Black', sans-serif" fontSize="28" fontWeight="700" fill="#FFFFFF" letterSpacing="-0.02em">SMT<tspan fill="#7C3AED">.</tspan></text>
        </svg>
      </a>
      <nav>
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
      <div className="header-flag"><img src={`${root}assets/india.svg`} alt="Made in India" /></div>
    </header>
  );
}
