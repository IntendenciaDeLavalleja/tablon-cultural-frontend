import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useHeroImages } from '../../hooks/useHeroImages';

interface HeroProps {
  onGoTo: (id: string) => void;
}

interface Slide {
  key: string;
  src: string;
  alt: string;
  objectPosition: string;
}

// Respaldo local, usado mientras carga el backend o si no hay portadas cargadas
const FALLBACK_SLIDES: Slide[] = [
  {
    key: 'fallback-1',
    src: '/images/carrusel/1.webp',
    alt: 'Músico tocando la guitarra frente al micrófono en el escenario de la Semana de Lavalleja',
    objectPosition: '50% 30%',
  },
  {
    key: 'fallback-2',
    src: '/images/carrusel/2.webp',
    alt: 'Banda en vivo tocando bajo luces amarillas en un escenario al aire libre',
    objectPosition: '50% 40%',
  },
  {
    key: 'fallback-3',
    src: '/images/carrusel/3.webp',
    alt: 'Público entusiasmado disfrutando de un concierto nocturno',
    objectPosition: '30% 30%',
  },
];

const DEFAULT_OBJECT_POSITION = '50% 35%';
const SLIDE_INTERVAL_MS = 6000;

export const Hero: React.FC<HeroProps> = ({ onGoTo }) => {
  const [current, setCurrent] = useState(0);
  const reduceMotion = useReducedMotion();
  const { data: remoteImages } = useHeroImages();

  const slides = useMemo<Slide[]>(
    () =>
      remoteImages && remoteImages.length > 0
        ? remoteImages.map(({ id, url, alt }) => ({
            key: String(id),
            src: url,
            alt,
            objectPosition: DEFAULT_OBJECT_POSITION,
          }))
        : FALLBACK_SLIDES,
    [remoteImages],
  );

  // La lista puede cambiar de largo al refrescarse, por eso se acota el índice
  const activeIndex = current % slides.length;
  const slide = slides[activeIndex];

  useEffect(() => {
    slides.forEach(({ src }) => {
      const preloaded = new Image();
      preloaded.src = src;
    });
  }, [slides]);

  useEffect(() => {
    if (reduceMotion || slides.length < 2) return;
    const timer = window.setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [reduceMotion, slides.length]);

  return (
    <section
      id="hero"
      className="relative isolate flex min-h-[92svh] md:min-h-[90vh] items-center justify-center overflow-hidden bg-gray-900"
    >
      {/* Carrusel de fondo */}
      <div className="absolute inset-0 -z-10">
        <AnimatePresence initial={false}>
          <motion.img
            key={slide.key}
            src={slide.src}
            alt={slide.alt}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: slide.objectPosition }}
            initial={{ opacity: 0, scale: reduceMotion ? 1 : 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 1.2, ease: 'easeInOut' },
              scale: { duration: reduceMotion ? 0 : 8, ease: 'easeOut' },
            }}
          />
        </AnimatePresence>

        {/* Degradados para legibilidad y fusión con la página */}
        <div className="absolute inset-0 bg-linear-to-b from-gray-900/75 via-gray-900/50 md:via-gray-900/30 to-gray-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(3,7,18,0.65)_100%)]" />
        <div className="absolute inset-0 bg-linear-to-t from-purple-950/40 via-transparent to-transparent" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        className="container mx-auto relative z-10 px-6 pt-12 pb-20 md:pb-24 text-center"
      >
        <h1 className="mx-auto max-w-4xl font-ink text-5xl sm:text-6xl md:text-7xl leading-[1.05] font-bold text-transparent bg-clip-text bg-linear-to-r from-purple-200 via-fuchsia-400 to-pink-400 drop-shadow-[0_4px_24px_rgba(0,0,0,0.55)] mb-6">
          Tablón Cultural Lavalleja
        </h1>

        <p className="mx-auto max-w-2xl text-lg sm:text-xl md:text-2xl leading-relaxed text-gray-100 drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)] mb-10">
          El punto de encuentro digital para la cultura en las sierras. <br className="hidden sm:block" />
          Descubrí eventos, talleres y espectáculos en tu localidad.
        </p>

        <div className="mx-auto flex max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center sm:gap-4">
          <button
            type="button"
            onClick={() => onGoTo('today-events')}
            className="inline-flex items-center justify-center rounded-full bg-pink-600 px-7 py-3.5 text-base sm:text-lg font-semibold text-white shadow-lg shadow-pink-600/40 transition-all duration-300 hover:-translate-y-0.5 hover:bg-pink-500 hover:shadow-pink-500/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-300 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
          >
            ¿Qué hay Hoy?
          </button>
          <button
            type="button"
            onClick={() => onGoTo('tablon')}
            className="inline-flex items-center justify-center rounded-full bg-purple-600 px-7 py-3.5 text-base sm:text-lg font-semibold text-white shadow-lg shadow-purple-600/40 transition-all duration-300 hover:-translate-y-0.5 hover:bg-purple-500 hover:shadow-purple-500/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
          >
            Ver Tablón
          </button>
          <button
            type="button"
            onClick={() => onGoTo('anunciar')}
            className="inline-flex items-center justify-center rounded-full border border-purple-300/60 bg-white/5 px-7 py-3.5 text-base sm:text-lg font-semibold text-purple-100 shadow-[0_0_14px_rgba(168,85,247,0.25)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-purple-200 hover:bg-white/10 hover:text-white hover:shadow-[0_0_24px_rgba(168,85,247,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
          >
            Anunciar Evento
          </button>
        </div>
      </motion.div>

      {/* Indicadores del carrusel */}
      {slides.length > 1 && (
        <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center gap-1">
          {slides.map((item, index) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setCurrent(index)}
              aria-label={`Ver imagen ${index + 1}`}
              aria-current={index === activeIndex}
              className="flex items-center justify-center p-2.5 focus-visible:outline-none"
            >
              <span
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  index === activeIndex ? 'w-8 bg-pink-500' : 'w-3 bg-white/50 hover:bg-white/80'
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
};