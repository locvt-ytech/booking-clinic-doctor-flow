import { useMemo, useState } from "react";
import type { Appointment, AppointmentMode, DoctorSchedule } from "../types";
import { getSlotsForDate, isSlotBooked } from "../utils";
import { ChevronLeftIcon, ChevronRightIcon } from "./Icons";

type Props = {
  value: Date | null;
  timeValue: string;
  schedule: DoctorSchedule;
  mode: AppointmentMode;
  bookedAppointments: Appointment[];
  onChange: (date: Date, time: string) => void;
  onClose?: () => void;
};

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const panelClass =
  "absolute left-0 top-full z-50 mt-1 flex w-full min-w-[340px] max-w-[420px] flex-col gap-3 overflow-hidden rounded-xl border border-[#ededed] bg-[#fafafa] p-4 shadow-[3px_2px_9px_rgba(0,0,0,0.1),14px_8px_16px_rgba(0,0,0,0.09),31px_19px_22px_rgba(0,0,0,0.05)] sm:min-w-[400px]";

function buildCalendarGrid(year: number, month: number): Date[] {
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = (firstOfMonth.getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return date;
  });
}

export function ScheduleTimePicker({
  value,
  timeValue,
  schedule,
  mode,
  bookedAppointments,
  onChange,
}: Props) {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const maxDate = new Date(todayStart);
  maxDate.setDate(maxDate.getDate() + 13);
  maxDate.setHours(23, 59, 59, 999);

  const [month, setMonth] = useState(value ? value.getMonth() : today.getMonth());
  const [year, setYear] = useState(value ? value.getFullYear() : today.getFullYear());
  const [selDate, setSelDate] = useState<Date | null>(
    value && value >= todayStart && value <= maxDate ? value : null,
  );
  const [selTime, setSelTime] = useState(timeValue);

  const calendarCells = useMemo(() => buildCalendarGrid(year, month), [year, month]);
  const calendarRows = useMemo(() => {
    const rows: Date[][] = [];
    for (let i = 0; i < calendarCells.length; i += 7) {
      rows.push(calendarCells.slice(i, i + 7));
    }
    return rows;
  }, [calendarCells]);

  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("en", { month: "long" }).format(
        new Date(year, month, 1)
      ),
    [month, year]
  );

  const slots = selDate ? getSlotsForDate(schedule, mode, selDate) : [];
  const duration = mode === "online" ? schedule.onlineSlotDuration : schedule.offlineSlotDuration;

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const isDateDisabled = (date: Date) => {
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return dayStart < todayStart || dayStart > maxDate;
  };

  return (
    <div className={panelClass} onMouseDown={(e) => e.stopPropagation()}>
      <div>
        <p className="text-sm font-semibold leading-none text-dark-main">Schedule Time</p>
      </div>

      <div className="flex max-h-[320px] gap-3">
        {/* Left Column: Date */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="mb-1 flex h-8 shrink-0 items-center">
            <p className="text-xs font-semibold leading-none text-dark-main">Select Date</p>
          </div>

          <div className="flex min-h-0 flex-1 flex-col rounded-lg p-1.5">
            <div className="mb-1 flex items-center justify-between px-1">
              <button
                type="button"
                onClick={prevMonth}
                className="flex size-7 shrink-0 items-center justify-center text-dark-main hover:bg-black/5 rounded-full cursor-pointer"
                aria-label="Previous Month"
              >
                <ChevronLeftIcon className="size-5" />
              </button>
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold capitalize leading-none text-dark-main">
                  {monthLabel}
                </span>
                <span className="text-sm font-semibold leading-none text-dark-main">
                  {year}
                </span>
              </div>
              <button
                type="button"
                onClick={nextMonth}
                className="flex size-7 shrink-0 items-center justify-center text-dark-main hover:bg-black/5 rounded-full cursor-pointer"
                aria-label="Next Month"
              >
                <ChevronRightIcon className="size-5" />
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-0.5">
              <div className="grid grid-cols-7 gap-1">
                {WEEKDAY_LABELS.map((dayLabel) => (
                  <span
                    key={dayLabel}
                    className="flex h-7 items-center justify-center text-xs font-medium text-dark-main"
                  >
                    {dayLabel}
                  </span>
                ))}
              </div>

              {calendarRows.map((row, rowIndex) => (
                <div key={rowIndex} className="grid grid-cols-7 gap-1">
                  {row.map((date) => {
                    const inCurrentMonth = date.getMonth() === month;
                    const disabled = isDateDisabled(date);
                    const isSelected = selDate?.toDateString() === date.toDateString();
                    const muted = !inCurrentMonth || disabled;

                    return (
                      <button
                        key={date.toISOString()}
                        type="button"
                        disabled={disabled}
                        onClick={() => {
                          if (!disabled) {
                            setSelDate(date);
                            setSelTime("");
                          }
                        }}
                        className={`mx-auto flex size-8 items-center justify-center rounded-md text-xs font-medium transition-colors ${
                          isSelected
                            ? "bg-primary-500 text-white"
                            : muted
                              ? "cursor-default text-neutral-100"
                              : "cursor-pointer text-dark-main hover:bg-white/80"
                        }`}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Time Slots */}
        <div className="flex w-[108px] shrink-0 flex-col overflow-hidden border-l border-[#ededed] pl-3">
          <div className="mb-1 flex h-8 shrink-0 items-center">
            <p className="text-xs font-semibold leading-none text-dark-main">Select Time</p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar">
            {slots.length === 0 ? (
              <p className="pt-2 text-center text-xs font-medium leading-snug text-neutral-100">
                {selDate ? "No slots" : "Pick a date"}
              </p>
            ) : (
              slots.map((slot) => {
                const disabled = selDate ? isSlotBooked(selDate, slot, duration, bookedAppointments) : false;
                const isSelected = selTime === slot;

                return (
                  <button
                    key={slot}
                    type="button"
                    disabled={disabled}
                    onClick={
                      disabled
                        ? undefined
                        : () => {
                            setSelTime(slot);
                            onChange(selDate!, slot);
                          }
                    }
                    title={disabled ? "This slot is already booked" : undefined}
                    className={`flex h-9 w-full items-center justify-center border-b border-[#ededed] text-sm font-medium transition-colors ${
                      disabled
                        ? "cursor-not-allowed text-neutral-100"
                        : isSelected
                          ? "text-brand-7 font-bold"
                          : "text-dark-main hover:bg-white/70 cursor-pointer"
                    }`}
                  >
                    {slot}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
