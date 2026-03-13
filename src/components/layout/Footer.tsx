import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-gray-400 py-8 border-t border-white/10">
      <div className="container mx-auto px-4 text-center">
        <h3 className="text-white font-bold text-lg mb-2">Dirección de Cultura</h3>
        <p className="mb-4">Intendencia de Lavalleja (IDL)</p>
        <div className="text-sm opacity-70">
          <p>© {new Date().getFullYear()} Tablón Cultural Lavalleja. Todos los derechos reservados.</p>
          <p className="mt-2">Promoviendo la cultura y el arte en nuestra comunidad.</p>
        </div>
      </div>
    </footer>
  );
};
