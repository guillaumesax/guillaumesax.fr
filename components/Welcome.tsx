
import React from 'react';

const Welcome: React.FC = () => {
  return (
    <section className="pt-16 pb-4 md:pt-24 md:pb-6 bg-[#F9F7F2] relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="fade-in-on-scroll flex flex-col items-center text-center">
          {/* Decorative element */}
          <div className="w-12 h-[1px] bg-[#C5A059] mb-8 opacity-50"></div>
          
          <h2 className="font-serif text-3xl md:text-5xl text-[#1A1A1A] leading-tight mb-8 max-w-3xl">
            Bienvenue sur le site de <br />
            <span className="italic text-[#C5A059] font-light">Guillaume Sax</span>
          </h2>
          
          <div className="max-w-3xl mx-auto">
            <p className="text-[#333333] font-light text-lg md:text-xl leading-relaxed mb-6 text-justify md:text-center italic">
              "Saxophoniste professionnel et enseignant passionné. Du jazz à l’électro, de la scène au studio, du concert intimiste au festival en passant par les événements privés, Guillaume propose une expérience musicale unique, vivante et adaptée à chaque contexte."
            </p>
            
            <p className="text-[#1A1A1A] font-medium tracking-[0.3em] uppercase text-[10px] md:text-xs border-t border-[#C5A059]/20 pt-6 inline-block">
              Découvrez ses projets, ses prestations et son univers sonore.
            </p>
          </div>

          {/* Decorative element - Reduced margin top */}
          <div className="w-12 h-[1px] bg-[#C5A059] mt-4 opacity-50"></div>
        </div>
      </div>
      
      {/* Subtle background detail */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 pointer-events-none opacity-[0.03] select-none">
        <span className="font-bogle text-[20vw] leading-none">SAX</span>
      </div>
    </section>
  );
};

export default Welcome;
