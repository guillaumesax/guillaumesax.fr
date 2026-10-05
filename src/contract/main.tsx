import { StrictMode, useEffect, useRef, useState, type FormEvent, type PointerEvent } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowDown, Check, Download, Eraser, FileSignature, Mail, PenLine, Send } from 'lucide-react';
import { clauses, contractVersion, emptyContract, formatEuros, formatEventDate, type ContractData } from './model';
import { generateContractPdf } from './pdf';
import './style.css';

const apiUrl = import.meta.env.VITE_CONTRACT_API_URL?.trim() || '';
const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim() || '';
// Email delivery also requires VITE_CONTRACT_API_URL and a deployed mail worker.
const contractApproved = true;

function SignaturePad({ onChange }: { onChange: (value: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const inkLength = useRef(0);

  const point = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const bounds = canvas.getBoundingClientRect();
    return { x: (event.clientX - bounds.left) * canvas.width / bounds.width, y: (event.clientY - bounds.top) * canvas.height / bounds.height };
  };
  const start = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    canvas.setPointerCapture(event.pointerId);
    drawing.current = true;
    lastPoint.current = point(event);
    const context = canvas.getContext('2d')!;
    context.fillStyle = '#292621';
    context.beginPath();
    context.arc(lastPoint.current.x, lastPoint.current.y, 2, 0, Math.PI * 2);
    context.fill();
  };
  const move = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || !lastPoint.current) return;
    const next = point(event);
    const context = canvasRef.current!.getContext('2d')!;
    context.strokeStyle = '#292621';
    context.lineWidth = 4;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.beginPath();
    context.moveTo(lastPoint.current.x, lastPoint.current.y);
    context.lineTo(next.x, next.y);
    context.stroke();
    inkLength.current += Math.hypot(next.x - lastPoint.current.x, next.y - lastPoint.current.y);
    lastPoint.current = next;
  };
  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    lastPoint.current = null;
    if (inkLength.current >= 30) onChange(canvasRef.current!.toDataURL('image/png'));
  };
  const clear = () => {
    const canvas = canvasRef.current!;
    canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height);
    inkLength.current = 0;
    onChange('');
  };

  return <div className="signature-pad">
    <div className="signature-pad-heading"><div><PenLine size={18} aria-hidden="true" /><strong>Votre signature</strong></div><button type="button" onClick={clear}><Eraser size={15} aria-hidden="true" /> Effacer</button></div>
    <canvas ref={canvasRef} width={1000} height={300} onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end} aria-label="Zone de signature à dessiner avec le doigt, le stylet ou la souris" />
    <p>Dessinez dans le cadre avec votre doigt, un stylet ou la souris. Le bouton « Effacer » permet de recommencer.</p>
  </div>;
}

