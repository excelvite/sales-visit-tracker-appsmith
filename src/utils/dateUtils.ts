
import { format, isToday, isYesterday, startOfWeek, endOfWeek, addDays } from 'date-fns';

export const formatDate = (date: Date): string => {
  return format(date, 'MMM dd, yyyy');
};

export const formatDateTime = (date: Date): string => {
  return format(date, 'MMM dd, yyyy HH:mm');
};

export const formatRelativeDate = (date: Date): string => {
  if (isToday(date)) {
    return `Today at ${format(date, 'HH:mm')}`;
  }
  
  if (isYesterday(date)) {
    return `Yesterday at ${format(date, 'HH:mm')}`;
  }
  
  return formatDate(date);
};

export const getCurrentWeekRange = (): { start: Date, end: Date } => {
  const start = startOfWeek(new Date());
  const end = endOfWeek(new Date());
  
  return { start, end };
};

export const getWeekDays = (): Date[] => {
  const start = startOfWeek(new Date());
  const weekDays: Date[] = [];
  
  for (let i = 0; i < 7; i++) {
    weekDays.push(addDays(start, i));
  }
  
  return weekDays;
};
