import React from 'react';
import { motion } from 'framer-motion';

interface HeroProps {
  onGoTo: (id: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onGoTo }) => {
  return (
    <section id="hero" className="relative min-h-[80vh] flex items-center justify-center p-4 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-aurora opacity-80" />
      <div className="absolute inset-0 bg-[url('/images/noise.webp')] opacity-5 mix-blend-overlay" /> {/* Optional noise texture if available, otherwise ignored */}
      
      <div className="container mx-auto relative z-10 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-gray-900/60 backdrop-blur-xl p-8 md:p-12 rounded-2xl neon-border text-center shadow-2xl"
        >
          <motion.h1 
            className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 mb-6 font-ink"
            animate={{ backgroundPosition: ['0%', '200%'] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            style={{ backgroundSize: '200% auto' }}
          >
            Tablón Cultural Lavalleja
          </motion.h1>
          
          <p className="text-xl md:text-2xl text-gray-200 mb-8 leading-relaxed">
            El punto de encuentro digital para la cultura en las sierras. <br/>
            Descubrí eventos, talleres y espectáculos en tu localidad.
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button 
              onClick={() => onGoTo('today-events')}
              className="btn btn-lg bg-pink-600 hover:bg-pink-700 text-white border-none shadow-lg hover:shadow-pink-500/50 transition-all transform hover:-translate-y-1"
            >
              ¿Qué hay Hoy?
            </button>
            <button 
              onClick={() => onGoTo('tablon')}
              className="btn btn-lg bg-purple-600 hover:bg-purple-700 text-white border-none shadow-lg hover:shadow-purple-500/50 transition-all transform hover:-translate-y-1"
            >
              Ver Tablón
            </button>
            <button 
              onClick={() => onGoTo('anunciar')}
              className="btn btn-lg btn-outline text-purple-300 border-purple-400 hover:bg-purple-900/50 hover:text-white hover:border-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.2)] hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all"
            >
              Anunciar Evento
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
