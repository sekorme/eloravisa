"use client";

import React from "react";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    quote:
      "Securing a visa can be a daunting process, but with Elora Visa, it's a breeze. The AI tools and expert guidance make it so much easier.",
    name: "Alex Asiedu Sekorme",
    designation: "CEO at Elora Visa",
    src: "/16.JPG",
  },
  {
    quote:
      "I love to explore the world, Elora Visa makes it easy for me to apply for a visa. No agents, just expert guidance and AI tools.",
    name: "Mimi Kug",
    designation: "Nurse - USA",
    src: "/ambassador2.jpeg",
  },
  {
    quote:
      "I have been using Elora Visa for a while now and I must say it has been a game changer. The AI tools have made the process so much easier and the expert guidance has been invaluable.",
    name: "Richard Andoh",
    designation: "Student - UK",
    src: "/IMG_9093.jpg",
  },
  {
    quote:
      "Elora Visa has been a game-changer for me. The AI tools have made the process so much easier and the expert guidance has been invaluable.",
    name: "Sweet Akyere",
    designation: "Student - UK",
    src: "/akyere.jpg",
  },
  {
    quote:
      "I tried so many visa services but none of them was as effective as Elora Visa. At first, I was skeptical but after using Elora Visa, I was amazed by the results.",
    name: "Lisa Thompson",
    designation: "Health Worker - Canada",
    src: "/ekua.jpg",
  },
];

export function Testimonial() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <h2 className="bg-gradient-to-r from-[#00b7fa] to-[#01cfea] bg-clip-text text-transparent text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-center mb-12">
          What Our Users Say
        </h2>
        <AnimatedTestimonials testimonials={testimonials} autoplay={true} />
      </div>
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
    </section>
  );
}
