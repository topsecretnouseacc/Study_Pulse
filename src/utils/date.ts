const turkeyTimeZone = 'Europe/Istanbul';

export function getTurkeyDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: turkeyTimeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const year = parts.find((part) => part.type === 'year')?.value ?? '1970';
  const month = parts.find((part) => part.type === 'month')?.value ?? '01';
  const day = parts.find((part) => part.type === 'day')?.value ?? '01';

  return `${year}-${month}-${day}`;
}

export function shiftDateKey(dateKey: string, offsetDays: number) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + offsetDays, 12));
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, '0'),
    String(date.getUTCDate()).padStart(2, '0'),
  ].join('-');
}

export function isTurkeyToday(dateKey: string) {
  return dateKey.slice(0, 10) === getTurkeyDateKey();
}

export function isTurkeyYesterday(dateKey: string | null) {
  if (!dateKey) return false;
  return dateKey === shiftDateKey(getTurkeyDateKey(), -1);
}

export function getShortWeekdayForDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12));
  const labels = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
  return labels[date.getUTCDay()];
}

export function getStudyLogDateKey(date: string) {
  if (date === 'Bugün' || date === 'BugÃ¼n') return getTurkeyDateKey();
  return date.slice(0, 10);
}
