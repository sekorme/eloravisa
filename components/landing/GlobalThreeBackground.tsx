"use client"

import React, { useEffect, useRef } from "react"
import * as THREE from "three"

export function GlobalThreeBackground() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const scene = new THREE.Scene()
    
    // Transparent background
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)) // Performance optimization
    container.appendChild(renderer.domElement)

    // Particles
    const particlesCount = 1000
    const posArray = new Float32Array(particlesCount * 3)

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 10
    }

    const particlesGeometry = new THREE.BufferGeometry()
    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(posArray, 3))

    // Material with subtle colors that work in both themes
    // Using a light-grayish color that's visible enough in dark but not overwhelming in light
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.015,
      color: 0x888888,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    })

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial)
    scene.add(particlesMesh)

    camera.position.z = 3

    // Mouse interaction
    let mouseX = 0
    let mouseY = 0

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth - 0.5) * 0.5
      mouseY = (event.clientY / window.innerHeight - 0.5) * 0.5
    }

    window.addEventListener("mousemove", handleMouseMove)

    // Resize handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener("resize", handleResize)

    // Animation loop
    let animationFrameId: number

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)

      particlesMesh.rotation.y += 0.001
      particlesMesh.rotation.x += 0.0005

      // Subtle mouse follow
      particlesMesh.position.x += (mouseX - particlesMesh.position.x) * 0.05
      particlesMesh.position.y += (-mouseY - particlesMesh.position.y) * 0.05

      renderer.render(scene, camera)
    }

    animate()

    // Intersection Observer to stop animation when not visible (though this is global, so it might always be somewhat visible)
    // But since it's global, we just keep it running for the whole page.

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationFrameId)
      
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }

      particlesGeometry.dispose()
      particlesMaterial.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 pointer-events-none -z-10 bg-transparent"
      style={{ isolation: "isolate" }}
    />
  )
}
