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

const DateText: React.FC<DateTextProps> = ({
  value,
  locale = "en-US",
  mode = 3,
  className = "",
}) => {

  return <span className={className}>{DateTextRaw({value, locale, mode})}</span>;
};

export default DateText;