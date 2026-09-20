export type Energy = 'CALME' | 'COOL' | 'ENTRAÎNANT' | '';
export type Song = { id: string; artist: string; title: string; style: string; energy: Energy; isNew: boolean };
export const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1ZjLntn0q42zM-Z6UBnXbd9OerfjTgLQGWdcoLMfCweQ/gviz/tq?tqx=out:csv&gid=496694620';
export const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

/** RFC 4180 fields, including commas, escaped quotes and embedded newlines. */
export function parseCSV(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], field = '', quoted = false;
  const input = csv.replace(/^\uFEFF/, '');
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (c === '"') {
      if (quoted && input[i + 1] === '"') { field += '"'; i++; }
      else quoted = !quoted;
    } else if (c === ',' && !quoted) { row.push(field); field = ''; }
    else if ((c === '\n' || c === '\r') && !quoted) {
      if (c === '\r' && input[i + 1] === '\n') i++;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += c;
  }
  if (quoted) throw new Error('CSV incomplet');
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

export function songsFromRows(rows: unknown[][]): Song[] {
  const headerIndex = rows.findIndex(row => row.some(cell => normalize(String(cell ?? '')) === 'titre'));
  if (headerIndex < 0) throw new Error('En-tête Titre absent');
  const headers = rows[headerIndex].map(cell => normalize(String(cell ?? '')));
  const index = (name: string) => headers.indexOf(name);
  if (['artistes', 'titre', 'style', 'energie'].some(name => index(name) < 0)) throw new Error('Colonnes du répertoire manquantes');
  const seen = new Set<string>();
  return rows.slice(headerIndex + 1).flatMap(row => {
    const get = (name: string) => String(row[index(name)] ?? '').trim();
    const title = get('titre');
    if (!title) return [];
    const artist = get('artistes');
    const id = `${normalize(artist)}::${normalize(title)}`;
    if (seen.has(id)) return [];
    seen.add(id);
    const rawEnergy = get('energie').toUpperCase();
    const energy: Energy = rawEnergy === 'CALME' || rawEnergy === 'COOL' || rawEnergy === 'ENTRAÎNANT' ? rawEnergy : '';
    return [{ id, artist, title, style: get('style'), energy, isNew: ['oui', 'true', '1', 'nouveaute'].includes(normalize(get('nouveaute'))) }];
  });
}
