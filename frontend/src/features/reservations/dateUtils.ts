export function isoDay(d: Date): string {
  const copy = new Date(d.getTime() - d.getTimezoneOffset() * 60_000);
  return copy.toISOString().slice(0, 10);
}

export function parseIsoDay(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

export function tomorrowIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return isoDay(d);
}

export function isWeekendDate(value: string): boolean {
  const day = parseIsoDay(value).getDay();
  return day === 0 || day === 6;
}

/**
 * The booking calendar only offers days the club really publishes, so a requested
 * date that falls on a closure day or outside the window is moved to the closest
 * bookable day instead of showing an empty sheet.
 */
export function nearestAvailableDate(availableDates: string[], requested: string): string {
  if (availableDates.length === 0) return requested;
  if (availableDates.includes(requested)) return requested;

  const target = parseIsoDay(requested).getTime();

  return availableDates.reduce((best, candidate) => {
    const distance = Math.abs(parseIsoDay(candidate).getTime() - target);
    return distance < Math.abs(parseIsoDay(best).getTime() - target) ? candidate : best;
  }, availableDates[0]);
}
