import { useState } from "react";
import type { Appointment, AppointmentMode, Doctor } from "../types";
import { formatVnd, getSlotsForDate, isSlotBooked, DAY_NAMES } from "../utils";
import { Button } from "./Button";
import { CloseIcon } from "./Icons";

type Props = {
  doctor: Doctor;
  mode: AppointmentMode;
  bookedAppointments: Appointment[];
  onClose: () => void;
  onPick: (date: Date, slot: string) => void;
};

export function SlotsModal({ doctor, mode, bookedAppointments, onClose, onPick }: Props) {
  const [selectedSlot, setSelectedSlot] = useState<{ day: string; slot: string; date: Date } | null>(
    null
  );

  const duration =
    mode === "online" ? doctor.schedule.onlineSlotDuration : doctor.schedule.offlineSlotDuration;

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const visibleSlots = Array.from({ length: 14 }, (_, dayIndex) => {
    const dayDate = new Date(now);
    dayDate.setDate(now.getDate() + dayIndex);
    const slots = getSlotsForDate(doctor.schedule, mode, dayDate);

    return {
      day: DAY_NAMES[dayDate.getDay()],
      date: dayDate,
      slots,
    };
  });

  const handleBook = () => {
    if (selectedSlot) {
      onPick(selectedSlot.date, selectedSlot.slot);
    } else {
      // Pick first available slot or today
      const firstDayWithSlots = visibleSlots.find((d) => d.slots.length > 0);
      if (firstDayWithSlots) {
        onPick(firstDayWithSlots.date, firstDayWithSlots.slots[0]);
      } else {
        onPick(now, "08:00");
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-16 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[85vh] w-[900px] max-w-[95vw] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-20 p-2 rounded-full hover:bg-gray-100 cursor-pointer text-gray-500"
        >
          <CloseIcon className="size-5" />
        </button>

        {/* Doctor Summary Header Card */}
        <div className="relative px-6 pt-12 pb-0 shrink-0">
          <div className="rounded-2xl border border-sky-200 bg-[#f7fbff] shadow-[0_1px_0_rgba(255,255,255,0.8)_inset] overflow-hidden p-5">
            <div className="flex items-start gap-4">
              <div className="size-12 shrink-0 overflow-hidden rounded-full">
                {doctor.avatar ? (
                  <img src={doctor.avatar} alt={doctor.fullname} className="size-full object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center bg-brand-05 text-base font-semibold text-brand-7">
                    {doctor.fullname.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-base leading-snug">
                  {doctor.fullname}
                </p>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500 flex-wrap">
                  <span>{doctor.publicId}</span>
                  {doctor.specialty && (
                    <>
                      <span className="text-gray-300">·</span>
                      <span>{doctor.specialty}</span>
                    </>
                  )}
                </div>
                {(doctor.clinicName || doctor.province) && (
                  <p className="text-xs text-gray-500 mt-1">
                    {[doctor.clinicName, doctor.province].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 mt-5">
              {[
                { value: `${doctor.experienceYears} yrs`, label: "Experience" },
                { value: `${doctor.consultations} visits`, label: "Consultations" },
                { value: formatVnd(doctor.schedule.offlineCost), label: "Offline Cost" },
                { value: formatVnd(doctor.schedule.onlineCost), label: "Online Cost" },
              ].map((stat, i) => (
                <div
                  key={i}
                  className={`relative py-3 text-center ${
                    i > 0
                      ? "before:absolute before:left-0 before:top-1/2 before:h-6 before:-translate-y-1/2 before:border-l before:border-sky-200"
                      : ""
                  }`}
                >
                  <div className="text-[15px] font-bold text-gray-900 leading-tight">
                    {stat.value}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Slots Body */}
        <div className="px-6 py-4 overflow-y-auto max-h-[55vh] flex-1">
          <div className="flex flex-col gap-4">
            {visibleSlots.map((dayObj, dayIndex) => {
              const isToday = dayIndex === 0;
              const dayDate = dayObj.date;
              const dateLabel = `${String(dayDate.getDate()).padStart(2, "0")}/${String(
                dayDate.getMonth() + 1
              ).padStart(2, "0")}`;

              return (
                <div key={`${dayObj.day}-${dateLabel}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-semibold text-gray-700">
                      {dayObj.day}
                      {isToday ? " · Today" : ""}
                      {" · "}
                      {dateLabel}
                    </div>
                    <div className="text-xs text-gray-500">
                      {dayObj.slots.length > 0
                        ? `${dayObj.slots.length} slots`
                        : isToday
                        ? "No slots today"
                        : "No slots"}
                    </div>
                  </div>

                  {dayObj.slots.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {dayObj.slots.map((s, i) => {
                        const isSelected =
                          selectedSlot?.date.toDateString() === dayDate.toDateString() &&
                          selectedSlot?.slot === s;
                        const disabled = isSlotBooked(dayDate, s, duration, bookedAppointments);

                        return (
                          <button
                            key={i}
                            type="button"
                            disabled={disabled}
                            onClick={
                              disabled
                                ? undefined
                                : () => {
                                    setSelectedSlot({
                                      day: dayObj.day,
                                      slot: s,
                                      date: new Date(dayDate),
                                    });
                                  }
                            }
                            title={disabled ? "This slot is already booked" : undefined}
                            className={`text-sm rounded-full py-1.5 px-4 transition-colors font-medium ${
                              disabled
                                ? "bg-gray-100 border border-gray-200 text-gray-300 cursor-not-allowed"
                                : isSelected
                                ? "bg-brand-7 text-white border border-teal-600"
                                : "bg-white border border-gray-200 text-gray-700 hover:bg-teal-50 cursor-pointer"
                            }`}
                          >
                            {s}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400">—</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 bg-white z-50 flex items-center justify-center px-6 py-4 border-t border-gray-100 shrink-0">
          <Button
            size="sm"
            onClick={handleBook}
            className="bg-brand-7 !text-white px-8"
          >
            Book Appointment
          </Button>
        </div>
      </div>
    </div>
  );
}
