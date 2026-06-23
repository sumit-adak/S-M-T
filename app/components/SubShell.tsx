import Loader from './Loader';
import Chrome from './Chrome';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';

/**
 * The shared subpage skeleton used by timeline / blogs / errors.
 *
 * Loader + Chrome are kept OUTSIDE #home on purpose: the subpage CSS hides
 * `.home` with `opacity: 0` until `.is-ready`, and opacity inherits to fixed
 * children — so a loader nested inside .home would itself be invisible during
 * load (blank screen, then a snap). Outside .home it stays visible and the
 * reveal is as smooth as the projects page.
 */
export default function SubShell({
  active = '',
  children,
}: {
  active?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Loader />
      <Chrome />
      <div id="home" className="home">
        <div className="homeContainer">
          <SiteHeader active={active} base="/" />
          {children}
        </div>
        <SiteFooter base="/" />
      </div>
      <div id="toast-container"></div>
    </>
  );
}
