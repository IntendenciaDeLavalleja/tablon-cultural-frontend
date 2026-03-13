import type { EventFormData } from '../components/sections/formSchemas';
import abril1 from '../images/Abril1.webp';
import abril2 from '../images/Abril2.webp';
import alfajor from '../images/Alfajor.webp';
import rally from '../images/Rally.webp';

const STATIC_EVENTS = [
  {
    id: 'alfajor-gigante-minas',
    title: 'Festival Internacional del Alfajor mas Grande del Mundo',
    locality: 'Minas',
    address: 'Parque Rodo',
    datetime: '2026-05-03',
    description:
      'Evento internacional en Minas que promete romper records con musica, comida, fiesta y el alfajor mas grande del mundo.',
    image: alfajor.src,
    category: 'Festival',
  },
  {
    id: 'minas-abril-10',
    title: 'Festival Minas y Abril - Jineteada Dia 1',
    locality: 'Minas',
    address: 'Parque Rodo',
    datetime: '2026-04-10',
    description:
      'Primera jornada de jineteada del Festival Minas y Abril con bandas en vivo en el Parque Rodo de Minas.',
    image: abril1.src,
    category: 'Tradicion',
  },
  {
    id: 'minas-abril-11',
    title: 'Festival Minas y Abril - Eventos Musicales Dia 2',
    locality: 'Minas',
    address: 'Parque Rodo',
    datetime: '2026-04-11',
    description:
      'Segunda jornada del Festival Minas y Abril enfocada en eventos musicales, con bandas en vivo en el Parque Rodo de Minas.',
    image: abril2.src,
    category: 'Musica',
  },
  {
    id: 'rally-serrano-minas',
    title: 'Rally Serrano',
    locality: 'Minas',
    address: 'Sierras de Minas',
    datetime: '2026-06-21',
    description:
      'Evento internacional de rally en las sierras de Minas con tramos tecnicos y equipos de varias regiones.',
    image: rally.src,
    category: 'Deporte',
  },
];

export const getEvents = async (showAll = false) => {
  void showAll;
  return STATIC_EVENTS;
};

export const submitEvent = async (formData: EventFormData) => {
  void formData;
  await new Promise((resolve) => setTimeout(resolve, 500));
  return { ok: true, mode: 'static-demo' };
};
