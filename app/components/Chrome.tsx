// Port of partials/chrome.php — film grain + custom cursor + scroll progress wheel.
export default function Chrome() {
  return (
    <>
      <div className="grain" aria-hidden="true"></div>
      <div className="cursor-dot" aria-hidden="true"></div>
      <div className="cursor-ring" aria-hidden="true"></div>

      <button className="scroll-wheel" aria-label="Back to top">
        <svg viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" fill="rgba(0,0,0,0.85)" />
          <g className="sw-rotor">
            <circle cx="50" cy="50" r="36" fill="none" stroke="rgba(124, 58, 237, 0.25)" strokeWidth="2" strokeDasharray="4 6" />
            <circle cx="50" cy="50" r="28" fill="none" stroke="rgba(124, 58, 237, 0.4)" strokeWidth="1" />
            <circle cx="50" cy="50" r="6" fill="#7C3AED" />
          </g>
          <circle className="sw-progress" cx="50" cy="50" r="44" />
        </svg>
      </button>
    </>
  );
}
