import {HOUR, MINUTE, MONTH, DAY_OF_WEEK, DAY_OF_MONTH} from "~/constants/time-unit";

export const isValidMinute = function(minute) {
  if (minute >= MINUTE.MIN && minute <= MINUTE.MAX) {
    return true;
  } else return false;
};
export const isValidHour = function(hour) {
  if (hour >= HOUR.MIN && hour <= HOUR.MAX) {
    return true;
  }
  return false;
};
export const isValidDayOfMonth = function(day) {
  if (day >= DAY_OF_MONTH.MIN && day <= DAY_OF_MONTH.MAX) {
    return true;
  }
  return false;
};
export const isValidMonth = function(month) {
  if (month >= MONTH.MIN && month <= MONTH.MAX) {
    return true;
  }
  return false;
};
export const isValidDayOfWeek = function(number) {
  if (number >= DAY_OF_WEEK.MIN && number <= DAY_OF_WEEK.MAX) {
    return true;
  }
  return false;
};

export const numberToDayOfWeek = function(number) {
  if (number >= DAY_OF_WEEK.MIN && number <= DAY_OF_WEEK.MAX && number) {
    switch (number) {
      case "0":
        return "Chủ nhật";
        break;
      default:
        return `Thứ ${parseInt(number) + 1}`;
        break;
    }
  } else return "";
};
export const formatTime = function(minute, hour) {
  let hourFormat = "";
  let minuteFormat = "";
  if (isValidHour(hour) && isValidMinute(minute)) {
    if (hour >= 0 && hour < 10) {
      hourFormat = hourFormat.concat("0").concat(hour);
    } else hourFormat = hourFormat.concat(hour);
    if (minute >= 0 && minute < 10) {
      minuteFormat = minuteFormat.concat("0").concat(minute);
    } else minuteFormat = minuteFormat.concat(minute);
    return hourFormat.concat(":").concat(minuteFormat);
  }
  return "";
};
