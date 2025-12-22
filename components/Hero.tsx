
import React from 'react';

const Hero: React.FC = () => {
  return (
    <section id="accueil" className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background Image with Ken Burns effect */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://filedn.eu/lCrcyhrkkvYjfBEUTex82pz/assets/img/Accueil.jpeg"
          alt="Saxophoniste Professionnel Mariage"
          className="w-full h-full object-cover scale-110 animate-[zoom_20s_infinite_alternate]"
        />
        <div className="absolute inset-0 bg-black/40 bg-gradient-to-b from-black/50 via-transparent to-black/30"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 w-full max-w-[100vw] animate-in fade-in duration-1000">
        <h1 className="font-ephesis text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-white leading-tight mb-6 tracking-normal drop-shadow-lg">
          Vibrez au son du saxophone
        </h1>
        <p className="text-white/90 text-[10px] md:text-sm tracking-[0.2em] md:tracking-[0.35em] font-light mb-14 uppercase max-w-xs md:max-w-none mx-auto">
          Cocktails, cérémonies, soirées privées – partout en France
        </p>
        <a
          href="#contact"
          className="inline-block px-10 md:px-12 py-4 border border-white/50 text-white text-[10px] tracking-[0.3em] uppercase hover:bg-white hover:text-black hover:border-white transition-all duration-500 backdrop-blur-sm shadow-2xl"
        >
          Me contacter
        </a>
      </div>

      <style>{`
        @keyframes zoom {
          from { transform: scale(1); }
          to { transform: scale(1.15); }
        }
      `}</style>
    </section>
  );
};

export default Hero;
