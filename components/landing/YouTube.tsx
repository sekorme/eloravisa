"use client"

import React from "react"

export function YouTube() {
  return (
    <section className="py-16 ">
      <div className="container px-4 md:px-4 mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl mb-10 md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-[#FF1CF7] to-[#b249f8] bg-clip-text text-transparent ">
              Watch{" "}
              <span className="bg-gradient-to-r from-[#00b7fa] to-[#01cfea] bg-clip-text text-transparent">
              Tutorial
            </span>
          </h2>
        <div className="max-w-7xl mx-auto aspect-video rounded-2xl overflow-hidden shadow-2xl">
          <iframe
            width="100%"
            height="100%"
            src="https://youtu.be/OhV11JYsiWw?si=m7tw5Y4j8_Bt2Wc7"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>
        </div>
        <p className="mt-6 text-muted-foreground text-lg">
          Learn how to use EloraVisa to handle your visa application process yourself.
        </p>
      </div>
    </section>
  )
}
