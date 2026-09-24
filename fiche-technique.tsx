import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowDown,
  ArrowUpRight,
  CarFront,
  Check,
  Clock3,
  Download,
  GlassWater,
  Instagram,
  Mail,
  Phone,
  PlugZap,
  Radio,
  ShieldCheck,
  Speaker,
  Sun,
  Umbrella,
  Utensils,
} from 'lucide-react';
import './fiche-technique.css';

const pdf = './Fiche_Technique_2026.pdf';
const chapters = [
  { id: 'installation', label: 'Installation' },
  { id: 'sonorisation', label: 'Sonorisation' },
  { id: 'environnement', label: 'Espace de jeu' },
  { id: 'accueil', label: 'Accueil' },
];

function App() {
  const [active, setActive] = useState('installation');

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 },
    );
    document.querySelectorAll('[data-reveal]').forEach(element => observer.observe(element));

    const sections = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-15% 0px -55% 0px' },
    );
    chapters.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) sections.observe(element);
    });

    return () => {
      observer.disconnect();
      sections.disconnect();
    };
  }, []);

  return (
    <>
      <a className="skip-link" href="#contenu">Aller au contenu</a>
      <header className="topbar">
        <div className="brand">Guillaume <em>Sax</em><span>LES DÉTAILS FONT L’HARMONIE</span></div>
        <span className="eyebrow">FICHE TECHNIQUE · 2026</span>
      </header>

      <main id="contenu">
        <section className="hero wrap">
          <div className="hero-copy">
            <p className="eyebrow"><span /> GUILLAUME SAX · 2026</p>
            <h1>Fiche<br /><em>technique.</em></h1>
            <p className="lead">Les besoins à prévoir pour l’installation, la sonorisation, l’espace de jeu et l’accueil.</p>
            <a className="button primary" href={pdf} download>
              <Download size={16} aria-hidden="true" /> Télécharger la fiche PDF <ArrowUpRight size={16} aria-hidden="true" />
            </a>
            <p className="micro">À transmettre à votre lieu, organisateur·rice ou régisseur.</p>
          </div>

          <aside className="essentials" aria-labelledby="essentials-title">
            <div className="card-top"><span className="eyebrow">EN UN COUP D’ŒIL</span><span className="edition">GS / 26</span></div>
            <h2 id="essentials-title">Les essentiels</h2>
            <div className="essential">
              <Clock3 aria-hidden="true" />
              <div><strong>Arrivée</strong><p>1 h avant max. · Installation & balance</p></div>
              <span className="ordinal">01</span>
            </div>
            <div className="essential">
              <Speaker aria-hidden="true" />
              <div><strong>Stéréo</strong><p>Diffusion amplifiée obligatoire</p></div>
              <span className="ordinal">02</span>
            </div>
            <div className="essential">
              <Umbrella aria-hidden="true" />
              <div><strong>À l’abri</strong><p>Protection obligatoire en extérieur</p></div>
              <span className="ordinal">03</span>
            </div>
            <a href="#installation" className="explore">Tous les détails <ArrowDown size={17} aria-hidden="true" /></a>
          </aside>
        </section>

        <div className="chapter-bar">
          <nav className="wrap" aria-label="Dans cette fiche">
            <span className="eyebrow">BESOINS TECHNIQUES</span>
            {chapters.map((chapter, index) => (
              <a key={chapter.id} href={`#${chapter.id}`} aria-current={active === chapter.id ? 'location' : undefined}>
                <span>0{index + 1}</span>{chapter.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="wrap chapters">
          <section className="chapter" id="installation" data-reveal>
            <div className="chapter-title">
              <span className="section-number">01 /</span>
              <p className="eyebrow">AVANT LA PRESTATION</p>
              <h2>Installation<br /><em>& balance.</em></h2>
              <p>Le temps nécessaire pour décharger, installer et vérifier le système sonore.</p>
            </div>
            <div className="chapter-content">
              <div className="arrival-card">
                <Clock3 size={25} aria-hidden="true" />
                <div>
                  <p className="eyebrow">ARRIVÉE SUR PLACE</p>
                  <h3><span className="numeric">1</span> heure maximum avant la prestation</h3>
                  <p>Ce créneau est suffisant pour le déchargement, l’installation technique et la balance, idéalement avant l’arrivée du public.</p>
                </div>
              </div>
              <div className="note">
                <Check size={19} aria-hidden="true" />
                <p>Merci de prévoir <strong>un·e référent·e pour l’accueil</strong> et l’accompagnement du parking jusqu’au lieu de prestation.</p>
              </div>
            </div>
          </section>

          <section className="chapter" id="sonorisation" data-reveal>
            <div className="chapter-title">
              <span className="section-number">02 /</span>
              <p className="eyebrow">LE CONFORT D’ÉCOUTE</p>
              <h2>Matériel<br /><em>& sonorisation.</em></h2>
              <p>Une diffusion adaptée au lieu pour que chaque nuance trouve sa place.</p>
            </div>
            <div className="chapter-content">
              <div className="spec-row"><Speaker aria-hidden="true" /><div><h3>Une diffusion amplifiée en stéréo</h3><p>Restitution en stéréo obligatoire. Les types d’enceintes sont à valider en amont.</p></div></div>
              <div className="spec-row"><PlugZap aria-hidden="true" /><div><h3>Les connexions à prévoir</h3><ul><li><strong>2 câbles XLR de 5 m minimum chacun.</strong></li><li>Un enrouleur électrique avec <strong>au moins 4 prises reliées à la terre.</strong></li></ul></div></div>
              <p className="boundary">Je n’assure pas la manipulation de matériel lourd : enceintes, amplificateurs ou structures.</p>
              <div className="option">
                <p className="eyebrow">OPTION SUR DEVIS</p>
                <h3>Besoin d’une sonorisation ?</h3>
                <p>Je peux fournir le système si nécessaire, avec supplément et sur devis.</p>
                <a href="mailto:contact@guillaumesax.fr?subject=Sonorisation%20de%20notre%20%C3%A9v%C3%A9nement">En discuter ensemble <ArrowUpRight size={16} aria-hidden="true" /></a>
              </div>
            </div>
          </section>

          <section className="chapter placement-chapter" id="environnement" data-reveal>
            <div className="chapter-title">
              <span className="section-number">03 /</span>
              <p className="eyebrow">IMPLANTATION TECHNIQUE</p>
              <h2>Positionnement<br /><em>& espace technique.</em></h2>
              <p>Je me place à égale distance des deux enceintes. La table et l’arrivée électrique se trouvent juste derrière l’enceinte gauche.</p>
            </div>
            <div className="chapter-content">
              <div
                className="placement-plan"
                role="img"
                aria-label="Implantation recommandée : les deux enceintes forment la base d’un triangle équilatéral. Guillaume se place à la pointe, à égale distance des deux enceintes. La table de 50 par 50 centimètres et l’arrivée électrique sont juste derrière l’enceinte gauche."
              >
                <div className="plan-geometry">
                  <svg className="plan-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M14 28 L86 28 L50 98 Z" />
                  </svg>
                  <div className="plan-speaker plan-speaker-left"><Speaker aria-hidden="true" /><span>Enceinte gauche</span></div>
                  <div className="plan-speaker plan-speaker-right"><Speaker aria-hidden="true" /><span>Enceinte droite</span></div>
                  <div className="plan-table"><span>Table 50 × 50 cm</span><span className="plan-power"><PlugZap size={13} aria-hidden="true" /> Arrivée électrique</span></div>
                  <div className="plan-performer"><span>Guillaume Sax</span><strong>Position de référence</strong></div>
                </div>
              </div>
              <p className="plan-caption"><strong>Je me place à la pointe du triangle équilatéral</strong>, à égale distance des deux enceintes. La table et l’arrivée électrique sont juste derrière l’enceinte gauche.</p>

              <div className="mobility-note">
                <Radio size={23} aria-hidden="true" />
                <div><h3>Je joue sans fil</h3><p>Cette position sert de repère sonore : je peux me déplacer pendant la prestation. La table, derrière l’enceinte gauche, reste mon point de chute technique.</p></div>
              </div>

              <div className="table-spec">
                <div className="table-drawing" aria-hidden="true"><span>50 cm min.</span><div /><span>50 cm min.</span></div>
                <div><h3>Une petite table stable</h3><p>Dimensions minimales : <strong>50 × 50 cm.</strong><br />À placer juste derrière l’enceinte gauche, près de l’arrivée électrique.</p></div>
              </div>

              <div className="outdoor">
                <Umbrella size={25} aria-hidden="true" />
                <div><p className="eyebrow">EN EXTÉRIEUR · OBLIGATOIRE</p><h3>Un espace protégé</h3><p>Prévoyez un barnum, un préau ou un abri. <strong>Le saxophone et le matériel ne peuvent pas être exposés à la pluie.</strong></p></div>
              </div>
              <div className="note"><Sun size={21} aria-hidden="true" /><p>Pour une prestation en plein soleil, prévoyez une <strong>zone ombragée.</strong></p></div>
            </div>
          </section>

          <section className="chapter" id="accueil" data-reveal>
            <div className="chapter-title">
              <span className="section-number">04 /</span>
              <p className="eyebrow">LES ATTENTIONS PRATIQUES</p>
              <h2>Accès<br /><em>& accueil.</em></h2>
              <p>Des détails simples qui facilitent l’arrivée et le bon déroulement de la prestation.</p>
            </div>
            <div className="chapter-content">
              <div className="spec-row"><CarFront aria-hidden="true" /><div><h3>Un accès facilité</h3><p>Un parking proche pour le déchargement, ainsi qu’une place de parking réservée et sécurisée.</p></div></div>
              <div className="spec-row"><GlassWater aria-hidden="true" /><div><h3>De l’eau dès l’installation</h3><p>Une bouteille d’eau disponible dès mon arrivée pour l’installation.</p></div></div>
              <div className="spec-row"><Utensils aria-hidden="true" /><div><h3>Si la prestation finit après 22 h</h3><p>Un repas complet et chaud est à prévoir.</p></div></div>
            </div>
          </section>
        </div>

        <section className="contact-section" data-reveal>
          <div className="wrap contact-grid">
            <div><p className="eyebrow">CONTACT TECHNIQUE</p><h2>Une question<br /><em>technique ?</em></h2></div>
            <div>
              <p>Si le lieu ou l’installation présente une contrainte particulière, contactez-moi afin de la valider en amont.</p>
              <a className="contact-link" href="mailto:contact@guillaumesax.fr"><Mail size={18} aria-hidden="true" /> contact@guillaumesax.fr <ArrowUpRight size={17} aria-hidden="true" /></a>
              <a className="contact-link" href="tel:+33659448834"><Phone size={18} aria-hidden="true" /> +33 6 59 44 88 34 <ArrowUpRight size={17} aria-hidden="true" /></a>
              <div className="share-actions"><a className="pdf-link" href={pdf} download><Download size={16} aria-hidden="true" /> Télécharger la fiche PDF</a></div>
            </div>
          </div>
        </section>

        <section className="legal wrap">
          <div><ShieldCheck size={22} aria-hidden="true" /><h2>En toute confiance</h2></div>
          <p>Prestation couverte par une assurance Responsabilité Civile Professionnelle (RC Pro).<br />SIRET : 819 503 434 00030.</p>
          <p className="legal-detail">Afin de garantir une prestation fluide et conforme à vos attentes, il est important que les éléments indiqués dans cette fiche soient respectés. En cas d’imprévu ou de conditions non réunies, des ajustements ou des frais supplémentaires pourraient être nécessaires, voire limiter la faisabilité de la prestation. Je reste bien entendu disponible pour anticiper toute situation et trouver ensemble les solutions les plus adaptées.</p>
        </section>
      </main>

      <footer className="footer wrap">
        <div className="brand">Guillaume <em>Sax</em></div>
        <a href="#contenu">Retour en haut ↑</a>
        <nav className="footer-links" aria-label="Retrouver Guillaume Sax">
          <a href="https://guillaumesax.fr/"><ArrowUpRight size={15} aria-hidden="true" />https://guillaumesax.fr/</a>
          <a href="https://www.instagram.com/guillaumesaxophone/" target="_blank" rel="noopener noreferrer"><Instagram size={15} aria-hidden="true" />Instagram · @guillaumesaxophone</a>
        </nav>
      </footer>
    </>
  );
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
