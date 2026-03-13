import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, MapPin, Instagram, Facebook, Globe, Camera } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { eventSubmissionSchema, LOCALITY_CHOICES, type EventFormData } from './formSchemas';
import { useSubmitEvent } from '../../hooks/useEvents';

export const ContactAndEventForm: React.FC = () => {
  const [captcha, setCaptcha] = useState({ a: 0, b: 0, result: 0 });
  const [isSent, setIsSent] = useState(false);

  const generateCaptcha = () => {
    const a = Math.floor(Math.random() * 10);
    const b = Math.floor(Math.random() * 10);
    setCaptcha({ a, b, result: a + b });
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { errors, isValid }
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSubmissionSchema),
    mode: 'onChange'
  });

  const selectedImage = watch('image');
  const imageFile = selectedImage && selectedImage.length > 0 ? selectedImage[0] : null;

  const { mutate: submit, isPending } = useSubmitEvent();

  const onSubmit = (data: EventFormData) => {
    if (parseInt(data.captcha) !== captcha.result) {
      setError('captcha', { type: 'manual', message: 'Resultado incorrecto' });
      return;
    }

    // Pasamos la pregunta para que el backend pueda verificar si lo desea
    data.captcha_question = `${captcha.a} + ${captcha.b}`;

    submit(data, {
      onSuccess: () => {
        setIsSent(true);
        reset();
        generateCaptcha();
        setTimeout(() => setIsSent(false), 5000);
      },
      onError: (error) => {
        console.error("Error al enviar el evento:", error);
        alert("Hubo un error al enviar el evento. Por favor intente nuevamente.");
      }
    });
  };

  return (
    <section className="py-24 bg-black relative overflow-hidden">
      {/* Artistic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        
        {/* FAQ Section - More elegant */}
        <div id="faq" className="mb-24 max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Preguntas Frecuentes</h2>
            <div className="h-1 w-24 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { q: "¿Cómo publico mi evento?", a: "Completá el formulario de 'Publicar Evento'. Revisaremos la info y la publicaremos en el tablón." },
              { q: "¿Tiene costo anunciar?", a: "No, es un servicio gratuito de la Intendencia de Lavalleja para promover la cultura local." },
              { q: "¿Qué eventos califican?", a: "Cualquier actividad cultural, artística o comunitaria abierta al público en el departamento." },
              { q: "¿Cuánto tarda en aparecer?", a: "Generalmente entre 24 y 48 horas hábiles tras la revisión del equipo de Cultura." }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-gray-900/40 backdrop-blur-sm p-6 rounded-xl border border-white/5 hover:border-purple-500/30 transition-all group"
              >
                <h3 className="text-lg font-semibold text-purple-300 mb-2 group-hover:text-purple-200 transition-colors">{item.q}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.a}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Main Form Container - Innovative Split Design */}
        <div id="anunciar" className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row bg-gray-900/50 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            
            {/* Left Side: Artistic/Info */}
            <div className="lg:w-2/5 p-8 md:p-12 bg-gradient-to-br from-purple-900/40 to-indigo-900/40 flex flex-col justify-between relative overflow-hidden">
              <div className="relative z-10">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                >
                  <Mail className="h-8 w-8 text-white" />
                </motion.div>
                <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
                  Dirección de <br/> <span className="text-purple-400">Cultura</span>
                </h2>
                <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                  ¿Querés que tu evento aparezca en el Tablón? Completá el formulario o contactanos directamente mediante nuestros canales oficiales.
                </p>
              </div>

              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-4 text-gray-300">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shrink-0">📍</div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">Dirección</p>
                    <p className="text-sm">Casa de la Cultura, Minas</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-gray-300">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shrink-0">✉️</div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">Email</p>
                    <a href="mailto:cultura@lavalleja.gub.uy" className="text-sm hover:text-purple-400 transition-colors">cultura@lavalleja.gub.uy</a>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-gray-300">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shrink-0">📞</div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">Teléfono</p>
                    <p className="text-sm">4442 2723</p>
                  </div>
                </div>
              </div>

              <div className="mt-12 relative z-10">
                <div className="flex gap-4">
                  {[<Instagram key="ig" className="w-5 h-5"/>, <Facebook key="fb" className="w-5 h-5"/>, <Globe key="web" className="w-5 h-5"/>].map((icon, i) => (
                    <a key={i} href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:bg-purple-500/20 hover:text-purple-400 transition-all border border-white/10">
                      {icon}
                    </a>
                  ))}
                </div>
              </div>

              {/* Decorative background circle */}
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
            </div>

            {/* Right Side: The Form */}
            <div className="lg:w-3/5 p-8 md:p-12 bg-gray-900/80">
              <div className="mb-12 border-b border-white/10 pb-4">
                <h3 className="text-2xl font-bold text-white">Publicar <span className="text-purple-400">Evento</span></h3>
                <p className="text-gray-500 text-sm mt-2">Completá todos los campos para enviar tu revisión.</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative group">
                      <input 
                        type="text"
                        {...register('name')}
                        className={`w-full bg-transparent border-b-2 ${errors.name ? 'border-rose-500' : 'border-gray-700'} py-2 text-white focus:outline-none focus:border-purple-500 transition-colors peer placeholder-transparent`}
                        placeholder="Nombre"
                      />
                      <label className="absolute left-0 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-purple-500 peer-focus:text-sm">Tu Nombre</label>
                      {errors.name && <span className="text-rose-500 text-[10px] uppercase font-bold mt-1 block">{errors.name.message}</span>}
                    </div>
                    <div className="relative group">
                      <input 
                        type="text"
                        {...register('phone')}
                        className={`w-full bg-transparent border-b-2 ${errors.phone ? 'border-rose-500' : 'border-gray-700'} py-2 text-white focus:outline-none focus:border-purple-500 transition-colors peer placeholder-transparent`}
                        placeholder="Teléfono"
                      />
                      <label className="absolute left-0 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-purple-500 peer-focus:text-sm">Teléfono de Contacto</label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative group">
                      <input 
                        type="email"
                        {...register('email')}
                        className={`w-full bg-transparent border-b-2 ${errors.email ? 'border-rose-500' : 'border-gray-700'} py-2 text-white focus:outline-none focus:border-purple-500 transition-colors peer placeholder-transparent`}
                        placeholder="Email"
                      />
                      <label className="absolute left-0 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-purple-500 peer-focus:text-sm">Email</label>
                      {errors.email && <span className="text-rose-500 text-[10px] uppercase font-bold mt-1 block">{errors.email.message}</span>}
                    </div>
                    <div className="relative group">
                      <input 
                        type="email"
                        {...register('confirmEmail')}
                        className={`w-full bg-transparent border-b-2 ${errors.confirmEmail ? 'border-rose-500' : 'border-gray-700'} py-2 text-white focus:outline-none focus:border-purple-500 transition-colors peer placeholder-transparent`}
                        placeholder="Confirmar Email"
                      />
                      <label className="absolute left-0 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-purple-500 peer-focus:text-sm">Repetir Email</label>
                      {errors.confirmEmail && <span className="text-rose-500 text-[10px] uppercase font-bold mt-1 block">{errors.confirmEmail.message}</span>}
                    </div>
                  </div>

                  <div className="pt-4 space-y-6">
                    <div className="relative group">
                      <input 
                        type="text"
                        {...register('eventName')}
                        className={`w-full bg-transparent border-b-2 ${errors.eventName ? 'border-rose-500' : 'border-gray-700'} py-2 text-white focus:outline-none focus:border-purple-500 transition-colors peer placeholder-transparent`}
                        placeholder="Evento"
                      />
                      <label className="absolute left-0 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-purple-500 peer-focus:text-sm">Nombre del Evento</label>
                      {errors.eventName && <span className="text-rose-500 text-[10px] uppercase font-bold mt-1 block">{errors.eventName.message}</span>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="relative group">
                        <select 
                          {...register('locality')}
                          className={`w-full bg-transparent border-b-2 ${errors.locality ? 'border-rose-500' : 'border-gray-700'} py-2 text-white focus:outline-none focus:border-purple-500 transition-colors appearance-none`}
                        >
                          {LOCALITY_CHOICES.map(loc => (
                            <option key={loc} value={loc} className="bg-gray-900">{loc}</option>
                          ))}
                        </select>
                        <label className="absolute left-0 -top-3.5 text-purple-500 text-sm">Localidad</label>
                        {errors.locality && <span className="text-rose-500 text-[10px] uppercase font-bold mt-1 block">{errors.locality.message}</span>}
                      </div>
                      <div className="relative group">
                        <input 
                          type="date"
                          {...register('datetime')}
                          className={`w-full bg-transparent border-b-2 ${errors.datetime ? 'border-rose-500' : 'border-gray-700'} py-2 text-white focus:outline-none focus:border-purple-500 transition-colors peer`}
                        />
                        <label className="absolute left-0 -top-3.5 text-purple-500 text-sm">Fecha</label>
                        {errors.datetime && <span className="text-rose-500 text-[10px] uppercase font-bold mt-1 block">{errors.datetime.message}</span>}
                      </div>
                    </div>

                    <div className="relative group">
                      <input 
                        type="text"
                        {...register('address')}
                        className={`w-full bg-transparent border-b-2 ${errors.address ? 'border-rose-500' : 'border-gray-700'} py-2 text-white focus:outline-none focus:border-purple-500 transition-colors peer placeholder-transparent`}
                        placeholder="Dirección"
                      />
                      <label className="absolute left-0 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-purple-500 peer-focus:text-sm">Dirección del Evento (opcional)</label>
                      {errors.address && <span className="text-rose-500 text-[10px] uppercase font-bold mt-1 block">{errors.address.message}</span>}
                    </div>

                    <div className="relative group">
                      <textarea 
                        {...register('description')}
                        className={`w-full bg-transparent border-b-2 ${errors.description ? 'border-rose-500' : 'border-gray-700'} py-2 text-white focus:outline-none focus:border-purple-500 transition-colors peer placeholder-transparent min-h-[100px] resize-none`}
                        placeholder="Descripción"
                      ></textarea>
                      <label className="absolute left-0 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-purple-500 peer-focus:text-sm">Descripción del Evento</label>
                      {errors.description && <span className="text-rose-500 text-[10px] uppercase font-bold mt-1 block">{errors.description.message}</span>}
                    </div>

                    <div className="relative group">
                      <div className="flex items-center gap-4 p-4 border-2 border-dashed border-gray-700 rounded-xl hover:border-purple-500 transition-colors cursor-pointer group">
                        <Camera className="w-6 h-6 text-gray-500 group-hover:text-purple-400" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-400">
                            {imageFile ? imageFile.name : 'Subir imagen del evento (Opcional)'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Solo JPG, PNG o WEBP. Máx 2MB.</p>
                          <input 
                            type="file"
                            accept="image/jpeg, image/png, image/webp"
                            {...register('image')}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </div>
                      </div>
                      {errors.image && <span className="text-rose-500 text-[10px] uppercase font-bold mt-1 block">{errors.image.message as string}</span>}
                    </div>

                    {/* Captcha */}
                    <div className="pt-4">
                      <div className="flex items-center gap-4">
                        <div className="px-4 py-2 bg-purple-500/10 rounded-lg border border-purple-500/30 text-purple-400 font-bold tracking-widest min-w-[100px] text-center">
                          {captcha.a} + {captcha.b} =
                        </div>
                        <div className="relative flex-1">
                          <input 
                            type="number"
                            {...register('captcha')}
                            className={`w-full bg-transparent border-b-2 ${errors.captcha ? 'border-rose-500' : 'border-gray-700'} py-2 text-white focus:outline-none focus:border-purple-500 transition-colors peer placeholder-transparent`}
                            placeholder="?"
                          />
                          <label className="absolute left-0 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-purple-500 peer-focus:text-sm">Resultado</label>
                          {errors.captcha && <span className="text-rose-500 text-[10px] uppercase font-bold mt-1 block">{errors.captcha.message}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {isSent && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm text-center"
                    >
                      ¡Evento enviado con éxito! Un administrador lo revisará pronto.
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit" 
                  disabled={!isValid || isPending}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl shadow-[0_10px_20_rgba(126,34,206,0.3)] hover:shadow-[0_15px_30px_rgba(126,34,206,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
                >
                  {isPending ? 'Enviando...' : 'Publicar mi Evento'}
                </motion.button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
