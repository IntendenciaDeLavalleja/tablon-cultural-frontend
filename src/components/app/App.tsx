import React from 'react';
import { motion } from 'framer-motion';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navbar } from '../layout/Navbar';
import { Footer } from '../layout/Footer';
import { Hero } from '../sections/Hero';
import { TodayEvents } from '../sections/TodayEvents';
import { Board } from '../board/Board';
import { ContactAndEventForm } from '../sections/ContactAndEventForm';

const queryClient = new QueryClient();

export const App: React.FC = () => {
  const handleGoTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-900 text-white font-sans selection:bg-purple-500 selection:text-white">
        <Navbar onGoTo={handleGoTo} />
        
        <main>
          <Hero onGoTo={handleGoTo} />
          
          <TodayEvents />
          
          <Board />
          
          {/* Agenda CTA Section */}
          <section className="py-32 bg-black relative overflow-hidden group">
          <div className="absolute inset-0 bg-[url('/images/gallery.webp')] bg-cover bg-center opacity-20 grayscale group-hover:scale-110 transition-transform duration-1000" />
          <div className="absolute inset-0 bg-linear-to-b from-gray-900 via-transparent to-gray-900" />
          
          <div className="container mx-auto px-4 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl md:text-7xl font-gallery text-white mb-8 tracking-tighter">
                Agenda <span className="text-purple-500 italic">Completa</span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto mb-12 text-lg leading-relaxed">
                Sumergite en nuestra curaduría completa de eventos. Una experiencia visual diseñada para los amantes de la cultura.
              </p>
              <a 
                href="/agenda"
                className="inline-block px-12 py-5 bg-white text-black font-gallery text-xl hover:bg-purple-600 hover:text-white transition-all duration-500 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_50px_rgba(168,85,247,0.4)]"
              >
                Explorar Galería
              </a>
            </motion.div>
          </div>
        </section>

        <ContactAndEventForm />
      </main>

      <Footer />
      </div>
    </QueryClientProvider>
  );
};
