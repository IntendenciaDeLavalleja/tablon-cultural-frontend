import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navbar } from '../layout/Navbar';
import { Footer } from '../layout/Footer';
import { AgendaGallery } from '../sections/AgendaGallery';
import { useEvents } from '../../hooks/useEvents';
import { navigate } from 'astro:transitions/client';

const queryClient = new QueryClient();

export const AgendaAppContent: React.FC = () => {
  const { data: events = [], isLoading, isError, refetch } = useEvents(true);

  const handleGoTo = (id: string) => {
    if (id === 'hero' || id === 'tablon' || id === 'contacto' || id === 'anunciar' || id === 'faq') {
      navigate(`/#${id}`);
    } else {
      const element = document.getElementById(id);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500 selection:text-white">
      <Navbar onGoTo={handleGoTo} />
      <main>
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : isError ? (<div className="p-24"><p role="alert">No se pudo cargar la agenda.</p><button onClick={() => refetch()}>Reintentar</button></div>) : (
          <AgendaGallery events={events} />
        )}
      </main>
      <Footer />
    </div>
  );
};

export const AgendaApp: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AgendaAppContent />
    </QueryClientProvider>
  );
};
