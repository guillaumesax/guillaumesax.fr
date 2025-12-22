
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1A1A1A] text-white py-16">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0">
          {/* Logo */}
          <div className="font-serif text-2xl tracking-widest font-light uppercase">
            GUILLAUME <span className="font-bold italic">SAX</span>
          </div>

          {/* Contact Details */}
          <div className="text-center md:text-left space-y-2">
            <p className="text-xs tracking-widest uppercase text-gray-500">Contact direct</p>
            <p className="text-sm font-light">
              <a href="mailto:contact@guillaumesax.fr" className="hover:text-[#C5A059] transition-colors">
                contact@guillaumesax.fr
              </a>
            </p>
          </div>

          {/* Socials */}
          <div className="flex space-x-8">
            <a 
              href="https://www.instagram.com/guillaumesaxophone/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-[#C5A059] transition-colors"
            >
              <span className="text-xs tracking-widest uppercase">Instagram</span>
            </a>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-[10px] tracking-widest text-gray-600 uppercase">
          <p>© 2026 GUILLAUME SAX - Tous droits réservés</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
