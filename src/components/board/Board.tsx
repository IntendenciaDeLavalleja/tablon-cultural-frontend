import React, { useState, useEffect, useRef } from 'react';
import { NoteCard } from './NoteCard';
import { EventModal } from './EventModal';
import { generatePlacements, type EventItem, type Placement } from './boardUtils';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEvents } from '../../hooks/useEvents';

const EMPTY_ARRAY: any[] = [];

export const Board: React.FC = () => {
  const { data: eventsData, isLoading } = useEvents();
  const events = eventsData || EMPTY_ARRAY;
  const [isMobile, setIsMobile] = useState(false);
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Motion values for parallax (avoids re-renders)
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  // Smooth springs
  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  // Map normalized values to pixel offsets
  const translateX = useTransform(smoothX, [0, 1], [20, -20]);
  const translateY = useTransform(smoothY, [0, 1], [20, -20]);

  useEffect(() => {
    // Initial placements
    setPlacements(generatePlacements(events));

    // Resize handler
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [events]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isMobile || !containerRef.current) return;
    
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    
    // Set normalized position (0 to 1)
    mouseX.set(clientX / innerWidth);
    mouseY.set(clientY / innerHeight);
  };

  if (isLoading) {
    return (
      <div className="h-[600px] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <section 
      id="tablon" 
      className="relative w-full min-h-screen overflow-hidden board-bg"
      onMouseMove={handleMouseMove}
      ref={containerRef}
    >
      <div className="board-overlay" />
      
      {/* Content Container */}
      <div className="relative z-10 w-full h-full min-h-screen p-4 md:p-8">
        
        {/* Header on the board */}
        <div className="text-center mb-8 md:mb-0 md:absolute md:top-8 md:left-8 md:text-left z-20 pointer-events-none">
          <h2 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg font-ink rotate-[-2deg]">
            Tablón de Anuncios
          </h2>
          <p className="text-gray-200 text-lg font-ink rotate-[-1deg]">
            Lo que está pasando en Lavalleja
          </p>
        </div>

        {/* Cards Layer with Parallax */}
        <motion.div 
          className="w-full h-full min-h-[80vh] md:min-h-screen relative flex flex-col md:block gap-6"
          style={{
            x: isMobile ? 0 : translateX,
            y: isMobile ? 0 : translateY
          }}
        >
          {events.map((event) => {
            const placement = placements.find(p => p.id === event.id);
            return (
              <NoteCard 
                key={event.id} 
                event={event} 
                placement={placement} 
                isMobile={isMobile} 
                onOpen={setSelectedEvent}
              />
            );
          })}
        </motion.div>
      </div>

      <EventModal 
        event={selectedEvent} 
        onClose={() => setSelectedEvent(null)} 
      />
    </section>
  );
};
