export interface CronMinute {
  minuteModel: number;
}

export interface CronHour {
  everyHourModel: string;
  atMinuteOfHourModel: string;
}

export interface CronDay {
  everyDayModel: number;
  atTimeOfDayModel: string;
}

export interface CronWeek {
  checkboxDayModels: Array<number>;
  atTimeOfDayModel: string;
}

export interface CronMonth {
  atDayModel: number;
  atTimeOfDayModel: string;
  everyMonth: number;
}