function App() {
  const [data, setData] = useState<ContractData>(emptyContract);
  const [signature, setSignature] = useState('');
  const [signedAt, setSignedAt] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [signatureRevision, setSignatureRevision] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const previewRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!apiUrl || !turnstileSiteKey || document.querySelector('script[data-contract-turnstile]')) return;
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    script.dataset.contractTurnstile = 'true';
    document.head.appendChild(script);
  }, []);

  const change = <K extends keyof ContractData>(field: K, value: ContractData[K]) => {
    setData(current => ({ ...current, [field]: value, ...(field === 'total' ? { deposit: (Math.round(Number(value) * 30) / 100).toFixed(2) } : {}) }));
    if (signature && field !== 'copyToClient') { setSignature(''); setSignedAt(''); setAccepted(false); setSignatureRevision(revision => revision + 1); }
    setError('');
  };
  const updateSignature = (value: string) => {
    setSignature(value);
    setSignedAt(value ? new Date().toISOString() : '');
    setError('');
  };
  const validate = () => {
    if (!formRef.current?.reportValidity()) return false;
    if (!signature) { setError('Dessinez votre signature avant de continuer.'); document.getElementById('signature')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); return false; }
    if (data.imagePermission === null) { setError('Indiquez votre choix concernant les images de l’événement.'); return false; }
    if (!accepted) { setError('Cochez la case de confirmation après avoir relu le contrat.'); return false; }
    setError('');
    return true;
  };
  const download = async () => {
    if (!validate()) return;
    try {
      const pdf = await generateContractPdf(previewRef.current!);
      const url = URL.createObjectURL(pdf);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `contrat-guillaume-sax-${data.eventDate || 'prestation'}.pdf`;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch { setError('Le PDF n’a pas pu être créé. Réessayez dans un instant.'); }
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate() || !apiUrl || !turnstileSiteKey || !contractApproved || honeypot) return;
    setStatus('sending');
    setError('');
    try {
      const pdf = await generateContractPdf(previewRef.current!);
      const response = await fetch(apiUrl, { method: 'POST', body: (() => {
        const body = new FormData();
        body.append('contract', JSON.stringify({ ...data, signedAt, version: contractVersion }));
        body.append('document', pdf, `contrat-guillaume-sax-${data.eventDate}.pdf`);
        body.append('turnstile', formRef.current?.querySelector<HTMLInputElement>('[name="cf-turnstile-response"]')?.value || '');
        return body;
      })() });
      if (!response.ok) throw new Error('Envoi indisponible');
      setStatus('sent');
    } catch { setError('L’envoi a échoué. Vos informations restent à l’écran : vous pouvez réessayer ou télécharger le PDF.'); setStatus('idle'); }
  };

  const input = (field: keyof ContractData, label: string, type = 'text', required = true, placeholder = '') => <label className="field" key={field}>
    <span>{label}{required && <b aria-label="obligatoire"> *</b>}</span>
    <input type={type} value={String(data[field])} onChange={event => change(field, event.target.value)} onInput={type === 'date' || type === 'time' ? event => change(field, event.currentTarget.value) : undefined} required={required} readOnly={field === 'deposit'} min={type === 'number' ? 0 : undefined} step={type === 'number' ? '0.01' : undefined} placeholder={placeholder} autoComplete={field === 'clientEmail' ? 'email' : field === 'clientName' ? 'name' : field === 'clientPhone' ? 'tel' : undefined} />
  </label>;

  return <>
    <a className="skip-link" href="#formulaire">Aller au formulaire</a>
    <header className="contract-header"><div className="wrap header-inner"><a className="brand" href="../">Guillaume <em>Sax</em><small>PRESTATION MUSICALE</small></a><span>DOCUMENT CLIENT · {contractVersion}</span></div></header>
    <main>
      <section className="contract-hero wrap"><div><p className="eyebrow">VOTRE ÉVÉNEMENT, EN TOUTE CLARTÉ</p><h1>Un accord clair.<br /><em>Une belle journée.</em></h1><p>Complétez les détails de votre prestation, relisez les conditions puis signez directement sur votre écran.</p><a href="#formulaire" className="hero-link">Commencer <ArrowDown size={17} aria-hidden="true" /></a></div><div className="hero-card"><FileSignature size={36} strokeWidth={1.2} aria-hidden="true" /><span>01 / Renseigner</span><span>02 / Relire</span><span>03 / Signer et transmettre</span><p>Une copie PDF peut être téléchargée avant l’envoi.</p></div></section>
      <div className="progress"><div className="wrap"><span>01 <b>Vos informations</b></span><span>02 <b>Le contrat</b></span><span>03 <b>La signature</b></span></div></div>
      <form id="formulaire" ref={formRef} onSubmit={submit} className="wrap contract-layout">
        <div className="form-column">
          <section className="form-section"><div className="section-heading"><span>01 /</span><div><p className="eyebrow">LES PERSONNES CONCERNÉES</p><h2>Vos coordonnées</h2></div></div><div className="fields">{input('clientName', 'Nom et prénom du signataire', 'text', true, 'Camille Dupont')}{input('clientAddress', 'Adresse postale', 'text', true, 'Numéro, rue, code postal et ville')}{input('clientEmail', 'Adresse e-mail', 'email', true, 'camille@exemple.fr')}{input('clientPhone', 'Téléphone', 'tel', true, '06 00 00 00 00')}</div></section>
          <section className="form-section"><div className="section-heading"><span>02 /</span><div><p className="eyebrow">LA JOURNÉE</p><h2>Votre prestation</h2></div></div><div className="fields two">{input('eventDate', 'Date de l’événement', 'date')}{input('venue', 'Nom du lieu', 'text', true, 'Domaine, salle…')}{input('venueAddress', 'Adresse du lieu', 'text', true, 'Adresse complète')}{input('prestation', 'Formule / prestation', 'text', true, 'Selon le devis accepté')}{input('startTime', 'Début de la prestation', 'time')}{input('endTime', 'Fin de la prestation', 'time')}{input('quoteNumber', 'Numéro du devis', 'text', true, 'Référence du devis')}{input('total', 'Montant total (€)', 'number')}{input('deposit', 'Acompte prévu (€)', 'number')}<label className="field full"><span>Options prévues au devis</span><textarea value={data.options} onChange={event => change('options', event.target.value)} rows={2} placeholder="Aucune, ou précisez les options" /></label><label className="field full"><span>Précisions convenues avec Guillaume</span><textarea value={data.specialTerms} onChange={event => change('specialTerms', event.target.value)} rows={3} placeholder="Informations complémentaires validées ensemble" /></label></div><p className="field-note">Les montants et horaires doivent correspondre au devis accepté par les deux parties.</p></section>
          <section className="form-section"><div className="section-heading"><span>03 /</span><div><p className="eyebrow">VOTRE CHOIX</p><h2>Images de l’événement</h2></div></div><p className="section-copy">Guillaume peut-il utiliser des images ou vidéos de la prestation pour présenter son travail ?</p><div className="choice-row"><label><input type="radio" name="imagePermission" required checked={data.imagePermission === true} onChange={() => change('imagePermission', true)} /> Oui, j’autorise</label><label><input type="radio" name="imagePermission" required checked={data.imagePermission === false} onChange={() => change('imagePermission', false)} /> Non, je refuse</label></div></section>
        </div>
        <div className="document-column"><article ref={previewRef} className="contract-document" aria-label="Texte du contrat"><div className="document-top"><span>GUILLAUME SAX</span><span>{contractVersion}</span></div><h2>Contrat de<br /><em>prestation.</em></h2><p className="document-subtitle">Prestation musicale événementielle</p><div className="party-grid"><div><small>LE PRESTATAIRE</small><strong>Guillaume MOSTAFA</strong><p>Guillaume Sax · SIRET 819 503 434 00030<br />07400 Le Teil<br />contact@guillaumesax.fr<br />06 59 44 88 34</p></div><div><small>LE CLIENT</small><strong>{data.clientName || 'Nom du signataire'}</strong><p>{data.clientAddress || 'Adresse à compléter'}<br />{data.clientEmail || 'E-mail à compléter'}<br />{data.clientPhone || 'Téléphone à compléter'}</p></div></div><div className="document-facts"><div><small>ÉVÉNEMENT</small><strong>{formatEventDate(data.eventDate)}</strong><p>{data.venue || 'Lieu à compléter'}<br />{data.venueAddress || 'Adresse du lieu à compléter'}</p></div><div><small>PRESTATION</small><strong>{data.prestation || 'À compléter'}</strong><p>{data.startTime && data.endTime ? `${data.startTime} – ${data.endTime}` : 'Horaires à compléter'}</p></div></div><div className="document-details"><p><strong>Devis :</strong> {data.quoteNumber || 'À compléter'}</p><p><strong>Total :</strong> {data.total ? formatEuros(data.total) : 'À compléter'} · <strong>Acompte 30 % :</strong> {data.deposit ? formatEuros(data.deposit) : 'À compléter'}</p><p><strong>Options :</strong> {data.options || 'Aucune'}</p>{data.specialTerms && <p><strong>Précisions convenues :</strong> {data.specialTerms}</p>}</div>{clauses.map(clause => <section className="clause" key={clause.title}><h3>{clause.title}</h3><p>{clause.text}</p></section>)}<div className="document-tail"><p><strong>Choix relatif aux images :</strong> {data.imagePermission === null ? 'À choisir.' : data.imagePermission ? 'Autorisation accordée.' : 'Autorisation refusée.'}</p><p><strong>Signataire :</strong> {data.clientName || 'À compléter'} · <strong>Lieu :</strong> {data.signedCity || 'À compléter'} · <strong>Date :</strong> {signedAt ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Europe/Paris' }).format(new Date(signedAt)) : 'À compléter'}</p>{signature && <img src={signature} alt="Signature dessinée par le client" />}<p><strong>Contresignature :</strong> Guillaume Mostafa, après réception.</p></div></article></div>
        <section id="signature" className="sign-section"><div className="section-heading"><span>04 /</span><div><p className="eyebrow">DERNIÈRE ÉTAPE</p><h2>Relire & signer</h2></div></div><p>Vérifiez le contrat et le devis avant de signer. La signature dessinée sera intégrée au PDF envoyé. Guillaume pourra contresigner après réception. Consultez aussi la <a href="https://guillaumesax.fr/fiche-technique/" target="_blank" rel="noopener noreferrer">fiche technique</a> qui accompagne ce contrat.</p><div className="signature-grid"><label className="field"><span>Fait à (ville) *</span><input value={data.signedCity} onChange={event => change('signedCity', event.target.value)} required placeholder="Ville de signature" /></label><div className="signature-date"><span>DATE DE SIGNATURE</span><strong>{new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeZone: 'Europe/Paris' }).format(new Date())}</strong></div></div><SignaturePad key={signatureRevision} onChange={updateSignature} /><label className="check-row"><input type="checkbox" checked={accepted} onChange={event => setAccepted(event.target.checked)} required /><span>J’ai lu le contrat, vérifié les informations et j’accepte de le signer et de le transmettre.</span></label><label className="check-row"><input type="checkbox" checked={data.copyToClient} onChange={event => change('copyToClient', event.target.checked)} /><span>Je souhaite recevoir une copie du contrat à mon adresse e-mail.</span></label><input className="honeypot" tabIndex={-1} autoComplete="off" aria-hidden="true" value={honeypot} onChange={event => setHoneypot(event.target.value)} />{apiUrl && turnstileSiteKey && <div className="turnstile"><div className="cf-turnstile" data-sitekey={turnstileSiteKey} /></div>}<div className="actions"><button type="button" className="download-button" onClick={download}><Download size={17} aria-hidden="true" /> Télécharger le PDF</button><button className="send-button" type="submit" disabled={!contractApproved || !apiUrl || !turnstileSiteKey || status === 'sending' || status === 'sent'}><Send size={17} aria-hidden="true" /> {status === 'sending' ? 'Envoi en cours…' : status === 'sent' ? 'Contrat transmis' : 'Signer et envoyer'}</button></div>{!contractApproved && <p className="setup-note">Le texte du contrat est en cours de validation. L’envoi sera disponible après confirmation des clauses.</p>}{contractApproved && (!apiUrl || !turnstileSiteKey) && <p className="setup-note">L’envoi direct par e-mail sera disponible après la configuration du service d’envoi.</p>}{error && <p className="form-error" role="alert">{error}</p>}{status === 'sent' && <p className="form-success" role="status"><Check size={17} aria-hidden="true" /> Le contrat a été transmis à Guillaume{data.copyToClient ? ' et une copie vous a été envoyée' : ''}.</p>}</section>
      </form>
      <section className="privacy wrap"><Mail size={19} aria-hidden="true" /><div><h2>À propos de vos informations</h2><p>Guillaume Mostafa utilise les informations saisies pour préparer et exécuter la prestation. En cas d’envoi, le PDF et vos coordonnées transitent par Cloudflare et Resend vers Guillaume et, si vous le choisissez, vers votre adresse e-mail. La page ne conserve pas ces données dans le navigateur. Guillaume conserve ensuite le contrat pendant la relation contractuelle et les durées d’archivage applicables. Pour exercer vos droits d’accès, de rectification ou d’effacement, ou poser une question : <a href="mailto:contact@guillaumesax.fr">contact@guillaumesax.fr</a>.</p></div></section>
    </main><footer className="contract-footer wrap"><span>Guillaume <em>Sax</em></span><a href="#formulaire">Retour au formulaire ↑</a></footer>
  </>;
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
