import { seriesList, trending, type Series } from '@/data/catalog';

export const companionName = 'Lama';

export type ChatMessage = {
  id: string;
  from: 'companion' | 'viewer' | 'system';
  text: string;
  series?: Series[];
};

export type CompanionContext = {
  customerId: string;
  coins: number;
  points: number;
  streak: number;
  savedIds: string[];
  watchedIds: string[];
};

export const quickReplies = [
  'Recommend me something',
  'I paid but an episode is locked',
  'How do I earn points?',
  'Talk to a human',
];

let counter = 0;

export function message(from: ChatMessage['from'], text: string, series?: Series[]): ChatMessage {
  counter += 1;
  return { id: `${Date.now()}-${counter}`, from, text, series };
}

export function greeting(mode: 'chat' | 'support'): ChatMessage {
  return mode === 'support'
    ? message(
        'companion',
        `Hi, I'm ${companionName}, your DramaLama companion. Tell me what went wrong with coins, unlocks, your account, or playback, and I'll sort it out.`,
      )
    : message(
        'companion',
        `Hey! I'm ${companionName}. I know every twist in our catalog. Want a recommendation, or do you need help with something?`,
      );
}

function recommend(context: CompanionContext) {
  const known = new Set([...context.savedIds, ...context.watchedIds]);
  const favoriteGenres = seriesList
    .filter((show) => known.has(show.id))
    .map((show) => show.genre);
  const fresh = trending.filter((show) => !context.watchedIds.includes(show.id));
  const matching = fresh.filter((show) => favoriteGenres.includes(show.genre));
  const picks = [...matching, ...fresh.filter((show) => !matching.includes(show))].slice(0, 3);
  return picks.length > 0 ? picks : trending.slice(0, 3);
}

function matches(text: string, words: string[]) {
  return words.some((word) => text.includes(word));
}

export function reply(input: string, context: CompanionContext): ChatMessage[] {
  const text = input.toLowerCase();

  if (matches(text, ['human', 'agent', 'person', 'representative', 'support team'])) {
    return [
      message(
        'system',
        `Sent to a support agent with your customer ID ${context.customerId} and this conversation. You'll get a notification when they reply.`,
      ),
      message('companion', "Done! A real person will pick it up from here. I'll stay around if you need anything else."),
    ];
  }

  if (matches(text, ['paid', 'pay', 'locked', 'charge', 'refund', 'purchase', 'unlock', 'coin', 'money'])) {
    return [
      message(
        'companion',
        `I checked your wallet: you have ${context.coins} coins and ${context.points} points, and I don't see any failed purchases. I also refreshed your unlocks, so anything you paid for should open now.`,
      ),
      message('companion', "If an episode still looks locked, say \"talk to a human\" and I'll pass it to our support team with all the details."),
    ];
  }

  if (matches(text, ['point', 'streak', 'check in', 'check-in', 'reward', 'mission'])) {
    return [
      message(
        'companion',
        `You have ${context.points} points and a ${context.streak}-day streak. Check in every day in Profile for points (day 7 gives a bonus), comment on episodes, and finish missions. Soon you'll be able to spend points on outfits for me!`,
      ),
    ];
  }

  if (matches(text, ['recommend', 'suggest', 'watch', 'bored', 'something', 'what should', 'show me', 'romance', 'revenge', 'ceo', 'thriller'])) {
    const picks = recommend(context);
    return [message('companion', 'Based on what you like, these should hook you from episode 1:', picks)];
  }

  if (/\b(hi|hey|hello|thanks|thank you)\b/.test(text)) {
    return [message('companion', 'Anytime! Want a recommendation, or is something not working?')];
  }

  return [
    message(
      'companion',
      "I'm not sure I got that. I can recommend series, check your coins and unlocks, explain points, or connect you with a human.",
    ),
  ];
}
