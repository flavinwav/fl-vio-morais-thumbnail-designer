"use client";

import { useRef } from "react";

export default function Home() {
  const frameRef = useRef<HTMLIFrameElement>(null);

  function cleanMirrorChrome() {
    const document = frameRef.current?.contentDocument;
    const badge = document?.getElementById("__framer-badge-container");
    if (badge) badge.style.display = "none";
  }

  return (
    <main className="mirror-shell">
      <iframe
        ref={frameRef}
        className="mirror-frame"
        src="/mirror/index.html"
        title="Flávio Morais — Thumbnail and visual designer"
        onLoad={cleanMirrorChrome}
      />
    </main>
  );
}
