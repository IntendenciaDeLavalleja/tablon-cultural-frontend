import React from 'react';
import { motion } from 'framer-motion';
import type { EventItem, Placement } from './boardUtils';
import { clsx } from 'clsx';

interface NoteCardProps {
  event: EventItem;
  placement?: Placement;
  isMobile: boolean;
  onOpen: (event: EventItem) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({ event, placement, isMobile, onOpen }) => {
  // Random float duration for variety
  const floatDuration = React.useMemo(() => 3 + Math.random() * 2, []);
  
  const isPinned = !isMobile && placement;

  return (
    <motion.article
      className={clsx(
        "paper-note p-4 w-64 min-h-[180px] flex flex-col justify-between",
        isPinned ? "absolute" : "relative w-full max-w-sm mx-auto mb-4 rotate-1"
      )}
      style={
        isPinned
          ? {
              top: `${placement.top}%`,
              left: `${placement.left}%`,
              zIndex: 10,
              willChange: 'transform',
            }
          : { willChange: 'transform' }
      }
      initial={{ 
        rotate: isPinned ? placement.rotate : (Math.random() - 0.5) * 4,
        y: 0 
      }}
      animate={
        isPinned
          ? {
              y: [0, -8, 0],
            }
          : undefined
      }
      transition={
        isPinned
          ? {
              y: {
                duration: floatDuration,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }
          : undefined
      }
      whileHover={{ 
        scale: 1.05, 
        rotate: 0,
        zIndex: 20,
        transition: { duration: 0.2 }
      }}
    >
      {/* Pin visual is handled by CSS ::before on .paper-note */}
      
      <div className="font-ink">
        <h3 className="text-xl font-bold mb-2 leading-tight text-gray-900 border-b border-gray-300 pb-1">
          {event.title}
        </h3>
        
        <div className="space-y-1 text-gray-700 text-sm">
          <p className="flex items-center gap-1">
            <span className="font-semibold">📍</span> {event.locality}
          </p>
          {event.address && (
            <p className="text-xs text-gray-600 pl-5">{event.address}</p>
          )}
          <p className="flex items-center gap-1 mt-2 font-semibold text-indigo-900">
            <span className="">📅</span> {new Date(event.datetime + 'T12:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="mt-3 text-right">
        <button 
          onClick={() => onOpen(event)}
          className="btn btn-xs btn-ghost text-gray-500 hover:text-indigo-600 font-ink"
        >
          + Info
        </button>
      </div>
    </motion.article>
  );
};
