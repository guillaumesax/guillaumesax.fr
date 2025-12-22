
import React from 'react';

const Bio: React.FC = () => {
  return (
    <section id="bio" className="pt-4 pb-16 md:pt-8 md:pb-28 bg-[#F9F7F2] relative min-h-screen">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          
          {/* Photo Side */}
          <div className="lg:col-span-5 fade-in-on-scroll">
            <div className="relative aspect-[3/4] overflow-hidden shadow-2xl group">
              <img
                src="https://filedn.eu/lCrcyhrkkvYjfBEUTex82pz/assets/img/IMG_7950.jpeg"
                alt="Guillaume Sax - Performance Live"
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-700"></div>
              <div className="absolute inset-4 border border-white/20 pointer-events-none"></div>
              <div className="absolute bottom-6 left-6 text-white z-10">
                <p className="font-serif italic text-xl">Une ambiance magique pour votre cocktail</p>
                <p className="text-[10px] tracking-[0.4em] uppercase font-light">Guillaume Sax</p>
              </div>
            </div>
          </div>

          {/* Text Content Side */}
          <div className="lg:col-span-7 fade-in-on-scroll">
            <header className="mb-12">
              <span className="text-[10px] tracking-[0.5em] uppercase text-[#C5A059] font-bold block mb-4">Biographie</span>
              <h2 className="font-serif text-4xl md:text-6xl text-[#1A1A1A] leading-tight">
                L’expérience du temps, <br />
                <span className="italic">la justesse du moment.</span>
              </h2>
            </header>
            
            <div className="space-y-6 text-[#333333] leading-relaxed font-light text-lg text-justify">
              <p>
                Guillaume Sax découvre le saxophone à l’âge de 6 ans et développe sa formation musicale au sein de plusieurs conservatoires (Ardèche, Drôme, Rhône). Passionné, il choisit la voie professionnelle et obtient deux Diplômes d’État : l’un en saxophone jazz, l’autre en saxophone classique et contemporain.
              </p>
              
              <p>
                Parallèlement à sa carrière artistique, he enseigne le saxophone au Conservatoire de Montélimar Agglomération, où il transmet avec enthousiasme son savoir-faire et sa passion aux jeunes musiciens.
              </p>

              <p>
                Musicien aux influences éclectiques, il se produit dans des styles variés — jazz, rock, house, électro, classique, pop — en France et à l’étranger. Il est notamment membre fondateur du HALO Sax Quartet, avec lequel il réalise deux grandes tournées en Chine.
              </p>

              <p>
                Guillaume joue dans des lieux emblématiques comme le Hot Club de Lyon, Jazz à Vienne, ou le Jazz Club de Grenoble, mais aussi dans des bars, clubs, festivals et événements électro. Il collabore avec des DJs, rappeurs et producteurs sur scène ou en studio, et se produit lors d’événements prestigieux organisés dans des lieux emblématiques comme le Grand Prix de Monaco, le Casino Barrière de Montreux ou encore le restaurant Paul Bocuse.
              </p>

              <p>
                Tout au long de l’année, il se produit en solo ou en groupe pour des événements privés : mariages, séminaires, anniversaires, week-ends d’intégration… Grâce à sa grande expérience de l’événementiel, il sait s’adapter à toutes les envies pour créer une ambiance musicale sur mesure.
              </p>
            </div>

            {/* Structured Experience Sections */}
            <div className="mt-16 space-y-12">
              <div>
                <h3 className="text-[#C5A059] font-bold tracking-[0.3em] uppercase text-xs mb-6 border-b border-[#C5A059]/20 pb-2">Musicien</h3>
                <ul className="space-y-4 font-light text-[#4A4A4A]">
                  <li className="flex items-start"><span className="mr-3 text-[#C5A059]">/</span> Saxophoniste en "solo" - Orchestres, Cocktails, Clubs, Mariages, BigBand...</li>
                  <li className="flex items-start"><span className="mr-3 text-[#C5A059]">/</span> Saxophoniste Alto du Quatuor de Saxophones "HALO Sax Quartet" - Lyon</li>
                  <li className="flex items-start"><span className="mr-3 text-[#C5A059]">/</span> Saxophoniste du Duo "House and Sax" - Montélimar</li>
                  <li className="flex items-start"><span className="mr-3 text-[#C5A059]">/</span> Saxophoniste du groupe "Sunshine" - Paris/Lyon</li>
                  <li className="flex items-start"><span className="mr-3 text-[#C5A059]">/</span> Saxophoniste du Bigband de l'Ardèche - BBDA</li>
                  <li className="flex items-start"><span className="mr-3 text-[#C5A059]">/</span> Saxophoniste du Guillaume Fatamos Quartet</li>
                </ul>
              </div>

              <div>
                <h3 className="text-[#C5A059] font-bold tracking-[0.3em] uppercase text-xs mb-6 border-b border-[#C5A059]/20 pb-2">Enseignant</h3>
                <ul className="space-y-4 font-light text-[#4A4A4A]">
                  <li className="flex items-start"><span className="mr-3 text-[#C5A059]">/</span> Professeur de Saxophone au Conservatoire Montélimar Agglomération</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Bio;
