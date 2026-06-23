import Script from 'next/script';

// Mirrors the mermaid include in blogs/includes/head_resources.php.
export default function Mermaid() {
  return (
    <>
      <Script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js" strategy="afterInteractive" />
      <Script id="mermaid-init" strategy="afterInteractive">
        {`if(window.mermaid){mermaid.initialize({startOnLoad:true, theme:'neutral'});}`}
      </Script>
    </>
  );
}
