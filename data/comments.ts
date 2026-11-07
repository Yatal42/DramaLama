export type Comment = {
  id: string;
  author: string;
  text: string;
  minutesAgo: number;
  likes: number;
  mine?: boolean;
};

const authors = ['Maya R.', 'jess_watches', 'Lior', 'Danielle K.', 'binge_queen', 'Noa', 'Sam T.', 'Rachel'];

const lines = [
  'I did NOT see that coming',
  'The way he looked at her in the last second...',
  'Who else is watching this at 2am',
  "She deserves better and she knows it",
  'This cliffhanger is illegal',
  'Okay the mom is definitely hiding something',
  'Rewatched this episode three times already',
  'Finally someone stood up to him!',
  'The acting in this one is so good',
  'I need the next episode right now',
];

const blocked = ['fuck', 'shit', 'bitch', 'cunt', 'asshole', 'bastard'];

function hash(value: string) {
  let result = 0;
  for (let index = 0; index < value.length; index += 1) {
    result = (result * 31 + value.charCodeAt(index)) >>> 0;
  }
  result = Math.imul(result ^ (result >>> 16), 0x85ebca6b);
  result = Math.imul(result ^ (result >>> 13), 0xc2b2ae35);
  return (result ^ (result >>> 16)) >>> 0;
}

export function seedComments(episodeId: string): Comment[] {
  return Array.from({ length: 6 }, (_, index) => {
    const pick = hash(`${episodeId}#${index}`);
    return {
      id: `${episodeId}-seed-${index}`,
      author: authors[pick % authors.length],
      text: lines[(pick >>> 3) % lines.length],
      minutesAgo: 5 + ((pick >>> 5) % 600),
      likes: (pick >>> 2) % 900,
    };
  }).sort((a, b) => b.likes - a.likes);
}

export function commentCount(episodeId: string) {
  return 120 + (hash(episodeId) % 4800);
}

export function hasProfanity(text: string) {
  const lower = text.toLowerCase();
  return blocked.some((word) => lower.includes(word));
}

export function formatAgo(minutes: number) {
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}
