// Shared scheduling helpers used by the doctor-slots endpoint, the booking endpoint,
// and the unavailability/auto-reschedule endpoint. Keeping this in one place means
// every part of the app always agrees on what "available" means.

export const MIN_BOOKING_LEAD_MINUTES = 30;
export const SLOT_STEP_MINUTES = 30;

export type DoctorWindow = { start: string; end: string }; // 24h "HH:mm"

function timeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map((n) => parseInt(n, 10));
  return h * 60 + m;
}

function minutesTo12h(totalMinutes: number): string {
  let h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const meridiem = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} ${meridiem}`;
}

export function time12hToMinutes(label: string): number | null {
  const match = label.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = match[3].toUpperCase();
  if (meridiem === 'PM' && hours !== 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

export function generateDaySlots(windows: DoctorWindow[]): string[] {
  const slots: string[] = [];
  for (const w of windows || []) {
    const startMin = timeToMinutes(w.start);
    const endMin = timeToMinutes(w.end);
    for (let t = startMin; t < endMin; t += SLOT_STEP_MINUTES) {
      slots.push(minutesTo12h(t));
    }
  }
  return slots;
}

export function isSunday(dateStr: string): boolean {
  const d = new Date(dateStr + 'T00:00:00');
  return d.getDay() === 0;
}

export function getSlotDateTime(dateStr: string, timeLabel: string): Date | null {
  const minutes = time12hToMinutes(timeLabel);
  if (minutes === null) return null;
  const dt = new Date(dateStr + 'T00:00:00');
  if (isNaN(dt.getTime())) return null;
  dt.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  return dt;
}

export function addDaysToDateStr(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export function getAvailableSlotsForDate(
  windows: DoctorWindow[],
  dateStr: string,
  bookedTimes: string[]
): string[] {
  const daySlots = generateDaySlots(windows);
  const minBookableTime = Date.now() + MIN_BOOKING_LEAD_MINUTES * 60 * 1000;

  return daySlots.filter((slot) => {
    if (bookedTimes.includes(slot)) return false;
    const slotDt = getSlotDateTime(dateStr, slot);
    if (!slotDt) return false;
    return slotDt.getTime() >= minBookableTime;
  });
}

// Finds the next N available slots for a doctor starting from (and including) fromDate,
// walking forward day by day (skipping Sundays and any date isDateBlocked() flags —
// e.g. a doctor-leave range), given a function that returns the already-booked times
// for any given date.
export function findNextAvailableSlots(
  windows: DoctorWindow[],
  fromDate: string,
  count: number,
  getBookedTimesForDate: (dateStr: string) => string[],
  maxDaysToScan = 45,
  isDateBlocked?: (dateStr: string) => boolean
): Array<{ date: string; time: string }> {
  const results: Array<{ date: string; time: string }> = [];
  let candidate = fromDate;

  for (let i = 0; i < maxDaysToScan && results.length < count; i++) {
    const blocked = isDateBlocked ? isDateBlocked(candidate) : false;
    if (!isSunday(candidate) && !blocked) {
      const available = getAvailableSlotsForDate(windows, candidate, getBookedTimesForDate(candidate));
      for (const time of available) {
        results.push({ date: candidate, time });
        if (results.length >= count) break;
      }
    }
    candidate = addDaysToDateStr(candidate, 1);
  }

  return results;
}
