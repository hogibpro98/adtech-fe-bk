// import {CRON_CASE, CRON_SYMBOL} from "../const/cron"
// import {HOUR, MINUTE, DAY_OF_MONTH, MONTH, DAY_OF_WEEK} from "../const/time-unit"
// import {isValidMinute, isValidHour, isValidDayOfMonth, isValidMonth,isValidDayOfWeek, numberToDayOfWeek} from "../helpers/time-unit"
import { CRON_CASE, CRON_SYMBOL } from "~/constants/cron";
import {
  isValidMinute,
  isValidHour,
  isValidDayOfMonth,
  isValidMonth,
  isValidDayOfWeek,
  numberToDayOfWeek
} from "~/helpers/time-unit";

function getCronCase(cron) {
  if (cron.includes(CRON_SYMBOL.STEP)) {
    if (
      cron.includes(CRON_SYMBOL.RANGE) &&
      !cron.includes(CRON_SYMBOL.SEPARATOR)
    ) {
      return "every_unit_in_range";
    } else if (
      !cron.includes(CRON_SYMBOL.RANGE) &&
      !cron.includes(CRON_SYMBOL.SEPARATOR)
    ) {
      return "every_unit";
    } else return "not_standard";
  } else if (cron.includes(CRON_SYMBOL.RANGE)) {
    if (cron.includes(CRON_SYMBOL.SEPARATOR)) {
      return "in_unit_and_range";
    } else if (!cron.includes(CRON_SYMBOL.SEPARATOR)) {
      return "between_range";
    } else return "not_standard";
  } else if (cron.includes(CRON_SYMBOL.SEPARATOR)) {
    return "in_units";
  } else if (!isNaN(cron)) return "number";
}

function getCronUtils(cron) {
  return {
    step: cron.slice(cron.indexOf(CRON_SYMBOL.STEP) + 1),
    begin: cron.slice(0, cron.indexOf(CRON_SYMBOL.RANGE)),
    endWithStep: cron.slice(
      cron.indexOf(CRON_SYMBOL.RANGE) + 1,
      cron.indexOf(CRON_SYMBOL.STEP)
    ),
    end: cron.slice(cron.indexOf(CRON_SYMBOL.RANGE) + 1),
    separateString: ", "
  };
}

export const translateMinuteCron = function(cron) {
  if (cron) {
    const cronUtils = getCronUtils(cron);
    switch (getCronCase(cron)) {
      case CRON_CASE.NUMBER_CASE:
        if (isValidMinute(cron)) {
          return `tại phút thứ ${cron}`;
        }
        return "";
        break;
      case CRON_CASE.EVERY_UNIT_CASE:
        if (cronUtils.step == 1) {
          return "mỗi phút ";
        }
        return `mỗi ${cronUtils.step} phút `;
        break;
      case CRON_CASE.EVERY_UNIT_BETWEEN_RANGE_CASE:
        if (
          parseInt(cronUtils.begin) < parseInt(cronUtils.endWithStep) &&
          isValidMinute(cronUtils.begin) &&
          isValidMinute(cronUtils.endWithStep)
        ) {
          return `mỗi ${cronUtils.step} phút, từ phút thứ ${cronUtils.begin} đến phút thứ ${cronUtils.endWithStep}`;
        }
        return "";
        break;
      case CRON_CASE.BETWEEN_RANGE_CASE:
        if (
          cronUtils.begin < cronUtils.end &&
          isValidMinute(cronUtils.begin) &&
          isValidMinute(cronUtils.end)
        ) {
          return (
            `từ phút thứ ` + cronUtils.begin + ` đến phút thứ ` + cronUtils.end
          );
        }
        return "";
        break;
      case CRON_CASE.IN_UNITS_CASE:
        const cronArray = cron.split(",");
        let minuteString = "vào phút thứ ";
        for (let i = 0; i < cronArray.length; i++) {
          if (isValidMinute(cronArray[i])) {
            minuteString =
              minuteString + cronArray[i] + cronUtils.separateString;
          }
        }
        return minuteString.substring(
          0,
          minuteString.length - cronUtils.separateString.length
        );
        break;
      case CRON_CASE.IN_UNITS_AND_RANGE_CASE:
        const cronArray1 = cron.split(",");
        let minuteString1 = "vào phút thứ ";
        for (let i = 0; i < cronArray1.length; i++) {
          if (cronArray1[i].includes("-")) {
            const begin1 = cronArray1[i].slice(0, cronArray1[i].indexOf("-"));
            const end1 = cronArray1[i].slice(cronArray1[i].indexOf("-") + 1);
            if (
              begin1 &&
              end1 &&
              isValidMinute(begin1) &&
              isValidMinute(end1)
            ) {
              if (i == 0) {
                minuteString1 =
                  minuteString1 +
                  begin1 +
                  " đến phút thứ " +
                  end1 +
                  cronUtils.separateString;
              } else
                minuteString1 =
                  minuteString1 +
                  "từ phút thứ " +
                  begin1 +
                  " đến phút thứ " +
                  end1 +
                  cronUtils.separateString;
            }
          } else if (isValidMinute(cronArray1[i])) {
            minuteString1 =
              minuteString1 + cronArray1[i] + cronUtils.separateString;
          }
        }
        return minuteString1.substring(
          0,
          minuteString1.length - cronUtils.separateString.length
        );
        break;
    }
  }
};

