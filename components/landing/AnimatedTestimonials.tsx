import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import {AnimatedGridPattern} from "@/components/ui/animated-grid-pattern";
import {cn} from "@/lib/utils";
import React from "react";

export function AnimatedTestimonialsPlus() {
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
                "I have been using Elora Visa for a while now and I must say it has been a game changer. The AI tools have made the process so much easier and the expert guidance has been invaluable..",
            name: "Richard Andoh",
            designation: "Operations Director at CloudScale",
            src: "/IMG_9093.jpg",
        },
        {
            quote:
                "Outstanding support and robust features. It's rare to find a product that delivers on all its promises.",
            name: "James Kim",
            designation: "Engineering Lead at DataPro",
            src: "https://images.unsplash.com/photo-1636041293178-808a6762ab39?q=80&w=3464&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        },
        {
            quote:
                "The scalability and performance have been game-changing for our organization. Highly recommend to any growing business.",
            name: "Lisa Thompson",
            designation: "VP of Technology at FutureNet",
            src: "https://images.unsplash.com/photo-1624561172888-ac93c696e10c?q=80&w=2592&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        },
    ];
    return (
        <section  className="relative py-20 md:py-32 overflow-hidden">
            <h1 className="text-3xl font-bold mb-4 text-center">Testimonials</h1>
            <AnimatedTestimonials testimonials={testimonials} />
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
    )
}


