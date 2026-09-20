import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseCSV, songsFromRows, normalize } from '../src/repertoire/catalog.ts';

test('CSV : virgules, guillemets, CRLF et retours dans un titre', () => {
  assert.deepEqual(parseCSV('\uFEFFArtistes,Titre\r\n"A, B","Un ""titre""\nlong"\r\n'), [['Artistes','Titre'],['A, B','Un "titre"\nlong']]);
  assert.throws(() => parseCSV('"inachevé'));
});
test('Colonnes déplacées, nouveautés explicites et énergie non inventée', () => {
  const rows = [['Setlist'],['Titre','ÉNERGIE','Nouveauté','Artistes','Style'],['Perfect','CALME','oui','Ed Sheeran','POP'],['Autre','','','Artiste',''],['Autre','','','Artiste',''],['Dernier','inconnue','non','',''],['','','','','']];
  const songs = songsFromRows(rows);
  assert.equal(songs.length,3);
  assert.equal(songs[0].isNew,true);
  assert.equal(songs[0].energy,'CALME');
  assert.equal(songs[1].energy,'');
  assert.equal(songs[2].energy,'');
  assert.equal(songs[2].isNew,false);
  assert.equal(normalize('Angèle'), 'angele');
  assert.throws(()=>songsFromRows([['<html>Unauthorized</html>']]));
  assert.throws(()=>songsFromRows([['Titre'],['Incomplet']]));
});
test('Copie de secours : identifiants uniques, titres et énergies valides', async () => {
  const {songs} = JSON.parse(await readFile(new URL('../src/repertoire/snapshot.json', import.meta.url),'utf8'));
  assert.ok(songs.length > 0);
  assert.equal(new Set(songs.map(song=>song.id)).size,songs.length);
  for(const song of songs) { assert.ok(song.title); assert.ok(['CALME','COOL','ENTRAÎNANT',''].includes(song.energy)); }
});

test('Préférences : souhaits et blacklist exclusifs, déplacement et retrait', async () => {
  const { togglePick, selectionText } = await import('../src/repertoire/preferences.ts');
  const song = { id:'test',title:'Perfect',artist:'Ed Sheeran',style:'POP',energy:'CALME',isNew:false };
  const wanted = togglePick({},song,'wish');
  assert.equal(wanted.test.choice,'wish');
  const excluded = togglePick(wanted,song,'avoid');
  assert.equal(excluded.test.choice,'avoid');
  assert.equal(Object.keys(excluded).length,1);
  assert.equal(wanted.test.choice,'wish');
  assert.deepEqual(togglePick(excluded,song,'avoid'),{});
  const text = selectionText(excluded,'Camille et Alex','2027-06-12','Pas de reprise de ce titre.');
  assert.match(text,/MORCEAUX SOUHAITÉS\nAucun morceau indiqué/);
  assert.match(text,/À NE PAS JOUER \(BLACKLIST\)\n• Perfect — Ed Sheeran/);
  assert.match(text,/Camille et Alex/);
  assert.match(text,/2027-06-12/);
  assert.match(text,/Pas de reprise/);
});
