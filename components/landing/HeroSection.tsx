"use client"

import React, { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import * as THREE from "three"
import { Button } from "@/components/ui/button"
import { ArrowRight, ShieldCheck, Send } from "lucide-react"
import Link from "next/link"
import { SignupSheet } from "@/components/auth/SignupSheet";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { cn } from "@/lib/utils";

const IMAGES = ["/IMG_9093.jpg", "/30.JPG", "/elora5.jpeg", "/akyere.jpg"];

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Three.js Background Animation
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.z = 30;

    // Particles/Stars
    const count = 1000;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      size: 0.15,
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true
    });
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // Update colors based on theme
    const updateTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      material.color.setHex(isDark ? 0x60a5fa : 0x2563eb);
      material.opacity = isDark ? 0.4 : 0.6;
    };
    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      points.rotation.y += 0.001;
      points.rotation.x += 0.0005;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // GSAP Animations
    const ctx = gsap.context(() => {
      // Animate blobs
      gsap.to(".blob", {
        x: () => `+=${gsap.utils.random(-150, 150)}`,
        y: () => `+=${gsap.utils.random(-150, 150)}`,
        scale: () => gsap.utils.random(0.9, 1.3),
        duration: 12,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: () => gsap.utils.random(0, 1),
      });

      // Split text for hero-title
      const heroTitle = containerRef.current?.querySelector(".hero-title");
      if (heroTitle) {
        const spans = heroTitle.querySelectorAll("span");
        spans.forEach(span => {
          const text = span.textContent || "";
          const isGradient = span.classList.contains("bg-clip-text");
          const gradientClasses = isGradient ? span.className : "";
          
          span.innerHTML = text
            .split("")
            .map((char) => `<span class="char inline-block whitespace-pre ${isGradient ? gradientClasses : ""}">${char}</span>`)
            .join("");
          
          if (isGradient) {
            span.classList.remove("bg-clip-text", "text-transparent", "bg-gradient-to-r");
          }
        });
      }

      // Animate content
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } })
      tl.from(".hero-badge", { y: -20, opacity: 0, duration: 0.6 })
        .from(".char", {
          opacity: 0,
          x: () => gsap.utils.random(-100, 100),
          y: () => gsap.utils.random(-100, 100),
          rotation: () => gsap.utils.random(-30, 30),
          duration: 1.2,
          stagger: { each: 0.01, from: "random" },
          ease: "power4.out"
        }, "-=0.3")
        .from(".hero-desc", { y: 20, opacity: 0, duration: 0.6 }, "-=0.8")
        .from(".hero-cta", { y: 20, opacity: 0, duration: 0.6, stagger: 0.1 }, "-=0.4")
        .from(".hero-trust", { opacity: 0, duration: 0.8 }, "-=0.2")
        .from(".hero-images", { opacity: 0, x: 50, duration: 1, ease: "power2.out" }, "-=1")

    }, containerRef)

    return () => {
      ctx.revert();
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      observer.disconnect();
    }
  }, [])

  return (
    <section ref={containerRef} className="relative pt-24 pb-16 md:pt-32 md:pb-24 bg-background overflow-hidden min-h-[90vh] flex items-center">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />
      
      {/* Animated Blob Background */}
      <div className="absolute inset-0 -z-0 opacity-30">
        <AnimatedGridPattern
          numSquares={30}
          maxOpacity={0.1}
          duration={3}
          repeatDelay={1}
          className={cn(
            "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
            "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12"
          )}
        />
        <div className="blob absolute top-0 left-0 w-96 h-96 bg-blue-400/30 rounded-full filter blur-3xl"></div>
        <div className="blob absolute top-0 right-0 w-80 h-80 bg-purple-400/30 rounded-full filter blur-3xl"></div>
        <div className="blob absolute bottom-0 left-1/4 w-72 h-72 bg-green-400/30 rounded-full filter blur-3xl"></div>
      </div>

      <div className="container px-4 md:px-6 mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Content */}
          <div className="text-left max-w-2xl mx-auto lg:mx-0">
            <div className="flex justify-center mb-6 hero-badge">
              <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                No Agents. No Hidden Fees.
              </div>
            </div>

            <h1 className="hero-title text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-[1.1]">
              <span className="inline-block bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 text-transparent bg-clip-text">
                Apply for Your Visa Yourself
              </span>
              {" "}
              <span className="inline-block text-blue-600 dark:text-blue-400">With Expert Guidance</span>
            </h1>

            <p className="hero-desc text-lg md:text-xl text-muted-foreground mb-8 max-w-xl">
              Ditch the middleman. Learn how to apply for visas the right way using step‑by‑step guidance, AI document checks, and realistic mock interviews.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-start gap-4 mb-10 hero-cta relative z-20">
              <SignupSheet desscription={"Sign Up Now, It's Self Guided"} className="h-14 px-8 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-xl hover:shadow-blue-500/20 transition-all w-full sm:w-auto"/>
              <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full border-2 w-full sm:w-auto hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors" asChild>
                <Link href="https://t.me/+wWazCHK2wEMzMzdk" target={"_blank"}>
                  <div className={"rounded-full bg-blue-500 p-1.5 mr-2"}><Send className={"text-white w-4 h-4"}/></div>
                  Join Telegram
                </Link>
              </Button>
            </div>

            <div className="hero-trust flex items-center gap-4">
               <div className="flex -space-x-3">
                 {[1,2,3,4].map(i => (
                   <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold overflow-hidden">
                     <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" className="w-full h-full object-cover" />
                   </div>
                 ))}
               </div>
               <p className="text-sm text-muted-foreground font-medium">
                Joined by <span className="text-foreground font-bold">12,000+</span> successful applicants
              </p>
            </div>
          </div>

          {/* Right Column: Images */}
          <div className="hero-images relative lg:block">
            <div className="grid grid-cols-2 gap-4 relative px-4 sm:px-0">
              {IMAGES.map((src, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl transition-transform duration-500 hover:scale-[1.02] group",
                    i % 2 === 0 ? "md:top-8" : "md:-top-8"
                  )}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                  <img 
                    src={src} 
                    alt={`Applicant ${i}`} 
                    className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
                  />
                  <div className="absolute bottom-4 left-4 right-4 z-20 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                    <p className="text-white text-xs font-medium uppercase tracking-wider">Success Story #{i + 1}</p>
                  </div>
                </div>
              ))}
              
              {/* Decorative elements */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl animate-pulse -z-10" />
              <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl animate-pulse -z-10" />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
