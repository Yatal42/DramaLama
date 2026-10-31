export type Episode = {
  id: string;
  number: number;
  title: string;
  durationSec: number;
  videoUrl: string;
};

export type Badge = 'Hot' | 'New' | 'Exclusive';

export type Series = {
  id: string;
  title: string;
  tagline: string;
  synopsis: string;
  genre: string;
  tags: string[];
  badge?: Badge;
  poster: string;
  views: number;
  likes: number;
  rating: number;
  accent: string;
  episodes: Episode[];
};

const clips = ['https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'];

type SeriesInput = Omit<Series, 'episodes' | 'poster'> & {
  episodeCount: number;
  episodeTitles: string[];
};

function build(input: SeriesInput, order: number): Series {
  const { episodeCount, episodeTitles, ...rest } = input;
  return {
    ...rest,
    poster: `https://picsum.photos/seed/dramashorts-${input.id}/600/900`,
    episodes: Array.from({ length: episodeCount }, (_, index) => {
      const number = index + 1;
      return {
        id: `${input.id}-${number}`,
        number,
        title: episodeTitles[index] ?? `Episode ${number}`,
        durationSec: 15,
        videoUrl: clips[(order + index) % clips.length],
      };
    }),
  };
}

const inputs: SeriesInput[] = [
  {
    id: 'ceo-contract',
    title: "The CEO's Contract Bride",
    tagline: 'Married on paper. Falling for real.',
    synopsis:
      'Dana signs a one-year marriage contract with the cold CEO of the company she works for. There is only one rule: no falling in love. By the end of the first week, the rule starts to crack.',
    genre: 'Romance',
    tags: ['Contract marriage', 'CEO', 'Enemies to lovers'],
    badge: 'Hot',
    views: 48_200_000,
    likes: 1_930_000,
    rating: 9.4,
    accent: '#B2344F',
    episodeCount: 60,
    episodeTitles: ['The Signature', 'Rule Number One', 'Family Dinner', 'The Ring', 'Who Is She?'],
  },
  {
    id: 'twin-return',
    title: 'The Twin Who Came Back',
    tagline: 'She was supposed to disappear. She came back with a plan.',
    synopsis:
      'Ten years ago Maya vanished and her twin sister took her place. Now Maya returns under a new name, and she is the only one who knows what really happened that night.',
    genre: 'Revenge',
    tags: ['Revenge', 'Double identity', 'Family secret'],
    badge: 'New',
    views: 31_700_000,
    likes: 1_210_000,
    rating: 9.2,
    accent: '#5B3FA8',
    episodeCount: 45,
    episodeTitles: ['The New Name', 'Mirror', 'The Invitation', 'That Night'],
  },
  {
    id: 'secret-wife',
    title: 'The Secret Wife',
    tagline: 'Three years of marriage no one knows about.',
    synopsis:
      'Ronnie is secretly married to the heir of a hotel empire. When his family starts looking for a bride for him, she has to decide whether to reveal everything or quietly disappear.',
    genre: 'Drama',
    tags: ['Secret marriage', 'Billionaire', 'Family'],
    badge: 'Exclusive',
    views: 27_900_000,
    likes: 984_000,
    rating: 9.1,
    accent: '#9C5A2E',
    episodeCount: 50,
    episodeTitles: ['The Ring in the Drawer', 'The Dinner', 'The Chosen Bride'],
  },
  {
    id: 'wolf-heir',
    title: 'Heir of the Wolf',
    tagline: 'One full moon changed the whole bloodline.',
    synopsis:
      'Aaron grew up as the outcast of the pack. On the night of the full moon he turns out to be the true heir, and everyone who mocked him starts to be afraid.',
    genre: 'Fantasy',
    tags: ['Werewolf', 'Heir', 'Hidden powers'],
    views: 22_400_000,
    likes: 802_000,
    rating: 8.9,
    accent: '#2F6B5E',
    episodeCount: 40,
    episodeTitles: ['The Outcast', 'Full Moon', 'The Mark'],
  },
  {
    id: 'noa-key',
    title: "Noa's Key",
    tagline: 'One key. Two apartments.',
    synopsis:
      'Noa finds a key in an old coat that opens the apartment above hers. The light is on, the kettle is warm, and no one is there.',
    genre: 'Thriller',
    tags: ['Mystery', 'Neighbors', 'Plot twist'],
    badge: 'Hot',
    views: 18_600_000,
    likes: 655_000,
    rating: 9.0,
    accent: '#3E6B8A',
    episodeCount: 30,
    episodeTitles: ['The Coat', 'The Floor Above', 'Someone Came Back'],
  },
  {
    id: 'last-light',
    title: 'Last Light',
    tagline: 'A night shift at a neighborhood radio station.',
    synopsis:
      'Michelle broadcasts alone after midnight. On the third night, a caller describes her street in real time. She can hang up, or keep the microphone on.',
    genre: 'Thriller',
    tags: ['Late night', 'Radio', 'Psychological'],
    views: 9_800_000,
    likes: 341_000,
    rating: 8.7,
    accent: '#C46B4A',
    episodeCount: 24,
    episodeTitles: ['The Open Line', 'Who Is Listening', 'After Sign-Off'],
  },
  {
    id: 'three-silence',
    title: 'Silent Until Sunset',
    tagline: 'A vow of silence until the sun goes down.',
    synopsis:
      'Adam and Lia agree not to speak until the end of the day. Everything they need to say lives in glances, notes, and a door left half open.',
    genre: 'Romance',
    tags: ['Slow burn', 'Couples', 'Summer'],
    badge: 'New',
    views: 6_300_000,
    likes: 288_000,
    rating: 8.8,
    accent: '#A3476A',
    episodeCount: 18,
    episodeTitles: ['The Note on the Table', 'The Half-Open Door', 'Until Sunset'],
  },
  {
    id: 'midnight-chef',
    title: 'Midnight Chef',
    tagline: 'A restaurant that opens only when everyone is asleep.',
    synopsis:
      'Leo cooks in secret in the kitchen of a closed restaurant. Every night one guest arrives with a strange request, and every dish solves a different problem in his life.',
    genre: 'Comedy',
    tags: ['Food', 'Feel-good', 'Late night'],
    views: 4_100_000,
    likes: 196_000,
    rating: 8.6,
    accent: '#B8862F',
    episodeCount: 20,
    episodeTitles: ['The First Guest', 'Soup for a Broken Heart', 'Late Dessert'],
  },
];

