// Port of partials/site_footer.php.
export default function SiteFooter({ base = '/' }: { base?: string }) {
  const root = base;
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <a className="brand" href={root}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 44" width="160" height="44">
            <text x="0" y="32" fontFamily="'Clash Display', 'Arial Black', sans-serif" fontSize="28" fontWeight="700" fill="#050816" letterSpacing="-0.02em">SMT<tspan fill="#7C3AED">.</tspan></text>
          </svg>
        </a>
        <nav>
          <ul>
            <li><a href={root}>Home</a></li>
            <li><a href={`${root}#intro`}>Intro</a></li>
            <li><a href={`${root}projects`}>Projects</a></li>
            <li><a href={`${root}timeline`}>Timeline</a></li>
            <li><a href={`${root}blogs`}>Blogs</a></li>
            <li><a href={`${root}#contact`}>Contact</a></li>
            <li><a href={`${root}#about`}>About</a></li>
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
        <span><a href="mailto:sumitbackend1@gmail.com">sumitbackend1@gmail.com</a></span>
      </div>
    </footer>
  );
}
