"use client"
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useTheme } from "next-themes";
import {SignupSheet} from "@/components/auth/SignupSheet";

const IMAGES = ["/IMG_9093.jpg", "/30.JPG", "/elora5.jpeg", "/akyere.jpg"];

export function PowerfulHeroTwo() {
    const canvasRef = useRef(null);
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const isDark = resolvedTheme === "dark";

        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const scene = new THREE.Scene();
        // Theme-responsive background
        scene.background = new THREE.Color(isDark ? 0x050510 : 0xf8fafc);

        const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 2000);
        camera.position.z = 100;

        // --- BACKGROUND ANIMATION (Starfield / Nebula) ---
        const starCount = isDark ? 3000 : 1500; // Fewer stars in light mode for a cleaner look
        const starGeometry = new THREE.BufferGeometry();
        const starPositions = new Float32Array(starCount * 3);
        const starColors = new Float32Array(starCount * 3);

        const darkPalette = [
            new THREE.Color(0x4444ff), // blue
            new THREE.Color(0x00ffff), // cyan
            new THREE.Color(0xff00ff), // magenta
            new THREE.Color(0xffffff), // white
        ];

        const lightPalette = [
            new THREE.Color(0x6366f1), // indigo
            new THREE.Color(0x3b82f6), // blue
            new THREE.Color(0x06b6d4), // cyan
            new THREE.Color(0x8b5cf6), // violet
        ];

        const colorPalette = isDark ? darkPalette : lightPalette;

        for (let i = 0; i < starCount; i++) {
            starPositions[i * 3] = (Math.random() - 0.5) * 1000;
            starPositions[i * 3 + 1] = (Math.random() - 0.5) * 1000;
            starPositions[i * 3 + 2] = (Math.random() - 0.5) * 1000;

            const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
            starColors[i * 3] = color.r;
            starColors[i * 3 + 1] = color.g;
            starColors[i * 3 + 2] = color.b;
        }

        starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

        const starMaterial = new THREE.PointsMaterial({
            size: isDark ? 1.5 : 2,
            vertexColors: true,
            transparent: true,
            opacity: isDark ? 0.8 : 0.4,
            sizeAttenuation: true
        });

        const stars = new THREE.Points(starGeometry, starMaterial);
        scene.add(stars);

        // --- FLYING PLANES ---
        const planes = [];
        const planeMaterial = new THREE.MeshPhongMaterial({
            color: isDark ? 0xffffff : 0x4f46e5,
            flatShading: true,
            side: THREE.DoubleSide
        });

        // --- ROTATING GLOBE (World Map) ---
        // We'll use a wireframe sphere for a stylized "World Map" look
        const globeGroup = new THREE.Group();
        const globeGeo = new THREE.SphereGeometry(60, 32, 32);
        const globeWireframeMat = new THREE.MeshPhongMaterial({
            color: isDark ? 0x6366f1 : 0x4f46e5,
            wireframe: true,
            transparent: true,
            opacity: isDark ? 0.3 : 0.15,
        });
        const globe = new THREE.Mesh(globeGeo, globeWireframeMat);
        globeGroup.add(globe);

        // Add a soft glow inner sphere
        const innerGlobeGeo = new THREE.SphereGeometry(59, 32, 32);
        const innerGlobeMat = new THREE.MeshPhongMaterial({
            color: isDark ? 0x1e293b : 0xe2e8f0,
            transparent: true,
            opacity: isDark ? 0.2 : 0.1,
        });
        const innerGlobe = new THREE.Mesh(innerGlobeGeo, innerGlobeMat);
        globeGroup.add(innerGlobe);

        globeGroup.position.set(0, 0, -50); // Position it behind the text and images
        scene.add(globeGroup);

        // Simple Paper Plane Shape
        const planeBodyGeo = new THREE.BufferGeometry();
        const vertices = new Float32Array([
            0, 0, 10,   // nose
            -5, 0, -5,  // left wing back
            0, 2, -3,   // top back
            5, 0, -5,   // right wing back
            0, 0, -2    // tail
        ]);
        const indices = [
            0, 1, 2,
            0, 2, 3,
            0, 3, 4,
            0, 4, 1,
            1, 4, 2,
            2, 4, 3
        ];
        planeBodyGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        planeBodyGeo.setIndex(indices);
        planeBodyGeo.computeVertexNormals();

        // Plane 1: Orbital Circle
        const p1 = new THREE.Group();
        p1.add(new THREE.Mesh(planeBodyGeo, planeMaterial));
        p1.scale.set(1.5, 1.5, 1.5);
        scene.add(p1);
        planes.push({ group: p1, type: 'circle', radius: 150, speed: 0.4, offset: 0 });

        // Plane 2: Left to Right
        const p2 = new THREE.Group();
        p2.add(new THREE.Mesh(planeBodyGeo, planeMaterial));
        p2.scale.set(1.2, 1.2, 1.2);
        scene.add(p2);
        planes.push({ group: p2, type: 'linear', xStart: -400, xEnd: 400, y: 40, z: -100, speed: 40, offset: 2 });

        // Plane 3: Right to Left
        const p3 = new THREE.Group();
        p3.add(new THREE.Mesh(planeBodyGeo, planeMaterial));
        p3.scale.set(1.3, 1.3, 1.3);
        scene.add(p3);
        planes.push({ group: p3, type: 'linear', xStart: 400, xEnd: -400, y: -40, z: -150, speed: 35, offset: 5 });

        // --- AMBIENT LIGHTING ---
        const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 0.5 : 0.8);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, isDark ? 0.8 : 1.0);
        directionalLight.position.set(50, 100, 50);
        scene.add(directionalLight);

        let animId;
        const clock = new THREE.Clock();
        let scrollY = 0;

        const handleScroll = () => {
            scrollY = window.scrollY;
        };
        window.addEventListener("scroll", handleScroll);

        const resize = () => {
            const w = canvas.clientWidth, h = canvas.clientHeight;
            renderer.setSize(w, h, false);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        };
        resize();
        window.addEventListener("resize", resize);

        let mouseX = 0, mouseY = 0;
        const onMouseMove = (e) => {
            mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
        };
        window.addEventListener("mousemove", onMouseMove);

        const animate = () => {
            animId = requestAnimationFrame(animate);
            const delta = clock.getDelta();
            const elapsed = clock.getElapsedTime();

            stars.rotation.y += delta * 0.05;
            stars.rotation.x += delta * 0.02;

            // Rotating Globe
            globe.rotation.y += delta * 0.15;
            innerGlobe.rotation.y += delta * 0.1;

            // Planes animation
            planes.forEach(p => {
                if (p.type === 'circle') {
                    const speed = elapsed * p.speed + p.offset;
                    p.group.position.x = Math.sin(speed) * p.radius;
                    p.group.position.z = Math.cos(speed) * p.radius;
                    p.group.position.y = Math.sin(elapsed * 0.8) * 20 + 20;

                    const nextX = Math.sin(speed + 0.01) * p.radius;
                    const nextZ = Math.cos(speed + 0.01) * p.radius;
                    const nextY = Math.sin((elapsed + 0.01) * 0.8) * 20 + 20;
                    p.group.lookAt(nextX, nextY, nextZ);
                } else if (p.type === 'linear') {
                    const duration = Math.abs(p.xEnd - p.xStart) / p.speed;
                    const t = ((elapsed + p.offset) % duration) / duration;
                    p.group.position.x = p.xStart + (p.xEnd - p.xStart) * t;
                    p.group.position.y = p.y + Math.sin(elapsed * 0.5) * 10;
                    p.group.position.z = p.z;

                    // Look ahead
                    p.group.lookAt(p.xEnd, p.group.position.y, p.group.position.z);
                }
            });

            // Subtle camera movement based on mouse + scroll parallax
            const targetCamX = mouseX * 10;
            const targetCamY = mouseY * 10 - (scrollY * 0.05); // Parallax effect
            camera.position.x += (targetCamX - camera.position.x) * 0.05;
            camera.position.y += (targetCamY - camera.position.y) * 0.05;
            camera.lookAt(0, 0, 0);

            // Move stars slightly with scroll for deeper parallax
            stars.position.y = scrollY * 0.1;

            renderer.render(scene, camera);
        };
        animate();

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener("resize", resize);
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("scroll", handleScroll);
            renderer.dispose();
            starGeometry.dispose();
            starMaterial.dispose();
            planeBodyGeo.dispose();
            planeMaterial.dispose();
            globeGeo.dispose();
            globeWireframeMat.dispose();
            innerGlobeGeo.dispose();
            innerGlobeMat.dispose();
        };
    }, [mounted, resolvedTheme]);

    if (!mounted) return <div className="ph2-root" style={{ minHeight: "100vh" }} />;

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Inter:wght@400;500&display=swap');

        .ph2-root {
          position: relative;
          width: 100%;
          min-height: 100vh;
          overflow: hidden;
          background: var(--bg-hero, #050510);
          color: var(--text-hero, #ffffff);
          font-family: 'Inter', sans-serif;
          transition: background 0.3s ease, color 0.3s ease;
        }

        :root {
          --bg-hero: #f8fafc;
          --text-hero: #0f172a;
          --desc-hero: #475569;
          --btn-sec-bg: rgba(0, 0, 0, 0.05);
          --btn-sec-border: rgba(0, 0, 0, 0.1);
          --btn-sec-text: #0f172a;
          --title-grad: linear-gradient(to right, #1e293b, #6366f1);
          --hex-bg: rgba(99, 102, 241, 0.05);
        }

        .dark {
          --bg-hero: #050510;
          --text-hero: #ffffff;
          --desc-hero: #94a3b8;
          --btn-sec-bg: rgba(255, 255, 255, 0.05);
          --btn-sec-border: rgba(255, 255, 255, 0.1);
          --btn-sec-text: #ffffff;
          --title-grad: linear-gradient(to right, #ffffff, #a5b4fc);
          --hex-bg: rgba(99, 102, 241, 0.1);
        }

        .ph2-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          pointer-events: none;
        }

        .ph2-container {
          position: relative;
          z-index: 1;
          max-width: 1200px;
          margin: 0 auto;
          padding: 80px 24px;
          display: grid;
          grid-template-columns: 1fr;
          gap: 60px;
          align-items: center;
          justify-items: center;
          text-align: center;
          min-height: 100vh;
        }

        @media (min-width: 768px) {
          .ph2-container {
            grid-template-columns: 1fr 1fr;
            padding: 100px 40px;
            justify-items: start;
            text-align: left;
          }
        }

        .ph2-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 32px;
          animation: fadeInUp 0.8s ease-out;
        }

        @media (min-width: 768px) {
          .ph2-content {
            align-items: flex-start;
          }
        }

        .ph2-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 800;
          line-height: 1.1;
          background: var(--title-grad);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .ph2-description {
          font-size: 1.125rem;
          line-height: 1.6;
          color: var(--desc-hero);
          max-width: 540px;
        }

        .ph2-actions {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 16px;
          width: 100%;
        }

        @media (min-width: 768px) {
          .ph2-actions {
            justify-content: flex-start;
          }
        }

        .ph2-btn {
          padding: 14px 28px;
          border-radius: 12px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-width: 180px;
          height: 56px;
        }

        @media (max-width: 640px) {
          .ph2-btn {
            width: 100%;
          }
        }

        .ph2-btn-primary {
          background: #6366f1;
          color: white;
          box-shadow: 0 4px 14px 0 rgba(99, 102, 241, 0.39);
        }

        .ph2-btn-primary:hover {
          background: #4f46e5;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.45);
        }

        .ph2-btn-secondary {
          background: var(--btn-sec-bg);
          color: var(--btn-sec-text);
          border: 1px solid var(--btn-sec-border);
          backdrop-filter: blur(10px);
        }

        .ph2-btn-secondary:hover {
          background: rgba(128, 128, 128, 0.1);
          border-color: var(--btn-sec-border);
          transform: translateY(-2px);
        }

        /* Hexagonal Image Grid */
        .ph2-visual {
          position: relative;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          padding: 20px;
          animation: fadeIn 1.2s ease-out;
        }

        .ph2-hex-item {
          position: relative;
          width: 100%;
          aspect-ratio: 1/1.1;
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
          background: var(--hex-bg);
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }

        .ph2-hex-item:nth-child(even) {
          margin-top: 40px;
        }

        .ph2-hex-item:hover {
          transform: scale(1.05) translateY(-10px);
          z-index: 10;
        }

        .ph2-hex-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .ph2-hex-item:hover img {
          transform: scale(1.15);
        }

        .ph2-hex-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.4), transparent 70%);
          opacity: 0;
          transition: opacity 0.5s ease;
          pointer-events: none;
        }

        .ph2-hex-item:hover .ph2-hex-glow {
          opacity: 1;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        .ph2-visual {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>

            <section className="ph2-root">
                <canvas ref={canvasRef} className="ph2-canvas" />

                <div className="ph2-container">
                    {/* First Column */}
                    <div className="ph2-content">
                        <h1 className="ph2-title">
                            Apply for your visa yourself, with expert guidance.
                        </h1>
                        <p className="ph2-description">
                            No agent or Middlemen Needed. We provide the tools, checklists, and expert support to ensure your application is perfect. Take control of your journey today.
                        </p>
                        <div className="ph2-actions">
                            <SignupSheet
                                desscription="Get Started"
                                className="ph2-btn ph2-btn-primary !h-[56px] !min-w-[180px] !p-0"
                            />
                            <a href="https://t.me/eloravisa" className="ph2-btn ph2-btn-secondary">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M11.944 0C5.324 0 0 5.324 0 11.944c0 6.62 5.324 11.944 11.944 11.944 6.621 0 11.944-5.324 11.944-11.944C23.888 5.324 18.565 0 11.944 0zm5.626 8.358l-1.921 9.074c-.145.64-.519.797-1.056.495l-2.923-2.154-1.41 1.358c-.156.156-.287.287-.588.287l.209-2.969 5.405-4.88c.235-.209-.051-.325-.363-.117L8.23 14.332l-2.877-.899c-.626-.195-.639-.626.13-.925L16.6 8.048c.513-.19.963.118.77.31z"/>
                                </svg>
                                <span>Join Telegram</span>
                            </a>
                        </div>
                    </div>

                    {/* Second Column */}
                    <div className="ph2-visual">
                        {IMAGES.map((src, idx) => (
                            <div key={idx} className="ph2-hex-item">
                                <img src={src} alt={`Visual ${idx}`} />
                                <div className="ph2-hex-glow" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
