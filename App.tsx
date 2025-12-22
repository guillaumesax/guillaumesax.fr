
import React, { useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Welcome from './components/Welcome';
import Bio from './components/Bio';
import InstagramFeed from './components/InstagramFeed';
import Contact from './components/Contact';
import Footer from './components/Footer';

const App: React.FC = () => {
  useEffect(() => {
    // 1. Intersection Observer pour les animations de révélation
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll('.fade-in-on-scroll');
    elements.forEach((el) => observer.observe(el));

    // 2. Navigation SPA ultra-sécurisée
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      
      if (anchor && anchor.getAttribute('href')?.startsWith('#')) {
        const targetId = anchor.getAttribute('href')?.replace('#', '');
        if (!targetId) return;

        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          e.preventDefault();
          
          const animatedItems = targetElement.querySelectorAll('.fade-in-on-scroll');
          animatedItems.forEach(item => item.classList.add('visible'));

          const navbarHeight = 80;
          const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);

    const safetyTimeout = setTimeout(() => {
      document.querySelectorAll('.fade-in-on-scroll').forEach(el => {
        el.classList.add('visible');
      });
    }, 1500);

    return () => {
      observer.disconnect();
      document.removeEventListener('click', handleAnchorClick);
      clearTimeout(safetyTimeout);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#F9F7F2]">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <Welcome />
        <Bio />
        <InstagramFeed />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default App;
