
import { Goal, GoalType } from '../types';

/**
 * Calculates the ISO 8601 week number for a given date.
 * Monday is the first day of the week.
 */
export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  // Get first day of year
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  // Calculate full weeks to nearest Thursday
  const weekNo = Math.ceil((((d.valueOf() - yearStart.valueOf()) / 86400000) + 1) / 7);
  return weekNo;
}

export function getPeriodId(date: Date, type: GoalType): string {
  const year = date.getFullYear();
  switch (type) {
    case 'daily':
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    case 'weekly':
      const week = getWeekNumber(date).toString().padStart(2, '0');
      return `${year}-W${week}`;
    case 'monthly':
      const monthMonthly = (date.getMonth() + 1).toString().padStart(2, '0');
      return `${year}-${monthMonthly}`;
    default:
      throw new Error('Invalid goal type');
  }
}

function getDateFromPeriodId(periodId: string): Date {
    const parts = periodId.split('-');
    if (parts.length === 3 && parts[1].startsWith('W')) { // Weekly 'YYYY-Www'
        const year = parseInt(parts[0], 10);
        const week = parseInt(parts[1].substring(1), 10);
        
        // Find the date of the first day of the week
        const d = new Date(year, 0, 1 + (week - 1) * 7);
        const dayOfWeek = d.getDay() || 7;
        if (dayOfWeek !== 1) {
            d.setHours(-24 * (dayOfWeek - 1));
        }
        return d;
    } else if (parts.length === 3) { // Daily 'YYYY-MM-DD'
        return new Date(periodId + 'T00:00:00');
    } else if (parts.length === 2) { // Monthly 'YYYY-MM'
        return new Date(periodId + '-01T00:00:00');
    }
    throw new Error('Invalid periodId format');
}


export function getParentPeriodId(childGoal: Goal): string | null {
  try {
    const childDate = getDateFromPeriodId(childGoal.periodId);
    if (childGoal.type === 'daily') {
      return getPeriodId(childDate, 'weekly');
    }
    if (childGoal.type === 'weekly') {
      return getPeriodId(childDate, 'monthly');
    }
    return null;
  } catch (error) {
    console.error("Error getting parent period ID:", error);
    return null;
  }
}