export const translateHourCron = function(cron) {
  if (cron) {
    const cronUtils = getCronUtils(cron);
    switch (getCronCase(cron)) {
      case CRON_CASE.NUMBER_CASE:
        if (isValidHour(cron)) {
          return `vào ${cron} giờ`;
        }
        return "";
        break;
      case CRON_CASE.EVERY_UNIT_CASE:
        if (cronUtils.step == 1) {
          return "hàng giờ";
        }
        return `mỗi ${cronUtils.step} giờ`;
        break;
      case CRON_CASE.EVERY_UNIT_BETWEEN_RANGE_CASE:
        if (
          cronUtils.step > 0 &&
          parseInt(cronUtils.begin) < parseInt(cronUtils.endWithStep) &&
          isValidHour(cronUtils.begin) &&
          isValidHour(cronUtils.endWithStep)
        ) {
          return `mỗi ${cronUtils.step} giờ, từ ${cronUtils.begin} giờ đến ${cronUtils.endWithStep} giờ`;
        }
        return "";
        break;
      case CRON_CASE.BETWEEN_RANGE_CASE:
        if (
          cronUtils.begin < cronUtils.end &&
          isValidHour(cronUtils.begin) &&
          isValidHour(cronUtils.end)
        )
          return `từ ` + cronUtils.begin + " giờ đến " + cronUtils.end + " giờ";
        return "";
        break;
      case CRON_CASE.IN_UNITS_CASE:
        const cronArray = cron.split(",");
        let hourString = "vào ";
        for (let i = 0; i < cronArray.length; i++) {
          if (isValidHour(cronArray[i])) {
            hourString =
              hourString + cronArray[i] + " giờ" + cronUtils.separateString;
          }
        }
        return hourString.substring(
          0,
          hourString.length - cronUtils.separateString.length
        );
        break;
      case CRON_CASE.IN_UNITS_AND_RANGE_CASE:
        const cronArray1 = cron.split(",");
        let hourString1 = "vào ";
        for (let i = 0; i < cronArray1.length; i++) {
          if (cronArray1[i].includes("-")) {
            const begin1 = cronArray1[i].slice(
              0,
              cronArray1[i].indexOf(CRON_SYMBOL.RANGE)
            );
            const end1 = cronArray1[i].slice(
              cronArray1[i].indexOf(CRON_SYMBOL.RANGE) + 1
            );
            if (begin1 && end1 && isValidHour(begin1) && isValidHour(end1)) {
              if (i == 0) {
                hourString1 =
                  hourString1 +
                  begin1 +
                  " giờ" +
                  " đến " +
                  end1 +
                  " giờ" +
                  cronUtils.separateString;
              } else
                hourString1 =
                  hourString1 +
                  "từ " +
                  begin1 +
                  " giờ" +
                  " đến " +
                  end1 +
                  " giờ" +
                  cronUtils.separateString;
            }
          } else if (isValidHour(cronArray1[i])) {
            hourString1 =
              hourString1 + cronArray1[i] + " giờ" + cronUtils.separateString;
          }
        }
        return hourString1.substring(
          0,
          hourString1.length - cronUtils.separateString.length
        );
    }
  }
};
export const translateDayCron = function(cron) {
  if (cron) {
    const cronUtils = getCronUtils(cron);
    switch (getCronCase(cron)) {
      case CRON_CASE.NUMBER_CASE:
        if (isValidDayOfMonth(cron)) {
          return `tại ngày thứ ${cron} trong tháng`;
        }
        return "";
        break;
      case CRON_CASE.EVERY_UNIT_CASE:
        if (cronUtils.step == 1) {
          return "tất cả các ngày trong tháng";
        }
        return `mỗi ${cronUtils.step} ngày`;
        break;
      case CRON_CASE.EVERY_UNIT_BETWEEN_RANGE_CASE:
        if (
          parseInt(cronUtils.begin) < parseInt(cronUtils.endWithStep) &&
          isValidDayOfMonth(cronUtils.begin) &&
          isValidDayOfMonth(cronUtils.endWithStep)
        ) {
          return `mỗi ${cronUtils.step} ngày, từ ngày thứ ${cronUtils.begin} đến ngày thứ ${cronUtils.endWithStep} trong tháng`;
        }
        return "";
        break;
      case CRON_CASE.BETWEEN_RANGE_CASE:
        if (
          parseInt(cronUtils.begin) < parseInt(cronUtils.end) &&
          isValidDayOfMonth(cronUtils.begin) &&
          isValidDayOfMonth(cronUtils.end)
        ) {
          return (
            `từ ngày thứ ` +
            cronUtils.begin +
            ` đến ngày thứ ` +
            cronUtils.end +
            " trong tháng"
          );
        }
        return "";
        break;
      case CRON_CASE.IN_UNITS_CASE:
        const cronArray = cron.split(",");
        let dayOfMonthString = "tại ngày thứ ";
        for (let i = 0; i < cronArray.length; i++) {
          if (isValidDayOfMonth(cronArray[i])) {
            dayOfMonthString =
              dayOfMonthString + cronArray[i] + cronUtils.separateString;
          }
        }
        return dayOfMonthString
          .substring(
            0,
            dayOfMonthString.length - cronUtils.separateString.length
          )
          .concat(" trong tháng");
        break;
      case CRON_CASE.IN_UNITS_AND_RANGE_CASE:
        const cronArray1 = cron.split(",");
        let dayOfMonthString1 = "tại ngày thứ ";
        for (let i = 0; i < cronArray1.length; i++) {
          if (cronArray1[i].includes(CRON_SYMBOL.RANGE)) {
            const begin1 = cronArray1[i].slice(0, cronArray1[i].indexOf("-"));
            const end1 = cronArray1[i].slice(cronArray1[i].indexOf("-") + 1);
            if (
              begin1 &&
              end1 &&
              isValidDayOfMonth(begin1) &&
              isValidDayOfMonth(end1)
            ) {
              if (i == 0) {
                dayOfMonthString1 =
                  dayOfMonthString1 +
                  begin1 +
                  " đến ngày thứ " +
                  end1 +
                  cronUtils.separateString;
              } else {
                dayOfMonthString1 =
                  dayOfMonthString1 +
                  "từ ngày thứ " +
                  begin1 +
                  " đến ngày thứ " +
                  end1 +
                  cronUtils.separateString;
                console.log(dayOfMonthString1);
              }
            } else return "";
          } else if (isValidDayOfMonth(cronArray1[i])) {
            dayOfMonthString1 =
              dayOfMonthString1 + cronArray1[i] + cronUtils.separateString;
          }
        }
        return dayOfMonthString1.substring(
          0,
          dayOfMonthString1.length - cronUtils.separateString.length
        );
        break;
    }
  }
};
export const translateMonthCron = function(cron) {
  if (cron) {
    const cronUtils = getCronUtils(cron);
    switch (getCronCase(cron)) {
      case CRON_CASE.NUMBER_CASE:
        if (isValidMonth(cron)) {
          return `tại tháng ${cron}`;
        }
        return "";
        break;
      case CRON_CASE.EVERY_UNIT_CASE:
        if (cronUtils.step == 1) return "hàng tháng";
        return `mỗi ${cronUtils.step} tháng`;
        break;
      case CRON_CASE.EVERY_UNIT_BETWEEN_RANGE_CASE:
        if (
          parseInt(cronUtils.begin) < parseInt(cronUtils.endWithStep) &&
          isValidMonth(cronUtils.begin) &&
          isValidMonth(cronUtils.endWithStep)
        ) {
          return `mỗi ${cronUtils.step} tháng, từ tháng ${cronUtils.begin} đến tháng ${cronUtils.endWithStep}`;
        }
        return "";
        break;
      case CRON_CASE.BETWEEN_RANGE_CASE:
        if (
          cronUtils.begin < cronUtils.end &&
          isValidMonth(cronUtils.begin) &&
          isValidMonth(cronUtils.end)
        ) {
          return `từ tháng ` + cronUtils.begin + ` đến tháng ` + cronUtils.end;
        }
        return "";
        break;
      case CRON_CASE.IN_UNITS_CASE:
        const cronArray = cron.split(",");
        let monthString = "vào tháng ";
        for (let i = 0; i < cronArray.length; i++) {
          if (isValidMonth(cronArray[i])) {
            monthString = monthString + cronArray[i] + cronUtils.separateString;
          }
        }
        return monthString.substring(
          0,
          monthString.length - cronUtils.separateString.length
        );
        break;
      case CRON_CASE.IN_UNITS_AND_RANGE_CASE:
        const cronArray1 = cron.split(",");
        let monthString1 = "vào tháng ";
        for (let i = 0; i < cronArray1.length; i++) {
          if (cronArray1[i].includes(CRON_SYMBOL.RANGE)) {
            const begin1 = cronArray1[i].slice(0, cronArray1[i].indexOf("-"));
            const end1 = cronArray1[i].slice(cronArray1[i].indexOf("-") + 1);
            if (begin1 && end1 && isValidMonth(begin1) && isValidMonth(end1)) {
              if (i == 0) {
                monthString1 =
                  monthString1 +
                  begin1 +
                  " đến tháng " +
                  end1 +
                  cronUtils.separateString;
              } else
                monthString1 =
                  monthString1 +
                  "từ tháng " +
                  begin1 +
                  " đến tháng " +
                  end1 +
                  cronUtils.separateString;
            } else return "";
          } else if (isValidMonth(cronArray1[i])) {
            monthString1 =
              monthString1 + cronArray1[i] + cronUtils.separateString;
          }
        }
        return monthString1.substring(
          0,
          monthString1.length - cronUtils.separateString.length
        );
        break;
    }
  }
};

