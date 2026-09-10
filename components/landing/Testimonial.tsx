"use client";

import Image from "next/image";
import { Quote } from "lucide-react";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import { Display, Eyebrow, Reveal, TabCard } from "./ui";

const founderStory = {
  quote:
    "Securing a visa can be a daunting process, but with Elora Visa, it's a breeze. The AI tools and expert guidance make it so much easier.",
  name: "Alex Asiedu Sekorme",
  designation: "Founder & CEO, Elora Visa",
  src: "/16.JPG",
};

const testimonials = [
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
    <section id="success-stories" className="relative scroll-mt-20 overflow-hidden bg-lp-page py-16 md:py-24" aria-labelledby="stories-heading">
      <div className="lp-grid-dots pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(50%_50%_at_50%_50%,black,transparent)]" aria-hidden="true" />

      <div className="container relative mx-auto px-4 md:px-6">
        <Reveal className="mx-auto mb-14 max-w-3xl md:mb-20">
          <TabCard
            tab={
              <span className="flex items-center gap-2 font-display text-[10px] font-medium uppercase tracking-[0.18em] text-lp-fg/80">
                <Quote className="h-3.5 w-3.5 text-lp-azure" aria-hidden="true" />
                Why we built Elora Visa
              </span>
            }
            bodyClassName="lp-shadow p-6 md:p-8"
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-lp-line">
                <Image src={founderStory.src} alt={founderStory.name} fill sizes="64px" className="object-cover" />
              </div>
              <div>
                <p className="text-base font-medium leading-relaxed text-lp-fg md:text-lg">
                  &ldquo;{founderStory.quote}&rdquo;
                </p>
                <p className="mt-3 text-sm text-lp-muted">
                  <span className="font-semibold text-lp-fg">{founderStory.name}</span> &middot; {founderStory.designation}
                </p>
              </div>
            </div>
          </TabCard>
        </Reveal>

        <div className="mx-auto mb-10 max-w-3xl text-center">
          <Reveal>
            <Eyebrow>Success stories</Eyebrow>
          </Reveal>
          <Reveal delay={0.08}>
            <Display as="h2" size="lg" className="mt-5 text-lp-fg">
              <span id="stories-heading">Real people. Better-prepared applications.</span>
            </Display>
          </Reveal>
        </div>

        <Reveal amount={0.15}>
          <div className="mx-auto max-w-5xl rounded-[2rem] border border-lp-line bg-lp-card lp-shadow">
            <AnimatedTestimonials testimonials={testimonials} autoplay={true} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