export const seriesList: Series[] = inputs.map(build);

export const allGenres = 'All';

export const genres = [allGenres, ...Array.from(new Set(seriesList.map((item) => item.genre)))];

export const trending = [...seriesList].sort((a, b) => b.views - a.views);

export const featured = trending.slice(0, 4);

export const fresh = seriesList.filter((item) => item.badge === 'New' || item.badge === 'Exclusive');

export function getSeries(id: string) {
  return seriesList.find((item) => item.id === id);
}

export function getEpisode(seriesId: string, episodeId: string) {
  return getSeries(seriesId)?.episodes.find((item) => item.id === episodeId);
}

export type Category = {
  id: string;
  name: string;
  description: string;
  kind: 'genre' | 'collection';
  accent: string;
  series: Series[];
};

const genreDescriptions: Record<string, string> = {
  Romance: 'Love, contracts, and broken hearts',
  Drama: 'Family secrets and big moments',
  Thriller: "Twists you won't see coming",
  Revenge: "They're back, and this time they have a plan",
  Fantasy: 'Werewolves, heirs, and hidden powers',
  Comedy: 'Light laughs for the end of the day',
};

function byViews(list: Series[]) {
  return [...list].sort((a, b) => b.views - a.views);
}

const genreCategories: Category[] = genres.slice(1).map((genre) => {
  const series = byViews(seriesList.filter((item) => item.genre === genre));
  return {
    id: genre.toLowerCase(),
    name: genre,
    description: genreDescriptions[genre] ?? '',
    kind: 'genre',
    accent: series[0]?.accent ?? '#444444',
    series,
  };
});

const collectionCategories: Category[] = [
  {
    id: 'hot',
    name: 'Hot right now',
    description: "What everyone's watching this week",
    kind: 'collection',
    accent: '#E0115A',
    series: byViews(seriesList.filter((item) => item.badge === 'Hot')),
  },
  {
    id: 'new',
    name: 'New & exclusive',
    description: 'Series that just landed',
    kind: 'collection',
    accent: '#5B3FA8',
    series: byViews(fresh),
  },
  {
    id: 'binge',
    name: 'One-night binge',
    description: 'Up to 24 episodes, done in one evening',
    kind: 'collection',
    accent: '#2F6B5E',
    series: byViews(seriesList.filter((item) => item.episodes.length <= 24)),
  },
  {
    id: 'saga',
    name: 'Epic sagas',
    description: "45+ episodes for when you don't want it to end",
    kind: 'collection',
    accent: '#9C5A2E',
    series: byViews(seriesList.filter((item) => item.episodes.length >= 45)),
  },
];

export const categories = [...genreCategories, ...collectionCategories].filter(
  (item) => item.series.length > 0,
);

export function getCategory(id: string) {
  return categories.find((item) => item.id === id);
}

export function getGenreCategory(genre: string) {
  return genreCategories.find((item) => item.name === genre);
}

export const popularSearches = ['CEO', 'Revenge', 'Werewolf', 'Contract marriage', 'Family secret', 'Mystery'];

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/["'`’]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const searchIndex = seriesList.map((show) => ({
  show,
  title: normalize(show.title),
  tags: show.tags.map(normalize),
  genre: normalize(show.genre),
  text: normalize(`${show.tagline} ${show.synopsis}`),
}));

export function searchSeries(query: string) {
  const terms = normalize(query).split(' ').filter(Boolean);
  if (terms.length === 0) return [];
  const results: { show: Series; score: number }[] = [];
  for (const entry of searchIndex) {
    let score = 0;
    let matchedAll = true;
    for (const term of terms) {
      let termScore = 0;
      if (entry.title.startsWith(term)) termScore = 100;
      else if (entry.title.includes(term)) termScore = 70;
      else if (entry.tags.some((tag) => tag.includes(term))) termScore = 50;
      else if (entry.genre.includes(term)) termScore = 40;
      else if (entry.text.includes(term)) termScore = 15;
      if (termScore === 0) {
        matchedAll = false;
        break;
      }
      score += termScore;
    }
    if (matchedAll) results.push({ show: entry.show, score });
  }
  return results
    .sort((a, b) => b.score - a.score || b.show.views - a.show.views)
    .map((item) => item.show);
}

export function nextEpisode(seriesId: string, episodeId: string) {
  const show = getSeries(seriesId);
  if (!show) return undefined;
  const index = show.episodes.findIndex((item) => item.id === episodeId);
  if (index < 0) return undefined;
  return show.episodes[index + 1];
}
