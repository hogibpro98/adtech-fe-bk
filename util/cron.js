import { CRON_SYMBOL, CRON_UNIT_INDEX } from "~/constants/cron";
import { formatTime } from "~/helpers/time-unit";
import {
  translateMonthCron,
  translateHourCron,
  translateDayCron,
  translateDayOfWeekCron,
  translateMinuteCron
} from "~/util/cron-units";

export const translateCron = function (cron) {
  const cronArray = cron.split(" ");
  let translateString = "";
  const separateString = ", ";
  let haveEveryUnit = false;
  if (cronArray.length < 6) {
    if (
      !isNaN(cronArray[CRON_UNIT_INDEX.MINUTE]) &&
      !isNaN(cronArray[CRON_UNIT_INDEX.HOUR])
    ) {
      if (
        translateMinuteCron(cronArray[CRON_UNIT_INDEX.MINUTE]) &&
        translateHourCron(cronArray[CRON_UNIT_INDEX.HOUR])
      ) {
        translateString =
          translateString +
          "vào " +
          formatTime(
            cronArray[CRON_UNIT_INDEX.MINUTE],
            cronArray[CRON_UNIT_INDEX.HOUR]
          ) +
          separateString;
      } else return (translateString = "");
    } else {
      if (cronArray[CRON_UNIT_INDEX.MINUTE] !== CRON_SYMBOL.ANY_VALUE) {
        if (translateMinuteCron(cronArray[CRON_UNIT_INDEX.MINUTE])) {
          translateString =
            translateString +
            translateMinuteCron(cronArray[CRON_UNIT_INDEX.MINUTE]) +
            separateString;
        } else return (translateString = "");
      } else if (!haveEveryUnit && !translateString.includes("mỗi")) {
        translateString = translateString + "mỗi phút" + separateString;
        haveEveryUnit = true;
      }
      if (cronArray[CRON_UNIT_INDEX.HOUR] !== CRON_SYMBOL.ANY_VALUE) {
        if (translateHourCron(cronArray[CRON_UNIT_INDEX.HOUR])) {
          translateString =
            translateString +
            translateHourCron(cronArray[CRON_UNIT_INDEX.HOUR]) +
            separateString;
        } else return (translateString = "");
      } else if (!haveEveryUnit && !translateString.includes("mỗi")) {
        translateString = translateString + "mỗi giờ" + separateString;
        haveEveryUnit = true;
      }
    }
    if (cronArray[CRON_UNIT_INDEX.DAY_OF_MONTH] !== CRON_SYMBOL.ANY_VALUE) {
      if (translateDayCron(cronArray[CRON_UNIT_INDEX.DAY_OF_MONTH])) {
        translateString =
          translateString +
          translateDayCron(cronArray[CRON_UNIT_INDEX.DAY_OF_MONTH]) +
          separateString;
      } else return (translateString = "");
    } else if (
      !haveEveryUnit &&
      !translateString.includes("mỗi") &&
      !translateString.includes("hàng")
    ) {
      translateString =
        translateString + "mỗi ngày trong tháng" + separateString;
      haveEveryUnit = true;
    }
    if (cronArray[CRON_UNIT_INDEX.MONTH] !== CRON_SYMBOL.ANY_VALUE) {
      if (translateMonthCron(cronArray[CRON_UNIT_INDEX.MONTH])) {
        translateString =
          translateString +
          translateMonthCron(cronArray[CRON_UNIT_INDEX.MONTH]) +
          separateString;
      } else return (translateString = "");
    } else if (
      !haveEveryUnit &&
      !translateString.includes("mỗi") &&
      !translateString.includes("hàng")
    ) {
      translateString = translateString + "hàng tháng" + separateString;
      haveEveryUnit = true;
    }
    if (cronArray[CRON_UNIT_INDEX.DAY_OF_WEEK] !== CRON_SYMBOL.ANY_VALUE) {
      if (translateDayOfWeekCron(cronArray[CRON_UNIT_INDEX.DAY_OF_WEEK])) {
        translateString =
          translateString +
          translateDayOfWeekCron(cronArray[CRON_UNIT_INDEX.DAY_OF_WEEK]) +
          separateString;
      } else return (translateString = "");
    }
    return (
      translateString.substring(0, 1).toUpperCase() +
      translateString.substring(
        1,
        translateString.length - separateString.length
      )
    );
  }
};
