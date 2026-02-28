"use client"

import React, { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { UserPlus, ListChecks, Bot, Send, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

gsap.registerPlugin(ScrollTrigger)

const steps = [
    {
        icon: UserPlus,
        title: "Create an account",
        desc: "Answer a few questions so we understand your visa goal.",
        color: "from-blue-500 to-cyan-500",
        shadow: "shadow-blue-500/20"
    },
    {
        icon: ListChecks,
        title: "Follow your checklist",
        desc: "Country‑specific requirements explained simply.",
        color: "from-indigo-500 to-purple-500",
        shadow: "shadow-indigo-500/20"
    },
    {
        icon: Bot,
        title: "Use AI tools",
        desc: "Document reviews & mock interviews to reduce mistakes.",
        color: "from-fuchsia-500 to-pink-500",
        shadow: "shadow-fuchsia-500/20"
    },
    {
        icon: Send,
        title: "Apply with confidence",
        desc: "You submit your application yourself.",
        color: "from-emerald-500 to-teal-500",
        shadow: "shadow-emerald-500/20"
    }
]

export function HowItWorksSection() {
    const containerRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Three.js Background Animation
    useEffect(() => {
        if (!mounted || !canvasRef.current || !containerRef.current) return

        const canvas = canvasRef.current
        const container = containerRef.current
        const renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        })
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))

        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000)
        camera.position.z = 5


        
        // Create floating nodes and connections
        const nodeCount = 20
        const nodes: THREE.Mesh[] = []
        const nodeGeometry = new THREE.SphereGeometry(0.05, 16, 16)
        
        const group = new THREE.Group()
        scene.add(group)

        for (let i = 0; i < nodeCount; i++) {
            const material = new THREE.MeshPhongMaterial({


                emissiveIntensity: 0.5,
                transparent: true,
                opacity: 0.8
            })
            const node = new THREE.Mesh(nodeGeometry, material)
            node.position.set(
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 5
            )
            node.userData = {
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.01,
                    (Math.random() - 0.5) * 0.01,
                    (Math.random() - 0.5) * 0.01
                )
            }
            group.add(node)
            nodes.push(node)
        }

        // Add some lines between nodes
        const lineMaterial = new THREE.LineBasicMaterial({

            transparent: true,
            opacity: 0.2
        })

        const lineGeometry = new THREE.BufferGeometry()
        const linePositions = new Float32Array(nodeCount * nodeCount * 6)
        lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3))
        const lineMesh = new THREE.LineSegments(lineGeometry, lineMaterial)
        group.add(lineMesh)

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
        scene.add(ambientLight)

        const pointLight = new THREE.PointLight(0xffffff, 1)
        pointLight.position.set(5, 5, 5)
        scene.add(pointLight)

        let animationFrameId: number
        let mouseX = 0
        let mouseY = 0
        let isVisible = true

        const observer = new IntersectionObserver(
            ([entry]) => {
                isVisible = entry.isIntersecting
            },
            { threshold: 0 }
        )
        observer.observe(canvas)

        const handleMouseMove = (e: MouseEvent) => {
            mouseX = (e.clientX / window.innerWidth - 0.5) * 2
            mouseY = -(e.clientY / window.innerHeight - 0.5) * 2
        }

        window.addEventListener("mousemove", handleMouseMove)

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate)
            if (!isVisible) return

            nodes.forEach(node => {
                node.position.add(node.userData.velocity)
                if (Math.abs(node.position.x) > 5) node.userData.velocity.x *= -1
                if (Math.abs(node.position.y) > 5) node.userData.velocity.y *= -1
                if (Math.abs(node.position.z) > 3) node.userData.velocity.z *= -1
            })

            // Update lines
            let lineIdx = 0
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dist = nodes[i].position.distanceTo(nodes[j].position)
                    if (dist < 2.5) {
                        linePositions[lineIdx++] = nodes[i].position.x
                        linePositions[lineIdx++] = nodes[i].position.y
                        linePositions[lineIdx++] = nodes[i].position.z
                        linePositions[lineIdx++] = nodes[j].position.x
                        linePositions[lineIdx++] = nodes[j].position.y
                        linePositions[lineIdx++] = nodes[j].position.z
                    }
                }
            }
            lineGeometry.setDrawRange(0, lineIdx / 3)
            lineGeometry.attributes.position.needsUpdate = true

            // Parallax
            group.rotation.y += 0.001
            camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05
            camera.position.y += (mouseY * 0.5 - camera.position.y) * 0.05
            camera.lookAt(scene.position)

            renderer.render(scene, camera)
        }

        const handleResize = () => {
            if (!container) return
            const width = container.clientWidth
            const height = container.clientHeight
            renderer.setSize(width, height, false)
            camera.aspect = width / height
            camera.updateProjectionMatrix()
        }

        handleResize()
        window.addEventListener("resize", handleResize)
        animate()

        return () => {
            window.removeEventListener("mousemove", handleMouseMove)
            window.removeEventListener("resize", handleResize)
            cancelAnimationFrame(animationFrameId)
            observer.disconnect()
            nodeGeometry.dispose()
            nodes.forEach(n => (n.material as THREE.Material).dispose())
            lineMaterial.dispose()
            lineGeometry.dispose()
            renderer.dispose()
        }
    }, [mounted])

    // GSAP Parallax and Entrance
    useEffect(() => {
        if (!mounted) return
        const ctx = gsap.context(() => {
            // Parallax background
            gsap.to(".how-it-works-bg", {
                yPercent: 20,
                ease: "none",
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                }
            })

            // Staggered cards
            gsap.from(".step-card", {
                y: 60,
                opacity: 0,
                duration: 1,
                stagger: 0.2,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: ".steps-grid",
                    start: "top 80%",
                }
            })

            // Title parallax
            gsap.to(".section-title", {
                y: -50,
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 1
                }
            })
        }, containerRef)

        return () => ctx.revert()
    }, [mounted])

    if (!mounted) return <section id="how-it-works" className="py-24" />

    return (
        <section 
            id="how-it-works" 
            ref={containerRef} 
            className="relative py-24 md:py-32 overflow-hidden bg-[#f8fafc] dark:bg-[#050510]"
        >
            {/* Three.js Canvas */}
            <canvas 
                ref={canvasRef} 
                className="how-it-works-bg absolute inset-0 pointer-events-none opacity-40 dark:opacity-60"
            />

            <div className="container px-4 mx-auto relative z-10">
                <div className="text-center mb-20 section-title">
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
                        <span className="bg-gradient-to-r from-[#FF1CF7] to-[#b249f8] bg-clip-text text-transparent ">
                            How{" "}
                        </span>
                        <span className="bg-gradient-to-r from-[#00b7fa] to-[#01cfea] bg-clip-text text-transparent">
                            It Works
                        </span>
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 text-xl max-w-2xl mx-auto leading-relaxed">
                        A simple, transparent process designed to empower you with 
                        everything you need for a successful application.
                    </p>
                </div>

                <div className="steps-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, index) => (
                        <div key={index} className="step-card group relative">
                            {/* Connector Arrow (Desktop) */}
                            {index < steps.length - 1 && (
                                <div className="hidden lg:block absolute top-1/4 -right-6 z-20 translate-x-1/2">
                                    <ChevronRight className="w-8 h-8 text-slate-300 dark:text-slate-700 animate-pulse" />
                                </div>
                            )}

                            <div className={cn(
                                "h-full p-8 rounded-[2.5rem] transition-all duration-500",
                                "bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-slate-800/50",
                                "hover:shadow-2xl hover:-translate-y-2",
                                step.shadow
                            )}>
                                {/* Step Number */}
                                <div className="absolute top-6 right-8 text-4xl font-black text-slate-100 dark:text-slate-800/50">
                                    0{index + 1}
                                </div>

                                {/* Icon */}
                                <div className={cn(
                                    "w-16 h-16 rounded-2xl flex items-center justify-center mb-8 bg-gradient-to-br shadow-lg transform group-hover:rotate-12 transition-transform duration-500",
                                    step.color
                                )}>
                                    <step.icon className="w-8 h-8 text-white" />
                                </div>

                                <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
                                    {step.title}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                    {step.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
