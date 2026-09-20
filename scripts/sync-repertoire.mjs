import { writeFile } from 'node:fs/promises';
import { SHEET_URL, parseCSV, songsFromRows } from '../src/repertoire/catalog.ts';

const response = await fetch(SHEET_URL, { signal: AbortSignal.timeout(20000) });
if (!response.ok) throw new Error(`Google Sheets : ${response.status}`);
const songs = songsFromRows(parseCSV(await response.text()));
if (!songs.length) throw new Error('Répertoire vide : copie de secours conservée.');
await writeFile(new URL('../src/repertoire/snapshot.json', import.meta.url), JSON.stringify({ syncedAt: new Date().toISOString(), songs }, null, 2) + '\n');
console.log(`${songs.length} morceaux synchronisés.`);
