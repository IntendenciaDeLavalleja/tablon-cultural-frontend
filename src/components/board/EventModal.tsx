import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { EventItem } from './boardUtils';

interface EventModalProps {
  event: EventItem | null;
  onClose: () => void;
}

export const EventModal: React.FC<EventModalProps> = ({ event, onClose }) => {
  if (!event) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/90 backdrop-blur-md"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-5xl bg-gray-900 rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(168,85,247,0.2)] flex flex-col md:flex-row"
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 z-50 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-purple-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Left: Image Section */}
          <div className="md:w-1/2 h-64 md:h-auto relative overflow-hidden">
            <motion.img 
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.5 }}
              src={event.image} 
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent md:bg-gradient-to-r" />
            
            {/* Artistic Badge */}
            <div className="absolute bottom-8 left-8">
              <span className="px-4 py-1 bg-purple-600 text-white text-xs uppercase tracking-[0.3em] font-bold rounded-full shadow-lg">
                {event.category || 'Evento'}
              </span>
            </div>
          </div>

          {/* Right: Info Section */}
          <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative">
            {/* Decorative background text */}
            <div className="absolute top-0 right-0 text-[10rem] font-bold text-white/[0.02] select-none pointer-events-none font-ink leading-none">
              {event.locality[0]}
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 font-ink leading-tight">
                {event.title}
              </h2>
              
              <div className="flex flex-wrap gap-6 mb-8 text-gray-400 text-sm uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <span className="text-purple-500">📍</span> {event.locality}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-500">📅</span> {new Date(event.datetime + 'T12:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                </div>
              </div>

              <div className="h-px w-24 bg-gradient-to-r from-purple-500 to-transparent mb-8" />

              <p className="text-gray-300 text-lg leading-relaxed mb-8 font-light italic">
                "{event.description}"
              </p>

              <div className="space-y-4 mb-10">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-purple-400 border border-white/10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-tighter">Lugar</p>
                    <p className="text-white">{event.address}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
