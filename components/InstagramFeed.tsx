
import React, { useEffect } from 'react';

const InstagramFeed: React.FC = () => {
  useEffect(() => {
    // 1. Gestion du script Tagembed
    const scriptId = 'tagembed-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    const loadWidget = () => {
      const win = window as any;
      if (win.tagembed && typeof win.tagembed.init === 'function') {
        win.tagembed.init();
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = "https://widget.tagembed.com/embed.min.js";
      script.type = "text/javascript";
      script.async = true;
      script.onload = loadWidget;
      document.body.appendChild(script);
    } else {
      // Si le script est déjà présent (navigation SPA), on tente de forcer l'init
      loadWidget();
    }
  }, []);

  useEffect(() => {
    // 2. Script de nettoyage dynamique (Intervalle) pour supprimer le bouton d'avis récalcitrant
    // Cette boucle de surveillance assure la suppression des éléments injectés après le rendu
    const interval = setInterval(() => {
      const selectors = [
        '.tagembed-social-wall-review-btn',
        '.tagembed-collect-review-button',
        '.tagembed-review-button',
        '.tag-collect-btn',
        '[class*="review-btn"]',
        '[class*="collect-btn"]',
        '[class*="review-button"]'
      ];
      
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          (el as HTMLElement).style.display = 'none';
          el.remove();
        });
      });

      // Nettoyage des logos et mentions commerciales pour un look premium
      const watermarks = document.querySelectorAll('.tagembed-logo, .tagembed-powered-by, .tagembed-watermark, .tagembed-copyright');
      watermarks.forEach(el => el.remove());

    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="instagram" className="pt-16 pb-8 md:pt-28 md:pb-12 bg-white">
      {/* CSS global en renfort pour masquer les boutons d'avis dès leur injection */}
      <style dangerouslySetInnerHTML={{ __html: `
        .tagembed-widget .tagembed-social-wall-review-btn,
        .tagembed-widget .tagembed-collect-review-button,
        .tagembed-widget .tagembed-review-button,
        .tagembed-widget .tag-collect-btn,
        .tagembed-widget [class*="collect-btn"],
        .tagembed-widget [class*="review-button"],
        .tagembed-widget [class*="review-btn"] {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
        
        .tagembed-widget .tagembed-logo,
        .tagembed-widget .tagembed-powered-by,
        .tagembed-widget .tagembed-watermark,
        .tagembed-widget .tagembed-copyright {
          display: none !important;
        }
      `}} />

      <div className="container mx-auto px-6">
        <div className="text-center mb-12 fade-in-on-scroll">
          <span className="text-[10px] tracking-[0.5em] uppercase text-[#C5A059] font-bold block mb-4">Réseaux Sociaux</span>
          <h2 className="font-serif text-4xl md:text-6xl text-[#1A1A1A] mb-6">
            Instagram <span className="italic">Live</span>
          </h2>
          <p className="text-[#4A4A4A] font-light text-lg max-w-2xl mx-auto">
            Retrouvez mes dernières performances et moments de vie en musique.
          </p>
        </div>

        <div className="max-w-6xl mx-auto fade-in-on-scroll min-h-[600px]">
          {/* Widget Tagembed conforme au snippet demandé */}
          <div 
            className="tagembed-widget" 
            style={{ width: '100%', height: '100%', overflow: 'auto' }} 
            data-widget-id="311910" 
            data-website="1"
          ></div>
        </div>
      </div>
    </section>
  );
};

export default InstagramFeed;
