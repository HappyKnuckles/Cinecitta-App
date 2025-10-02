export * from './filtertags.constants';
export const selectedFilters: any = {
  genresTags: [],
  tageAuswahl: [],
  leinwandHighlights: [],
  extras: [],
  flags: [],
  behindertenTags: [],
};

export const filters = ['Zeitraum', 'Genre', 'Kinosaal', 'Sound', 'Barrierefreie Optionen', 'Extras', 'Zeiten'];

export const tageAuswahl = [
  { id: '', name: 'Diese Woche' },
  { id: 'tage-auswahl-heute', name: 'Heute' },
  { id: 'tage-auswahl-morgen', name: 'Morgen' },
  { id: 'tage-auswahl-amwe', name: 'Am Wochenende' },
  { id: 'tage-auswahl-naechstewoche', name: 'nächste Woche' },
  { id: 'tage-auswahl-weiterenwochen', name: 'alle weiteren Wochen' },
];

export const genresTag = [
  { id: 165060, name: 'Action' },
  { id: 165087, name: 'Animation' },
  { id: 165579, name: 'Dokumentation' },
  { id: 165122, name: 'Drama' },
  { id: 165088, name: 'Family' },
  { id: 165058, name: 'Fantasy' },
  { id: 165110, name: 'Horror' },
  { id: 165033, name: 'Komödie' },
  { id: 165137, name: 'Romance' },
  { id: 165059, name: 'Science Fiction' },
  { id: 165156, name: 'Thriller' },
  { id: 262715, name: 'Anime' },
  { id: 843164, name: 'Arthouse' },
];

export const leinwandHighlights = [
  { id: 171984, name: 'Alle Kinos' },
  { id: 168943, name: 'CINECITTA' },
  { id: 1039, name: 'Deluxe' },
  { id: 1040, name: 'Cinemagnum' },
  { id: 185228, name: 'Open Air' },
  { id: 121383, name: 'Meisengeige' },
  { id: 122646, name: 'Metropolis' },
  { id: 548180, name: 'Manhatten' },
  { id: 1053804, name: 'Onyx LED' },
];

export const extras = [
  { id: 'neustarts', name: 'Neustarts' },
  { id: 'vorverkauf', name: 'Vorverkauf' },
];

export const flags = [
  { id: 104836, name: 'ATMOS' },
  { id: 104831, name: '3D' },
  { id: 104837, name: 'OV' },
  { id: 104838, name: 'mit Untertitel' },
  { id: 631455, name: 'D-BOX' },
];

export const behindertenTags = [
  { id: 1, name: 'Hörverstärkung' },
  { id: 2, name: 'Audiodeskription' },
  { id: 3, name: 'Untertitel für Hörgeschädigte' },
];

export const excludedFilmValues = ['film_beschreibung', 'film_cover_src', 'film_favored', 'filminfo_href', 'film_system_id', 'system_id'];

export const excludedNewFilmValues = [
  'film_beschreibung',
  'film_cover_src',
  'film_favored',
  'filminfo_href',
  'film_system_id',
  'system_id',
  'film_synopsis',
  'bild_beschreibung',
  'bild_name',
  'film_teasertext',
  'system_name',
  'film_kurztext',
];
