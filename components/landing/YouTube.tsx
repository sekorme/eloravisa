"use client"

import React from "react"

export function YouTube() {
  return (
    <section className="py-16 ">
      <div className="container px-4 md:px-4 mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-8">
          Watch Our Tutorial
        </h2>
        <div className="max-w-4xl mx-auto aspect-video rounded-2xl overflow-hidden shadow-2xl">
          <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/2VMSKMZApeM"
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
