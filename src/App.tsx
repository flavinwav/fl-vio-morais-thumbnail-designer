import { useEffect, useRef } from 'react';

function App() {
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const cleanMirrorChrome = () => {
      const badge = frame.contentDocument?.getElementById(
        '__framer-badge-container',
      );
      if (badge) badge.style.display = 'none';
    };

    frame.addEventListener('load', cleanMirrorChrome);
    return () => frame.removeEventListener('load', cleanMirrorChrome);
  }, []);

  return (
    <main className="mirror-shell">
      <iframe
        ref={frameRef}
        className="mirror-frame"
        src={`${import.meta.env.BASE_URL}mirror/index.html?v=godray-full-3`}
        title="Flávio Morais — Thumbnail and visual designer"
      />
    </main>
  );
}

export default App;
