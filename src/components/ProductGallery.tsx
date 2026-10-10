"use client";

import { useEffect, useState } from "react";

export default function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (images.length <= 1 || paused) return;
    const id = setInterval(() => {
      setActive((i) => (i + 1) % images.length);
    }, 4000);
    return () => clearInterval(id);
  }, [images.length, paused]);

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="group overflow-hidden rounded-2xl">
        <img
          src={images[active]}
          alt={alt}
          width={600}
          height={600}
          className="aspect-square w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
        />
      </div>
      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-4 gap-3">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`${alt} ${index + 1}`}
              aria-current={index === active}
              className={`overflow-hidden rounded-xl border-2 transition-colors ${
                index === active ? "border-gold-dark" : "border-transparent"
              }`}
            >
              <img src={image} alt="" width={150} height={150} className="aspect-square w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
