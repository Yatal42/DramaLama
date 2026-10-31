export function formatClock(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0:00';
  }
  const total = Math.floor(seconds);
  const minutes = Math.floor(total / 60);
  const remain = total % 60;
  return `${minutes}:${remain.toString().padStart(2, '0')}`;
}

export function formatCount(value: number) {
  if (value >= 1_000_000) {
    return `${trim(value / 1_000_000)}M`;
  }
  if (value >= 1_000) {
    return `${trim(value / 1_000)}K`;
  }
  return `${value}`;
}

export function seriesCount(value: number) {
  return `${value} series`;
}

export function resultCount(value: number) {
  if (value === 0) return 'No results';
  return value === 1 ? '1 result' : `${value} results`;
}

function trim(value: number) {
  return value >= 100 ? Math.round(value).toString() : value.toFixed(1).replace(/\.0$/, '');
}
