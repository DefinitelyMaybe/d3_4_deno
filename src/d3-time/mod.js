/// <reference types="./mod.d.ts" />
/// <reference lib="dom" />
export { default as timeInterval } from "./interval.js";

export {
  default as timeMillisecond,
  default as utcMillisecond,
  milliseconds as timeMilliseconds,
  milliseconds as utcMilliseconds,
} from "./millisecond.js";

export {
  default as timeSecond,
  default as utcSecond,
  seconds as timeSeconds,
  seconds as utcSeconds,
} from "./second.js";

export { default as timeMinute, minutes as timeMinutes } from "./minute.js";

export { default as timeHour, hours as timeHours } from "./hour.js";

export { days as timeDays, default as timeDay } from "./day.js";

export {
  friday as timeFriday,
  fridays as timeFridays,
  monday as timeMonday,
  mondays as timeMondays,
  saturday as timeSaturday,
  saturdays as timeSaturdays,
  sunday as timeSunday,
  sunday as timeWeek,
  sundays as timeSundays,
  sundays as timeWeeks,
  thursday as timeThursday,
  thursdays as timeThursdays,
  tuesday as timeTuesday,
  tuesdays as timeTuesdays,
  wednesday as timeWednesday,
  wednesdays as timeWednesdays,
} from "./week.js";

export { default as timeMonth, months as timeMonths } from "./month.js";

export { default as timeYear, years as timeYears } from "./year.js";

export { default as utcMinute, utcMinutes as utcMinutes } from "./utcMinute.js";

export { default as utcHour, utcHours as utcHours } from "./utcHour.js";

export { default as utcDay, utcDays as utcDays } from "./utcDay.js";

export {
  utcFriday as utcFriday,
  utcFridays as utcFridays,
  utcMonday as utcMonday,
  utcMondays as utcMondays,
  utcSaturday as utcSaturday,
  utcSaturdays as utcSaturdays,
  utcSunday as utcSunday,
  utcSunday as utcWeek,
  utcSundays as utcSundays,
  utcSundays as utcWeeks,
  utcThursday as utcThursday,
  utcThursdays as utcThursdays,
  utcTuesday as utcTuesday,
  utcTuesdays as utcTuesdays,
  utcWednesday as utcWednesday,
  utcWednesdays as utcWednesdays,
} from "./utcWeek.js";

export { default as utcMonth, utcMonths as utcMonths } from "./utcMonth.js";

export { default as utcYear, utcYears as utcYears } from "./utcYear.js";
