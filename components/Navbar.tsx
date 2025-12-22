
import React, { useState, useEffect } from 'react';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fermer le menu lors du redimensionnement si on repasse sur desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems = [
    { label: 'ACCUEIL', href: '#accueil' },
    { label: 'BIO', href: '#bio' },
    { label: 'INSTAGRAM', href: '#instagram' },
    { label: 'CONTACT', href: '#contact' },
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-[60] transition-all duration-500 ${
          isScrolled || isMenuOpen
            ? 'bg-black/95 backdrop-blur-md py-4 shadow-xl'
            : 'bg-transparent py-8'
        }`}
      >
        <div className="container mx-auto px-6 flex justify-between items-center">
          <a 
            href="#accueil" 
            className="font-serif text-white text-xl tracking-widest font-light uppercase group z-[70]"
            onClick={() => setIsMenuOpen(false)}
          >
            GUILLAUME <span className="font-bold italic group-hover:text-[#C5A059] transition-colors">SAX</span>
          </a>
          
          {/* Desktop Menu */}
          <ul className="hidden md:flex space-x-10">
            {navItems.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className="text-white text-xs tracking-[0.25em] font-medium hover:text-[#C5A059] transition-colors py-2 block border-b border-transparent hover:border-[#C5A059]/50"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Mobile Menu Button (Hamburger) */}
          <button 
            onClick={toggleMenu}
            className="md:hidden text-white focus:outline-none p-2 z-[70]"
            aria-label="Toggle Menu"
          >
            <div className="w-6 h-5 relative flex flex-col justify-between">
              <span className={`w-full h-[1px] bg-white transition-all duration-300 origin-left ${isMenuOpen ? 'rotate-45 translate-x-[2px]' : ''}`}></span>
              <span className={`w-full h-[1px] bg-white transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`w-full h-[1px] bg-white transition-all duration-300 origin-left ${isMenuOpen ? '-rotate-45 translate-x-[2px]' : ''}`}></span>
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 bg-black z-[50] flex items-center justify-center transition-all duration-500 ease-in-out md:hidden ${
          isMenuOpen ? 'translate-y-0 opacity-100 visible' : '-translate-y-full opacity-0 invisible'
        }`}
      >
        <ul className="flex flex-col items-center space-y-8 text-center">
          {navItems.map((item, index) => (
            <li 
              key={item.label}
              className={`transition-all duration-500 delay-[${index * 100}ms] ${
                isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
            >
              <a
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="text-white text-2xl tracking-[0.4em] font-serif hover:text-[#C5A059] transition-colors uppercase py-2 block"
              >
                {item.label}
              </a>
              <div className="w-8 h-[1px] bg-[#C5A059]/30 mx-auto mt-2"></div>
            </li>
          ))}
          <li className={`pt-12 transition-all duration-700 delay-500 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}>
             <p className="text-[#C5A059] text-[10px] tracking-[0.5em] font-light">SAXOPHONISTE PROFESSIONNEL</p>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Navbar;
