"use client"
import { useEffect, useRef } from "react";

const IMAGES = ["/IMG_9093.jpg", "/30.JPG", "/elora5.jpeg", "/akyere.jpg"];

export function PowerfulHero() {
    const canvasRef = useRef(null);

    useEffect(() => {
    }, []);

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:ital,wght@0,300;0,400;1,300&display=swap');

        :root {
          --gold: #f5c842;
          --cyan: #00c6ff;
          --blue: #0072ff;
          --bg: #020b18;
          --text: #e8f4ff;
          --muted: #8aafc8;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .ph-root {
          position: relative;
          width: 100%;
          min-height: 100vh;
          overflow: hidden;
          font-family: 'DM Sans', sans-serif;
          color: var(--text);
          background: var(--bg);
        }

        .ph-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
        }

        .ph-overlay {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 70% 60% at 20% 50%, rgba(0,114,255,0.12) 0%, transparent 70%),
            radial-gradient(ellipse 50% 40% at 80% 50%, rgba(0,198,255,0.08) 0%, transparent 70%);
          z-index: 1;
          pointer-events: none;
        }

        .ph-inner {
          position: relative;
          z-index: 2;
          max-width: 1280px;
          margin: 0 auto;
          padding: 60px 24px;
          display: grid;
          grid-template-columns: 1fr;
          gap: 48px;
          align-items: center;
        }

        @media (min-width: 1024px) {
          .ph-inner { 
            grid-template-columns: 1.1fr 0.9fr; 
            gap: 64px; 
            padding: 100px 32px;
          }
        }

        .ph-left { display: flex; flex-direction: column; gap: 28px; }

        .ph-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(0,198,255,0.08);
          border: 1px solid rgba(0,198,255,0.25);
          border-radius: 999px;
          padding: 6px 16px;
          font-size: 0.78rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--cyan);
          width: fit-content;
          animation: fadeUp 0.6s ease both;
        }

        .ph-badge-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: var(--cyan);
          box-shadow: 0 0 8px var(--cyan);
          animation: pulse 2s infinite;
        }

        .ph-title {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: clamp(2rem, 4.5vw, 3.4rem);
          line-height: 1.1;
          letter-spacing: -0.02em;
          animation: fadeUp 0.6s 0.1s ease both;
        }

        .ph-title-accent { color: var(--gold); }
        .ph-title-line { display: block; margin-bottom: 0.15em; }

        .ph-desc {
          font-size: 1.05rem;
          line-height: 1.75;
          color: var(--muted);
          max-width: 480px;
          animation: fadeUp 0.6s 0.2s ease both;
        }

        .ph-stats {
          display: flex;
          gap: 32px;
          animation: fadeUp 0.6s 0.3s ease both;
        }

        .ph-stat-num {
          font-family: 'Syne', sans-serif;
          font-size: 1.7rem;
          font-weight: 700;
          color: var(--cyan);
        }

        .ph-stat-label { font-size: 0.8rem; color: var(--muted); }

        .ph-ctas {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          animation: fadeUp 0.6s 0.4s ease both;
        }

        .ph-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 28px;
          border-radius: 8px;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 0.95rem;
          letter-spacing: 0.03em;
          cursor: pointer;
          text-decoration: none;
          border: none;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .ph-btn:hover { transform: translateY(-2px); }

        .ph-btn-primary {
          background: linear-gradient(135deg, var(--blue), var(--cyan));
          color: #fff;
          box-shadow: 0 4px 20px rgba(0,114,255,0.3);
        }

        .ph-btn-primary:hover { 
          box-shadow: 0 8px 25px rgba(0,198,255,0.4);
          filter: brightness(1.1);
        }

        .ph-btn-tg {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.15);
          color: var(--text);
          backdrop-filter: blur(8px);
        }

        .ph-btn-tg:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.3); }

        .ph-trust {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.82rem;
          color: var(--muted);
          animation: fadeUp 0.6s 0.5s ease both;
        }

        .ph-trust-avatars { display: flex; }

        .ph-trust-av {
          width: 28px; height: 28px; border-radius: 50%;
          border: 2px solid var(--bg);
          margin-left: -8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.65rem; font-weight: 700; color: #fff;
        }

        .ph-trust-av:first-child { margin-left: 0; }

        .ph-right {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          padding: 20px 0;
          max-width: 500px;
          margin: 0 auto;
        }

        @media (min-width: 640px) {
          .ph-right { gap: 24px; }
        }

        .ph-hex-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 0.866;
          animation: floatHex var(--dur, 4s) ease-in-out infinite alternate;
        }

        .ph-hex-wrap:nth-child(2) { margin-top: 32px; }
        .ph-hex-wrap:nth-child(4) { margin-top: 32px; }

        @keyframes floatHex {
          from { transform: translateY(0px); }
          to   { transform: translateY(var(--lift, -16px)); }
        }

        .ph-hex-inner {
          position: absolute;
          inset: 0;
          overflow: hidden;
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
          transition: transform 0.4s;
        }

        .ph-hex-wrap:hover .ph-hex-inner { transform: scale(1.05); }

        .ph-hex-inner img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.6s ease;
        }

        .ph-hex-wrap:hover .ph-hex-inner img { transform: scale(1.08); }

        .ph-hex-glow {
          position: absolute;
          inset: -3px;
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
          background: linear-gradient(135deg, var(--cyan), var(--blue), var(--gold));
          z-index: -1;
          opacity: 0.6;
          animation: glowPulse 3s ease-in-out infinite alternate;
        }

        @keyframes glowPulse {
          from { opacity: 0.4; filter: blur(2px); }
          to   { opacity: 0.9; filter: blur(4px); }
        }

        .ph-deco {
          position: absolute;
          pointer-events: none;
          z-index: 1;
        }

        .ph-deco-ring {
          width: 220px; height: 220px;
          border-radius: 50%;
          border: 1px solid rgba(0,198,255,0.12);
          top: 10%; right: -60px;
          animation: spin 20s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse {
          0%,100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

            <section className="ph-root">
                <div className="ph-overlay" />
                <div className="ph-deco ph-deco-ring" />

                <div className="ph-inner">

                    {/* ── LEFT COLUMN ── */}
                    <div className="ph-left">
            <span className="ph-badge">
              <span className="ph-badge-dot" />
              Visa Expert Platform
            </span>

                        <h1 className="ph-title">
                            <span className="ph-title-line">Apply for your visa</span>
                            <span className="ph-title-line">yourself, with</span>
                            <span className="ph-title-line">
                <span className="ph-title-accent">expert guidance.</span>
              </span>
                            <span
                                className="ph-title-line"
                                style={{ fontSize: "0.85em", fontWeight: 400, color: "var(--muted)", marginTop: "12px" }}
                            >
                No agents or middlemen needed.
              </span>
                        </h1>

                        <p className="ph-desc">
                            We walk you through every step of your visa application — from document
                            checklists to submission — with real-time expert support. Save thousands in
                            agency fees and stay in full control of your own application.
                        </p>

                        <div className="ph-stats">
                            <div>
                                <div className="ph-stat-num">12K+</div>
                                <div className="ph-stat-label">Visas approved</div>
                            </div>
                            <div>
                                <div className="ph-stat-num">98%</div>
                                <div className="ph-stat-label">Success rate</div>
                            </div>
                            <div>
                                <div className="ph-stat-num">40+</div>
                                <div className="ph-stat-label">Countries covered</div>
                            </div>
                        </div>

                        <div className="ph-ctas">
                            <a href="/signup" className="ph-btn ph-btn-primary" aria-label="Get started for free">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <title>Arrow right icon</title>
                                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                                    <polyline points="10 17 15 12 10 7"/>
                                    <line x1="15" y1="12" x2="3" y2="12"/>
                                </svg>
                                Get Started Free
                            </a>
                            <a href="https://t.me/your_channel" className="ph-btn ph-btn-tg" aria-label="Join our Telegram channel">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <title>Telegram icon</title>
                                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.088 14.4l-2.95-.924c-.642-.204-.654-.642.136-.953l11.57-4.461c.537-.194 1.006.131.718.186z"/>
                                </svg>
                                Join on Telegram
                            </a>
                        </div>

                        <div className="ph-trust">
                            <div className="ph-trust-avatars">
                                {[
                                    { initials: "AK", bg: "hsl(200,80%,45%)" },
                                    { initials: "EL", bg: "hsl(220,80%,45%)" },
                                    { initials: "JB", bg: "hsl(240,80%,45%)" },
                                    { initials: "MO", bg: "hsl(260,80%,45%)" },
                                ].map((av, i) => (
                                    <div key={i} className="ph-trust-av" style={{ background: av.bg }}>
                                        {av.initials}
                                    </div>
                                ))}
                            </div>
                            <span>Trusted by thousands of applicants across Africa &amp; beyond</span>
                        </div>
                    </div>

                    {/* ── RIGHT COLUMN ── */}
                    <div className="ph-right">
                        {IMAGES.map((src, i) => (
                            <div
                                key={i}
                                className="ph-hex-wrap"
                                style={{
                                    "--dur": `${3.5 + i * 0.7}s`,
                                    "--lift": `${-(12 + i * 4)}px`,
                                }}
                            >
                                <div className="ph-hex-glow" />
                                <div className="ph-hex-inner">
                                    <img src={src} alt={`Visa applicant ${i + 1}`} loading="lazy" />
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </section>
        </>
    );
}