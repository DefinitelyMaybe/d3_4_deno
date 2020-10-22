/// <reference lib="dom" />
import { calendar } from "./time.js";
import { utcFormat } from "../d3-time-format/mod.js";
import {
  utcDay,
  utcHour,
  utcMillisecond,
  utcMinute,
  utcMonth,
  utcSecond,
  utcWeek,
  utcYear,
} from "../d3-time/mod.js";
import { initRange } from "./init.js";

export default function utcTime() {
  return initRange.apply(
    calendar(
      utcYear,
      utcMonth,
      utcWeek,
      utcDay,
      utcHour,
      utcMinute,
      utcSecond,
      utcMillisecond,
      utcFormat,
    ).domain([Date.UTC(2000, 0, 1), Date.UTC(2000, 0, 2)]),
    arguments,
  );
}
