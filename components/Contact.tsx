
import React, { useState } from 'react';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    location: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const subject = "Demande d’informations";
    const body = `Bonjour Guillaume,

Vous avez reçu une nouvelle demande d'informations via votre site web :

Nom complet : ${formData.name}
Email : ${formData.email}
Téléphone : ${formData.phone}
Date de l'événement : ${formData.date}
Lieu : ${formData.location}

Message :
${formData.message}

---
Demande envoyée depuis le site guillaumesax.fr`;

    // Construction du lien mailto
    const mailtoUrl = `mailto:contact@guillaumesax.fr?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Ouverture du client mail
    window.location.href = mailtoUrl;

    // Feedback utilisateur
    alert('Votre client de messagerie va s\'ouvrir pour envoyer votre demande. Merci !');
  };

  return (
    <section id="contact" className="pt-8 pb-16 md:pt-12 md:pb-28 bg-white">
      <div className="container mx-auto px-6 max-w-4xl text-center mb-12 fade-in-on-scroll">
        <h2 className="font-serif text-4xl md:text-6xl mb-6">Parlons de votre projet</h2>
        <p className="text-[#4A4A4A] font-light text-lg max-w-2xl mx-auto">
          Chaque événement est unique. Je vous réponds personnellement pour imaginer 
          une ambiance musicale qui vous ressemble.
        </p>
      </div>

      <div className="container mx-auto px-6 max-w-3xl fade-in-on-scroll">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] tracking-widest uppercase text-gray-400 font-bold">Nom complet</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Ex: Camille & Thomas"
                className="w-full border-b border-gray-200 py-3 focus:border-[#C5A059] outline-none transition-colors text-lg font-light"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] tracking-widest uppercase text-gray-400 font-bold">Email</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="votre@email.com"
                className="w-full border-b border-gray-200 py-3 focus:border-[#C5A059] outline-none transition-colors text-lg font-light"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] tracking-widest uppercase text-gray-400 font-bold">Numéro de téléphone</label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="Ex: 06 12 34 56 78"
                className="w-full border-b border-gray-200 py-3 focus:border-[#C5A059] outline-none transition-colors text-lg font-light"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] tracking-widest uppercase text-gray-400 font-bold">Date de l'événement</label>
              <input
                type="date"
                name="date"
                required
                value={formData.date}
                onChange={handleChange}
                className="w-full border-b border-gray-200 py-3 focus:border-[#C5A059] outline-none transition-colors text-lg font-light"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] tracking-widest uppercase text-gray-400 font-bold">Lieu</label>
            <input
              type="text"
              name="location"
              required
              value={formData.location}
              onChange={handleChange}
              placeholder="Ex: Château de Versailles"
              className="w-full border-b border-gray-200 py-3 focus:border-[#C5A059] outline-none transition-colors text-lg font-light"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] tracking-widest uppercase text-gray-400 font-bold">Votre message</label>
            <textarea
              name="message"
              rows={4}
              required
              value={formData.message}
              onChange={handleChange}
              placeholder="Décrivez vos envies pour cette journée..."
              className="w-full border-b border-gray-200 py-3 focus:border-[#C5A059] outline-none transition-colors text-lg font-light resize-none"
            ></textarea>
          </div>

          <div className="text-center pt-8">
            <button
              type="submit"
              className="px-12 py-5 bg-[#1A1A1A] text-white text-xs tracking-[0.3em] uppercase hover:bg-[#C5A059] transition-all duration-500 shadow-xl"
            >
              Envoyer ma demande
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Contact;
