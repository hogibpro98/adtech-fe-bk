export const CRON_CASE = {
  NUMBER_CASE: "number",
  EVERY_UNIT_CASE: "every_unit",
  EVERY_UNIT_BETWEEN_RANGE_CASE: "every_unit_in_range",
  IN_UNITS_CASE: "in_units",
  IN_UNITS_AND_RANGE_CASE: "in_unit_and_range",
  BETWEEN_RANGE_CASE: "between_range"
};

export const CRON_SYMBOL = {
  ANY_VALUE: "*",
  SEPARATOR: ",",
  STEP: "/",
  RANGE: "-"
};

export const CRON_UNIT_INDEX = {
  MINUTE: 0,
  HOUR: 1,
  DAY_OF_MONTH: 2,
  MONTH: 3,
  DAY_OF_WEEK: 4,
  ADVANCED: 5
};

export const DEFAULT_CODE_CRON = {
  MINUTE: "*/1 * * * *",
  HOUR: "0 */1 * * *",
  DAY_OF_MONTH: "0 0 */1 * *",
  DAY_OF_WEEK: "0 0 * * 1",
  MONTH: "0 0 1 */1 *",
  ADVANCED: "* * * * *"
};
