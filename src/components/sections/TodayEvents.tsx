import React from 'react';
import { motion } from 'framer-motion';
import { useEvents } from '../../hooks/useEvents';
import type { EventItem } from '../board/boardUtils';
import { Calendar, MapPin } from 'lucide-react';

export const TodayEvents: React.FC = () => {
  const { data: events = [], isLoading } = useEvents();
  
  const todayStr = new Date().toLocaleDateString('en-CA');
  const todayEvents = events.filter((event: EventItem) => event.datetime === todayStr);

  return (
    <section id="today-events" className="py-12 bg-gray-900 border-y border-white/5 scroll-mt-20">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-center justify-between gap-8"
        >
          <div className="shrink-0">
            <h2 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
              <span className="w-2 h-8 bg-purple-500 rounded-full animate-pulse" />
              ¿Qué eventos hay <span className="text-purple-400 italic">Hoy</span>?
            </h2>
          </div>

          <div className="flex-1 w-full text-center md:text-left">
            {isLoading ? (
              <div className="flex justify-center md:justify-start">
                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : todayEvents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {todayEvents.map((event: EventItem) => (
                  <motion.div
                    key={event.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-2xl flex items-center gap-4 group hover:border-purple-500/50 transition-all"
                  >
                    {event.image && (
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/10">
                        <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-bold truncate group-hover:text-purple-400 transition-colors">{event.title}</h4>
                      <div className="flex flex-col text-xs text-gray-400 mt-1 space-y-0.5 text-left">
                        <span className="flex items-center gap-1.5 line-clamp-1">
                          <MapPin className="w-3 h-3 text-purple-500" /> {event.locality}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-purple-500" /> Hoy
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-gray-400 font-medium italic">
                No hay eventos programados para el día de hoy. ¡Animate a publicar el tuyo!
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
