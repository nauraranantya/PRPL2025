// src/components/Hero.jsx
import React, { useState, useEffect, useRef } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function Hero({ images }) {
  const [index, setIndex] = useState(0);
  const autoplayRef = useRef();

  // autoplay every 5s
  useEffect(() => {
    autoplayRef.current = () => {
      setIndex((i) => (i + 1) % images.length);
    };
  });

  useEffect(() => {
    const play = () => autoplayRef.current && autoplayRef.current();
    const id = setInterval(play, 5000);
    return () => clearInterval(id);
  }, [images.length]);

  const prevSlide = () => setIndex((i) => (i - 1 + images.length) % images.length);
  const nextSlide = () => setIndex((i) => (i + 1) % images.length);

  return (
    <div className="w-full relative bg-gray-100 mt-6">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-[#043873] mb-4">Kegiatan Terbaru</h1>
        <div className="relative rounded-lg overflow-hidden shadow-md h-56 md:h-72">
          {images.map((img, i) => (
            <div
              key={i}
              className={`absolute inset-0 transition-opacity duration-700 ${
                i === index ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <img src={img} alt={`slide-${i}`} className="w-full h-full object-cover" />
            </div>
          ))}

          <button
            onClick={prevSlide}
            aria-label="Prev"
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow"
          >
            <FiChevronLeft size={20} />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next"
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow"
          >
            <FiChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
