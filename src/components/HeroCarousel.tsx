"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";

export interface CarouselSlide {
  image: string;
  tag: string;
  title: ReactNode;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  textPosition?: "left" | "right";
}

export default function HeroCarousel({ slides }: { slides: CarouselSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (slides.length <= 1 || paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(id);
  }, [slides.length, paused]);

  const goTo = (next: number) => setIndex(((next % slides.length) + slides.length) % slides.length);

  return (
    <div
      className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[16/10] md:aspect-[16/9] lg:aspect-[8/5]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((slide, i) => (
        <div
          key={slide.image}
          aria-hidden={i !== index}
          className={`absolute inset-0 transition-opacity duration-700 ease-out ${
            i === index ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <img src={slide.image} alt="" width={1920} height={1200} className="h-full w-full object-cover" />
          <div
            className={`absolute inset-0 ${
              slide.textPosition === "right"
                ? "bg-gradient-to-l from-ivory/60 via-ivory/10 to-transparent"
                : "bg-gradient-to-r from-ivory/60 via-ivory/10 to-transparent"
            }`}
          />
          <div
            className={`relative z-10 mx-auto flex h-full max-w-6xl items-center px-4 ${
              slide.textPosition === "right" ? "justify-end" : "justify-start"
            }`}
          >
            <div className="max-w-md rounded-3xl bg-white/95 p-7 shadow-xl backdrop-blur sm:p-9">
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gold-dark">
                <span className="h-1.5 w-1.5 rounded-full bg-gold-dark" />
                {slide.tag}
              </span>
              <h2 className="mt-3 font-heading text-3xl leading-tight sm:text-4xl">{slide.title}</h2>
              <p className="mt-4 text-sm text-black/70">{slide.description}</p>
              <Link
                href={slide.ctaHref}
                className="mt-6 inline-block rounded-full bg-black px-7 py-3 text-xs font-semibold uppercase tracking-wide text-ivory hover:bg-gold-dark"
              >
                {slide.ctaLabel}
              </Link>
            </div>
          </div>
        </div>
      ))}

      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-lg text-black shadow transition hover:bg-white"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Next slide"
            className="absolute right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-lg text-black shadow transition hover:bg-white"
          >
            ›
          </button>
          <div className="absolute inset-x-0 bottom-5 z-10 flex justify-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index}
                className={`h-2 rounded-full transition-all ${i === index ? "w-6 bg-black" : "w-2 bg-black/30"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
