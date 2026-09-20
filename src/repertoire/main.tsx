import { StrictMode, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowDown, ArrowRight, Ban, Check, Download, Heart, Mail, Search, ShoppingBag, TrendingUp, X } from 'lucide-react';
import { normalize, parseCSV, SHEET_URL, songsFromRows } from './catalog';
import type { Energy, Song } from './catalog';
import { isTrending } from './trends';
import { togglePick, selectionText } from './preferences';
import type { Choice, Picks } from './preferences';
import snapshot from './snapshot.json';
import './repertoire.css';

const moods = [
  { id: 'CALME', label: 'Calme', description: 'Doux et posé', className: 'calme' },
  { id: 'COOL', label: 'Cool', description: 'Groove modéré', className: 'cool' },
  { id: 'ENTRAÎNANT', label: 'Entraînant', description: 'Rythmé et festif', className: 'entrainant' },
] as const;
const storageKey = 'guillaume-sax-preferences-v2';
function readSaved() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (saved && typeof saved === 'object' && saved.picks && typeof saved.picks === 'object') {
      const picks: Picks = {};
      for (const entry of Object.values(saved.picks) as unknown[]) {
        const p = entry as { choice?: string; song?: Song } | null;
        if (p && ['wish', 'avoid'].includes(p.choice || '') && typeof p.song?.id === 'string' && typeof p.song?.title === 'string') picks[p.song.id] = { song: p.song, choice: p.choice as Choice };
      }
      return { picks, names: typeof saved.names === 'string' ? saved.names : '', date: typeof saved.date === 'string' ? saved.date : '', notes: typeof saved.notes === 'string' ? saved.notes : '' };
    }
    const old = JSON.parse(localStorage.getItem('guillaume-sax-repertoire-favorites-v1') || '[]');
    const picks: Picks = {};
    if (Array.isArray(old)) for (const song of snapshot.songs as Song[]) if (old.includes(song.id)) picks[song.id] = { song, choice: 'wish' };
    return { picks, names: '', date: '', notes: '' };
  } catch { return { picks: {} as Picks, names: '', date: '', notes: '' }; }
}
function App() {
  const [songs, setSongs] = useState<Song[]>(snapshot.songs as Song[]);
  const [saved, setSaved] = useState(readSaved);
  const [energy, setEnergy] = useState<'all' | Energy>('all');
  const [search, setSearch] = useState('');
  const [style, setStyle] = useState('all');
  const [view, setView] = useState<'all' | Choice>('all');
  const [onlyNew, setOnlyNew] = useState(false);
  const [onlyTrending, setOnlyTrending] = useState(false);
  const [limit, setLimit] = useState(18);
  const [sync, setSync] = useState<'loading' | 'live' | 'saved'>('loading');
  const [notice, setNotice] = useState('');
  const [storageError, setStorageError] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12000);
    fetch(SHEET_URL, { signal: controller.signal, credentials: 'omit' })
      .then(response => { if (!response.ok) throw new Error(); return response.text(); })
      .then(csv => { const fresh = songsFromRows(parseCSV(csv)); if (!fresh.length) throw new Error(); setSongs(fresh); setSync('live'); })
      .catch(() => setSync('saved')).finally(() => window.clearTimeout(timeout));
    return () => { controller.abort(); window.clearTimeout(timeout); };
  }, []);
  useEffect(() => { try { localStorage.setItem(storageKey, JSON.stringify(saved)); } catch { setStorageError(true); } }, [saved]);
  useEffect(() => { if (dialogOpen) dialog.current?.showModal(); else dialog.current?.close(); }, [dialogOpen]);
  const picks = saved.picks;
  const wish = Object.values(picks).filter(p => p.choice === 'wish');
  const avoid = Object.values(picks).filter(p => p.choice === 'avoid');
  const total = wish.length + avoid.length;
  const toggle = (song: Song, choice: Choice) => {
    const current = picks[song.id]?.choice;
    setSaved(previous => ({ ...previous, picks: togglePick(previous.picks, song, choice) }));
    setNotice(current === choice ? `${song.title} : choix retiré.` : `${song.title} : ${choice === 'wish' ? 'souhaité' : 'à ne pas jouer'}${current ? ', déplacé depuis l’autre liste' : ''}.`);
  };
  const styles = useMemo(() => [...new Set(songs.map(song => song.style).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'fr')), [songs]);
  const filtered = useMemo(() => songs.filter(song => (energy === 'all' || song.energy === energy) && (style === 'all' || song.style === style) && (view === 'all' || picks[song.id]?.choice === view) && (!onlyTrending || isTrending(song)) && (!onlyNew || song.isNew) && normalize(`${song.title} ${song.artist}`).includes(normalize(search))), [songs, energy, style, view, onlyTrending, onlyNew, search, picks]);
  const reset = () => { setEnergy('all'); setStyle('all'); setSearch(''); setView('all'); setOnlyNew(false); setOnlyTrending(false); setLimit(18); };
  const text = selectionText(picks, saved.names, saved.date, saved.notes);
  const copy = async () => { try { await navigator.clipboard.writeText(text); setNotice('Les deux listes sont copiées. Collez-les dans votre message à Guillaume.'); } catch { setNotice('Copie indisponible sur ce navigateur. Utilisez le téléchargement.'); } };
  const download = () => { const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' })); const a = document.createElement('a'); a.href = url; a.download = 'preferences-musicales-guillaume-sax.txt'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); setNotice('Les deux listes ont été téléchargées.'); };
  const openReview = () => { setNotice(''); setDialogOpen(true); };
  return <div>
    <a className="skip-link" href="#repertoire">Aller aux morceaux</a>
    <header className="topbar"><a className="brand" href="#">Guillaume <em>Sax</em></a><button className="review-button" onClick={openReview}><ShoppingBag size={17} aria-hidden="true" /> Mes choix <span>{total}</span></button></header>
    <main className="wrap">
      <section className="intro"><p className="eyebrow">PRÉPARATION DE VOTRE MARIAGE</p><h1>Vos préférences <em>musicales.</em></h1><p>Choisissez les morceaux que vous aimeriez entendre et ceux que vous ne voulez pas. Transmettez ensuite vos deux listes à Guillaume.</p></section>
      <div className="workspace">
        <section id="repertoire" className="catalogue" aria-label="Répertoire musical">
          <button className="trending-filter" aria-pressed={onlyTrending} onClick={() => { const next = !onlyTrending; reset(); setOnlyTrending(next); }}><TrendingUp size={24} aria-hidden="true" /><span className="trending-copy"><strong>Tendances du moment</strong><small>{songs.filter(isTrending).length} morceaux</small></span>{onlyTrending && <Check size={15} aria-hidden="true" />}</button>
          <div className="energy-filters" aria-label="Filtrer par énergie"><button aria-pressed={energy === 'all'} onClick={() => { setEnergy('all'); setLimit(18); }}><strong>Tout</strong><span>{songs.length} morceaux</span></button>{moods.map(mood => <button className={mood.className} key={mood.id} aria-pressed={energy === mood.id} onClick={() => { setEnergy(mood.id); setLimit(18); }}><strong>{mood.label}<span className="energy-bars" aria-hidden="true"><i /><i /><i /></span></strong><span>{mood.description}</span></button>)}</div>
          <div className="search-row"><label className="search-field"><Search size={18} aria-hidden="true" /><span className="sr-only">Rechercher un titre ou un artiste</span><input type="search" placeholder="Rechercher un titre, un artiste…" value={search} onChange={event => { setSearch(event.target.value); setLimit(18); }} /></label><label className="style-field"><span className="sr-only">Style musical</span><select value={style} onChange={event => { setStyle(event.target.value); setLimit(18); }}><option value="all">Tous les styles</option>{styles.map(value => <option key={value}>{value}</option>)}</select></label></div>
          <div className="view-filters"><div aria-label="Filtrer par choix">{([{id:'all',label:'Tous les titres'},{id:'wish',label:'Souhaités'},{id:'avoid',label:'À ne pas jouer'}] as const).map(item => <button key={item.id} aria-pressed={view === item.id} onClick={() => { setView(item.id); setLimit(18); }}>{item.label}</button>)}</div>{songs.some(song => song.isNew) && <label className="new-filter"><input type="checkbox" checked={onlyNew} onChange={event => { setOnlyNew(event.target.checked); setLimit(18); }} /> Nouveautés</label>}</div>
          <div className="list-heading"><span role="status">{filtered.length} morceau{filtered.length !== 1 ? 'x' : ''}</span><span className="choices-legend"><Heart size={12} aria-hidden="true" /> Oui <Ban size={12} aria-hidden="true" /> Non</span></div>
          <div className="song-list">{filtered.slice(0, limit).map(song => <article key={song.id} className={`song-row ${picks[song.id]?.choice || ''}`}><div className="song-info"><h2>{song.title}{song.isNew && <span className="new-badge">Nouveau</span>}</h2><p>{song.artist || 'Artiste non renseigné'}</p><div className="song-meta">{song.style && <span>{song.style}</span>}<span className={moods.find(mood => mood.id === song.energy)?.className || ''}>{moods.find(mood => mood.id === song.energy)?.label || 'Énergie non précisée'}</span></div></div><div className="song-actions"><button className="wish-action" aria-label={`Souhaiter ${song.title}`} aria-pressed={picks[song.id]?.choice === 'wish'} onClick={() => toggle(song, 'wish')}><Heart size={17} aria-hidden="true" fill={picks[song.id]?.choice === 'wish' ? 'currentColor' : 'none'} /><span>Souhaité</span></button><button className="avoid-action" aria-label={`Ne pas jouer ${song.title}`} aria-pressed={picks[song.id]?.choice === 'avoid'} onClick={() => toggle(song, 'avoid')}><Ban size={17} aria-hidden="true" /><span>À éviter</span></button></div></article>)}</div>
          {!filtered.length && <div className="empty-state"><p>Aucun morceau ne correspond à ces filtres.</p><button onClick={reset}>Afficher tout le répertoire</button></div>}
          {filtered.length > limit && <button className="load-more" onClick={() => setLimit(limit + 18)}>Afficher plus de morceaux <ArrowDown size={16} aria-hidden="true" /></button>}
          <div className="library-footer"><span>{Math.min(limit, filtered.length)} sur {filtered.length}</span><span>{sync === 'live' ? 'Répertoire à jour' : sync === 'loading' ? 'Actualisation…' : `Copie du ${new Date(snapshot.syncedAt).toLocaleDateString('fr-FR')} · mise à jour indisponible`}</span></div>
        </section>
        <aside className="summary" aria-label="Résumé de vos choix"><p className="eyebrow">VOTRE SÉLECTION</p><h2>Mes choix <span>{total}</span></h2><div className="summary-count wish-count"><Heart size={18} aria-hidden="true" /><span>Souhaités</span><strong>{wish.length}</strong></div><div className="summary-count avoid-count"><Ban size={18} aria-hidden="true" /><span>À ne pas jouer</span><strong>{avoid.length}</strong></div><p>Un morceau ne peut figurer que dans une seule liste. Cliquez à nouveau sur votre choix pour le retirer.</p><button className="primary-button" onClick={openReview}>Vérifier et transmettre <ArrowRight size={16} aria-hidden="true" /></button><small>{storageError ? 'Enregistrement indisponible. Téléchargez vos choix avant de quitter la page.' : 'Vos choix restent enregistrés sur ce navigateur. Ils ne sont pas envoyés automatiquement.'}</small></aside>
      </div>
    </main><footer className="footer wrap"><span>Guillaume Sax · Préparation musicale</span><a href="mailto:contact@guillaumesax.fr">contact@guillaumesax.fr</a></footer>
    <div className="mobile-summary"><span><Heart size={15} aria-hidden="true" /> {wish.length}<Ban size={15} aria-hidden="true" /> {avoid.length}</span><button onClick={openReview}>Vérifier mes choix <ArrowRight size={15} aria-hidden="true" /></button></div>
    <div className="sr-only" role="status" aria-live="polite">{notice}</div>
    <dialog ref={dialog} className="selection-dialog" aria-labelledby="selection-title" onCancel={() => setDialogOpen(false)} onClose={() => setDialogOpen(false)}>
      <div className="dialog-top"><p className="eyebrow">RÉCAPITULATIF</p><button className="icon-button" aria-label="Fermer le récapitulatif" onClick={() => setDialogOpen(false)}><X size={22} /></button></div><h2 id="selection-title">Vos choix musicaux</h2><p className="share-help">{storageError ? "Enregistrement indisponible : téléchargez vos listes avant de quitter cette page." : "Enregistrés sur ce navigateur. Rien n’est envoyé avant votre transmission."}</p>
      <div className="review-lists">{([{choice:'wish',label:'Morceaux souhaités',items:wish},{choice:'avoid',label:'À ne pas jouer · blacklist',items:avoid}] as const).map(group => <section key={group.choice}><h3 className={group.choice}>{group.choice === 'wish' ? <Heart size={17} aria-hidden="true" /> : <Ban size={17} aria-hidden="true" />}{group.label}<span>{group.items.length}</span></h3>{group.items.length ? <ul>{group.items.map(({song}) => <li key={song.id}><div><strong>{song.title}</strong><small>{song.artist}</small></div><button className="icon-button" aria-label={`Retirer ${song.title} des ${group.choice === 'wish' ? 'souhaités' : 'morceaux à éviter'}`} onClick={() => toggle(song, group.choice)}><X size={16} /></button></li>)}</ul> : <p className="empty-list">Aucun morceau indiqué.</p>}</section>)}</div>
      <div className="details-fields"><label>Vos prénoms<input autoComplete="off" value={saved.names} maxLength={120} placeholder="Ex. Camille et Alex" onChange={e => setSaved({...saved, names:e.target.value})} /></label><label>Date du mariage<input type="date" value={saved.date} onChange={e => setSaved({...saved, date:e.target.value})} /></label><label className="notes-field">Précisions <span>(facultatif)</span><textarea rows={3} maxLength={3000} value={saved.notes} placeholder="Un morceau pour un moment précis, un artiste à éviter…" onChange={e => setSaved({...saved, notes:e.target.value})} /></label></div>
      <div className="share-actions"><button className="primary-button" onClick={copy}>Copier les deux listes <Check size={16} aria-hidden="true" /></button><button className="secondary-button" onClick={download}><Download size={16} aria-hidden="true" /> Télécharger</button></div><a className="email-action" href={`mailto:contact@guillaumesax.fr?subject=${encodeURIComponent(`Préférences musicales${saved.names ? ` — ${saved.names}` : ''}`)}&body=${encodeURIComponent(text)}`}><Mail size={16} aria-hidden="true" /> Préparer un e-mail à Guillaume</a><p className="share-help">L’e-mail s’ouvre dans votre messagerie. Si elle ne reprend pas les listes, collez-les dans votre message ou joignez le fichier téléchargé.</p><p className="dialog-notice" role="status">{notice}</p>
    </dialog>
  </div>;
}
createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
