import React from 'react';

const FEATURES = [
  ['🎬', 'Video → Research Doc'],
  ['🎵', 'Music & Sound Analysis'],
  ['📚', 'Curated Playlists'],
  ['🤖', 'Live AI Streaming'],
];

export default function LandingPage({ onStart }) {
  return (
    <div className="landing">
      <div className="landing-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="grid-overlay" />
      </div>

      <div className="landing-content">
        <div className="brand-badge">✦ AI-Powered Learning Platform</div>

        <h1 className="landing-title">
          <span className="title-glow">Lumi</span>
          <span className="title-plain">Q</span>
        </h1>

        <p className="landing-tagline">
          Transform any video into a living research document.<br />
          Transcripts · Music Analysis · Visual Snippets · Community
        </p>

        <div className="landing-features">
          {FEATURES.map(([icon, text]) => (
            <div className="feat-chip" key={text}>
              <span>{icon}</span> {text}
            </div>
          ))}
        </div>

        <button className="btn-primary btn-xl" onClick={onStart}>
          Get Started Free →
        </button>

        <p className="landing-note">No credit card · Instant AI analysis</p>
      </div>
    </div>
  );
}
