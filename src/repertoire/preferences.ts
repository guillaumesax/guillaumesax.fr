import type { Song } from './catalog';
export type Choice = 'wish' | 'avoid';
export type Pick = { song: Song; choice: Choice };
export type Picks = Record<string, Pick>;
export function togglePick(picks: Picks, song: Song, choice: Choice): Picks {
  const next = { ...picks };
  if (next[song.id]?.choice === choice) delete next[song.id];
  else next[song.id] = { song, choice };
  return next;
}
export function selectionText(picks: Picks, names: string, date: string, notes: string): string {
  const list = (choice: Choice) => Object.values(picks).filter(p => p.choice === choice)
    .map(({ song }) => `• ${song.title}${song.artist ? ` — ${song.artist}` : ''}`).join('\n') || 'Aucun morceau indiqué.';
  return `PRÉFÉRENCES MUSICALES — GUILLAUME SAX\nPrénoms : ${names.trim() || 'Non renseignés'}\nDate du mariage : ${date || 'Non renseignée'}\n\nMORCEAUX SOUHAITÉS\n${list('wish')}\n\nÀ NE PAS JOUER (BLACKLIST)\n${list('avoid')}\n\nPRÉCISIONS\n${notes.trim() || 'Aucune précision.'}\n`;
}
