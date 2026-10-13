import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { navigate } from 'astro:transitions/client';

interface NavbarProps {
  onGoTo: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onGoTo }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { id: 'tablon', label: 'Tablón' },
    { id: 'agenda', label: 'Agenda' },
    { id: 'faq', label: 'FAQ' },
    { id: 'contacto', label: 'Contacto' },
  ];

  const handleNavClick = (id: string) => {
    if (id === 'agenda') {
      navigate('/agenda');
    } else {
      // If we are not on the home page, navigate home first
      if (window.location.pathname !== '/') {
        navigate(`/#${id}`);
      } else {
        onGoTo(id);
      }
    }
    setIsOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-gray-900/80 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <div 
          className="text-xl md:text-2xl font-bold text-white cursor-pointer flex items-center gap-2"
          onClick={() => handleNavClick('hero')}
        >
          <span className="text-purple-400">✦</span>
          <span className="font-ink">Tablón Cultural</span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className="text-gray-300 hover:text-purple-400 transition-colors text-sm font-medium uppercase tracking-wider"
            >
              {link.label}
            </button>
          ))}
          <button 
            onClick={() => handleNavClick('anunciar')}
            className="btn btn-sm btn-primary bg-purple-600 hover:bg-purple-700 border-none text-white shadow-[0_0_15px_rgba(168,85,247,0.5)] hover:shadow-[0_0_25px_rgba(168,85,247,0.7)] transition-all"
          >
            Anunciar Evento
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white p-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-gray-900 border-b border-white/10 overflow-hidden"
          >
            <div className="flex flex-col p-4 gap-4">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className="text-left text-gray-300 hover:text-purple-400 py-2"
                >
                  {link.label}
                </button>
              ))}
              <button 
                onClick={() => handleNavClick('anunciar')}
                className="btn btn-primary w-full bg-purple-600 border-none"
              >
                Anunciar Evento
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
