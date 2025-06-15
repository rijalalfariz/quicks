import React from "react";

type DateTextProps = {
  value: Date | string;
  locale?: string;
  mode?: 1 | 2 | 3; // 1: date, 2: time, 3: date and time
  className?: string;
};

const defaultDateOptions: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC"
};
const defaultTimeOptions: Intl.DateTimeFormatOptions = {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "UTC"
};

export const DateTextRaw = ({
  value,
  locale = "en-US",
  mode = 3,
}: DateTextProps) => {
  const dateObj = typeof value === "string" ? new Date(value) : value;
  const datePart = new Intl.DateTimeFormat(locale, defaultDateOptions).format(dateObj);
  const timePart = new Intl.DateTimeFormat(locale, defaultTimeOptions).format(dateObj);

  return `${mode !== 2 ? datePart : ""}${mode === 3 ? " " : ""}${mode !== 1 ? timePart : ""}`;
};

export const getDateDifference = ({
  from,
  to: _to = new Date().toString(),
  in: _in = "auto",
  suffix: _suffix = ""
}: {
  from: Date | string;
  to?: Date | string;
  in?: "day" | "hour" | "minute" | "auto";
  suffix?: string;
}): { result: number; suffix: string; } => {
  let msPerIn = 1000 * 60;
  if (_in == "hour") {
    msPerIn *= 60;
  }
  if (_in == "day") {
    msPerIn *= (24 * 60)
  }
  const fromDate = typeof from === "string" ? new Date(from) : from;
  const toDate = typeof _to === "string" ? new Date(_to) : _to;

  let result = Math.floor((fromDate.getTime() - toDate.getTime()) / msPerIn);

  if (_in == "auto") {
    let absResult = Math.abs(result);
    if (absResult > (24 * 60)) {
      let tempSuffix = absResult > (2 * 24 * 60) ? "Days" : "Day";
      return getDateDifference({ from, to: _to, in: "day", suffix: tempSuffix })
    }
    if (absResult > 60) {
      let tempSuffix = absResult > (2 * 60) ? "Hours" : "Hour";
      return getDateDifference({ from, to: _to, in: "hour", suffix: tempSuffix })
    }
    let tempSuffix = absResult > (2 * 60) ? "Minutes" : "Minute";
    return { result, suffix: tempSuffix }
  }
  return { result, suffix: _suffix };
}

const DateText: React.FC<DateTextProps> = ({
  value,
  locale = "en-US",
  mode = 3,
  className = "",
}) => {

  return <span className={className}>{DateTextRaw({ value, locale, mode })}</span>;
};

export default DateText;