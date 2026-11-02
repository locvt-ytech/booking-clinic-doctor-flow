import type { Appointment, AppointmentMode, DoctorSchedule } from "./types";

export const DAY_NAMES = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

export function formatVnd(amount: number) {
  return `${amount.toLocaleString("vi-VN")} đ`;
}

export function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function formatHm(date: Date) {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

export function formatDateRange(start: Date, end: Date, view: string) {
  const month = start.toLocaleDateString("en", { month: "long" });
  const year = end.toLocaleDateString("en", { year: "numeric" });
  if (view === "timeGridDay") {
    return `${month} ${start.getDate()}, ${year}`;
  }
  return `${month} ${start.getDate()} - ${end.getDate()}, ${year}`;
}

export function formatDateDMY(date: Date) {
  return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`;
}

export function formatDateDisplay(d: Date) {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return `${days[d.getDay()]}, ${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()}`;
}

export function formatSlotTime(slot: string) {
  const [hours, minutes] = slot.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return slot;
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${pad2(minutes)} ${period}`;
}

function minutesOf(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function computeSlots(
  schedule: DoctorSchedule,
  type: AppointmentMode,
  max = 5,
  nowMinutesOverride?: number,
) {
  const enabled = type === "online" ? schedule.onlineEnabled : schedule.offlineEnabled;
  if (!enabled) return [];

  const today = new Date();
  const dayName = DAY_NAMES[today.getDay()];
  const days = type === "online" ? schedule.onlineDays : schedule.offlineDays;
  const duration = type === "online" ? schedule.onlineSlotDuration : schedule.offlineSlotDuration;
  const daySchedule = days.find((d) => d.day === dayName);
  if (!daySchedule?.enabled || !daySchedule.shifts.length) return [];

  const nowMinutes =
    nowMinutesOverride ?? today.getHours() * 60 + today.getMinutes();

  const slots: string[] = [];
  for (const shift of daySchedule.shifts) {
    let cur = minutesOf(shift.startTime);
    const end = minutesOf(shift.endTime);
    while (cur + duration <= end && slots.length < max) {
      if (cur >= nowMinutes) {
        slots.push(`${pad2(Math.floor(cur / 60))}:${pad2(cur % 60)}`);
      }
      cur += duration;
    }
  }
  return slots;
}

export function getSlotsForDate(
  schedule: DoctorSchedule,
  type: AppointmentMode,
  date: Date,
) {
  const enabled = type === "online" ? schedule.onlineEnabled : schedule.offlineEnabled;
  if (!enabled) return [];

  const dayName = DAY_NAMES[date.getDay()];
  const days = type === "online" ? schedule.onlineDays : schedule.offlineDays;
  const duration = type === "online" ? schedule.onlineSlotDuration : schedule.offlineSlotDuration;
  const daySchedule = days.find((d) => d.day === dayName);
  if (!daySchedule?.enabled || !daySchedule.shifts.length) return [];

  const today = new Date();
  const isToday =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();
  const nowMinutes = today.getHours() * 60 + today.getMinutes();

  const slots: string[] = [];
  for (const shift of daySchedule.shifts) {
    let cur = minutesOf(shift.startTime);
    const end = minutesOf(shift.endTime);
    while (cur + duration <= end) {
      if (!isToday || cur >= nowMinutes) {
        slots.push(`${pad2(Math.floor(cur / 60))}:${pad2(cur % 60)}`);
      }
      cur += duration;
    }
  }
  return slots;
}

export function slotToRange(date: Date, slot: string, duration: number) {
  const [hh, mm] = slot.split(":").map(Number);
  const start = new Date(date);
  start.setHours(hh, mm, 0, 0);
  const end = new Date(start.getTime() + duration * 60 * 1000);
  return { start, end };
}

export function isSlotBooked(
  date: Date,
  slot: string,
  duration: number,
  appointments: Appointment[],
) {
  const { start, end } = slotToRange(date, slot, duration);
  return appointments.some((a) => {
    if (a.status === "cancelled") return false;
    const aStart = new Date(a.start).getTime();
    const aEnd = new Date(a.end).getTime();
    return start.getTime() < aEnd && end.getTime() > aStart;
  });
}

export function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
