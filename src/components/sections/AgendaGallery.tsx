import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useMotionTemplate } from 'framer-motion';
import type { EventItem } from '../board/boardUtils';

interface AgendaGalleryProps {
  events: EventItem[];
}

export const AgendaGallery: React.FC<AgendaGalleryProps> = ({ events }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring for the spotlight
  const spotlightX = useSpring(mouseX, { stiffness: 100, damping: 30 });
  const spotlightY = useSpring(mouseY, { stiffness: 100, damping: 30 });

  // Use motion template to avoid re-renders
  const background = useMotionTemplate`radial-gradient(600px circle at ${spotlightX}px ${spotlightY}px, rgba(168, 85, 247, 0.15), transparent 80%)`;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <section 
      id="agenda" 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen bg-black overflow-hidden py-24"
    >
      {/* Background Image with Dark Overlay */}
      <div 
        className="absolute inset-0 bg-[url('/images/gallery.webp')] bg-cover bg-center opacity-30 grayscale"
        style={{ filter: 'brightness(0.3)' }}
      />

      {/* Spotlight Effect */}
      <motion.div 
        className="absolute inset-0 pointer-events-none z-10"
        style={{ background }}
      />

      <div className="container mx-auto px-4 relative z-20">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-6xl md:text-8xl font-gallery text-white mb-4 tracking-tighter">
            L'Agenda <span className="text-purple-500 italic">D'Art</span>
          </h2>
          <p className="text-gray-500 uppercase tracking-[0.5em] text-sm">Curaduría de Eventos Culturales</p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 gap-0 border-t border-white/10">
            {events.map((event, index) => (
              <GalleryItem key={event.id} event={event} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const GalleryItem: React.FC<{ event: EventItem; index: number }> = ({ event, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="group relative border-b border-white/10 py-8 md:py-12 cursor-pointer overflow-hidden"
    >
      {/* Hover Background Reveal */}
      <motion.div 
        className="absolute inset-0 bg-purple-600/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between relative z-10 px-4">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-2">
            <span className="text-xs font-gallery text-purple-500 opacity-50">0{index + 1}</span>
            <h3 className="text-3xl md:text-5xl font-gallery text-white group-hover:text-purple-400 transition-colors duration-300 flex flex-wrap">
              {event.title.split('').map((char, i) => (
                <motion.span
                  key={i}
                  whileHover={{ 
                    y: -10, 
                    color: '#a855f7',
                    transition: { type: 'spring', stiffness: 300 }
                  }}
                  className="inline-block"
                >
                  {char === ' ' ? '\u00A0' : char}
                </motion.span>
              ))}
            </h3>
          </div>
        </div>

        <div className="flex flex-col md:items-end mt-4 md:mt-0">
          <p className="text-xl font-gallery text-gray-300 group-hover:text-white transition-colors">
            {event.datetime}
          </p>
          <p className="text-sm uppercase tracking-widest text-gray-500 group-hover:text-purple-300 transition-colors">
            {event.locality} — {event.address}
          </p>
        </div>
      </div>

      {/* Decorative Line */}
      <motion.div 
        className="absolute bottom-0 left-0 h-[2px] bg-purple-500 w-0 group-hover:w-full transition-all duration-700 ease-in-out"
      />
    </motion.div>
  );
};
