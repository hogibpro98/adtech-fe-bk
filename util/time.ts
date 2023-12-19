// @ts-ignore
import moment from "moment/src/moment";
import { isArray } from "~/util/typeof";

export const numDayRange = (
  from: string | number,
  to: string | number
): number => {
  if (!from && !to) return 0;
  if (!from || !to) return 1;

  const date1 = moment(from);
  const date2 = moment(to);
  return date2.diff(date1, "day") + 1;
};

export const addDay = (
  date: string | number,
  numday: number
): moment.Moment => {
  if (!date) return null;

  return moment(date).add(numday, "day");
};

export const toHumanize = (time: number, baseUnit = "seconds") => {
  // @ts-ignore
  const timeValue = moment.duration(time, baseUnit);
  const days = Math.floor(timeValue.asDays());
  const hours = timeValue.hours();
  const minutes = timeValue.minutes();
  const seconds = timeValue.seconds();
  let str = "";
  if (days >= 1) {
    str += `${days} ngày, `;
  }
  if (hours > 0) {
    str += hours < 10 ? `0${hours}h` : `${hours}h`;
  }
  if (minutes >= 0) {
    str += minutes < 10 ? `0${minutes}m` : `${minutes}m`;
  }
  if (seconds >= 0) {
    str += seconds < 10 ? `0${seconds}s` : `${seconds}s`;
  }
  return str;
};

export const convertPeriodTimeToArray = (
  val: Array<number | string>
): Array<number> => {
  let start, end;
  if (isArray(val)) {
    const [dateFrom, dateTo] = val;
    if (!dateFrom && !dateTo) return [];
    if (!dateTo) {
      start = dateFrom;
      end = dateFrom;
    } else if (!dateFrom) {
      start = dateTo;
      end = dateTo;
    } else {
      start = dateFrom;
      end = dateTo;
    }
  } else if (val) {
    start = val;
    end = val;
  } else {
    return [];
  }

  return [
    moment(start)
      .startOf("day")
      .toDate()
      .getTime() +
      60 * 1000,
    moment(end)
      .endOf("day")
      .toDate()
      .getTime() -
      60 * 1000
  ];
};

export const countDay = (schedule, startTime, endTime, restrictedDays = []) => {
  if (!schedule) {
    return 0;
  }
  // if (!startTime || !endTime) return 1;
  const fromDay = new Date(startTime.substr(0, 10) + "T00:00:00Z").getTime();
  const toDay = new Date(endTime.substr(0, 10) + "T00:00:00Z").getTime();
  let countDays = 0;
  let allDays = [];

  schedule.forEach(time => {
    allDays = [...allDays, ...time.days];
  });

  for (let i = fromDay; i <= toDay; i += 24 * 3600 * 1000) {
    if (
      allDays.includes(
        new Date(i).toLocaleString("en-US", { weekday: "short" })
      ) &&
      !restrictedDays.includes(new Date(i).toISOString().substr(0, 10))
    ) {
      countDays++;
    }
  }
  return countDays;
};
