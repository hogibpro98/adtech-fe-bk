export interface FiltersInterface {
  timestamp(str?: any): string;
  date(str?: any): string;
  startOfDay(value?: any): Date;
  endOfDay(value?: any): Date;
  time(str?: any): string;
  dateObj(str?: any): object;
  getTime(str?: any): number;
  month(str?: any): string;
  sqlDate(str?: any): string;
  minDate(str?: any): Date;
  maxDate(str?: any): Date;
  dateRange(val?: any): string;
  number(str?: any): number;
  numberSpace(str?: any): string;
  currency(str?: any): string;
  spaceNumber(str?: any): string;
  formattedNumber(str?: any): string;
  readableTime(str?: any): string;
  commarize(str?: any): string;
  toEnglish(str?: any): string;
  percent(value?: number): string;
}