export const translateDayOfWeekCron = function(cron) {
  if (cron) {
    const cronUtils = getCronUtils(cron);
    switch (getCronCase(cron)) {
      case CRON_CASE.NUMBER_CASE:
        if (isValidDayOfWeek(cron)) {
          return "vào " + numberToDayOfWeek(cron);
        }
        return "";
        break;
      case CRON_CASE.EVERY_UNIT_CASE:
        if (cronUtils.step == 1) return "các ngày trong tuần";
        return `mỗi ${cronUtils.step} ngày trong tuần`;
        break;
      case CRON_CASE.EVERY_UNIT_BETWEEN_RANGE_CASE:
        if (
          cronUtils.begin < cronUtils.endWithStep &&
          isValidDayOfWeek(cronUtils.begin) &&
          isValidDayOfWeek(cronUtils.endWithStep)
        ) {
          return (
            `mỗi ${cronUtils.step} ngày trong tuần từ ` +
            `${numberToDayOfWeek(cronUtils.begin)} ` +
            `đến ${numberToDayOfWeek(cronUtils.endWithStep)}`
          );
        }
        return "";
        break;
      case CRON_CASE.BETWEEN_RANGE_CASE:
        if (
          isValidDayOfWeek(cronUtils.begin) &&
          isValidDayOfWeek(cronUtils.end) &&
          cronUtils.begin < cronUtils.end
        ) {
          return `từ ${numberToDayOfWeek(
            cronUtils.begin
          )} đến ${numberToDayOfWeek(cronUtils.end)} trong tuần`;
        }
        return "";
        break;
      case CRON_CASE.IN_UNITS_CASE:
        const cronArray = cron.split(",");
        let dayOfWeekString = "vào ";
        for (let i = 0; i < cronArray.length; i++) {
          if (isValidDayOfWeek(cronArray[i])) {
            dayOfWeekString =
              dayOfWeekString +
              numberToDayOfWeek(cronArray[i]) +
              cronUtils.separateString;
          } else return "";
        }
        return dayOfWeekString.substring(
          0,
          dayOfWeekString.length - cronUtils.separateString.length
        );
        break;
      case CRON_CASE.IN_UNITS_AND_RANGE_CASE:
        const cronArray1 = cron.split(",");
        let dayOfWeekString1 = "vào ";
        for (let i = 0; i < cronArray1.length; i++) {
          if (cronArray1[i].includes(CRON_SYMBOL.RANGE)) {
            const begin1 = cronArray1[i].slice(0, cronArray1[i].indexOf("-"));
            const end1 = cronArray1[i].slice(cronArray1[i].indexOf("-") + 1);
            if (
              begin1 &&
              end1 &&
              isValidDayOfWeek(begin1) &&
              isValidDayOfWeek(end1)
            ) {
              if (i == 0) {
                dayOfWeekString1 =
                  dayOfWeekString1 +
                  numberToDayOfWeek(begin1) +
                  " đến " +
                  numberToDayOfWeek(end1) +
                  cronUtils.separateString;
              } else
                dayOfWeekString1 =
                  dayOfWeekString1 +
                  "từ " +
                  numberToDayOfWeek(begin1) +
                  " đến " +
                  numberToDayOfWeek(end1) +
                  cronUtils.separateString;
            } else return "";
          } else if (isValidDayOfWeek(cronArray1[i])) {
            dayOfWeekString1 =
              dayOfWeekString1 +
              numberToDayOfWeek(cronArray1[i]) +
              cronUtils.separateString;
          } else return "";
        }
        return dayOfWeekString1.substring(
          0,
          dayOfWeekString1.length - cronUtils.separateString.length
        );
        break;
    }
  }
};
