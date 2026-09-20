import type { Song } from './catalog';

// Sélection éditoriale de Guillaume ; les morceaux restent dans leur énergie.
export const trendingIds = new Set([
  'ricchi e poveri::sara perche ti amo',
  'klingande::jubel',
  'bakermat::one day (vandaag)',
  'jimmy sax::no man no cry',
  'bill withers, grover washington jr.::just the two of us',
  'bad bunny::nuevayol',
  'pharrell williams, daft punk::get lucky',
  'gala::freed from desire',
]);

export const isTrending = (song: Song) => trendingIds.has(song.id);
