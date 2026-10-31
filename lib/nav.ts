import { router } from 'expo-router';

import type { Progress } from '@/context/Playback';
import { getEpisode, type Series } from '@/data/catalog';

export function openSeries(seriesId: string) {
  router.push({ pathname: '/series/[id]', params: { id: seriesId } });
}

export function openEpisode(seriesId: string, episodeId: string) {
  router.push({ pathname: '/watch/[seriesId]/[episodeId]', params: { seriesId, episodeId } });
}

export function openCategory(categoryId: string) {
  router.push({ pathname: '/category/[id]', params: { id: categoryId } });
}

export function openSearch(query?: string) {
  router.push(query ? { pathname: '/search', params: { q: query } } : '/search');
}

export function resumeEpisode(show: Series, progress: Progress | undefined) {
  return (progress && getEpisode(show.id, progress.episodeId)) || show.episodes[0];
}
