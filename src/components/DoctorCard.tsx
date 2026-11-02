import type { Appointment, AppointmentMode, BookingSelectedSlot, Doctor } from "../types";
import { computeSlots, DAY_NAMES, formatVnd, isSlotBooked } from "../utils";
import { Button } from "./Button";
import { ChevronRightIcon, InfoIcon } from "./Icons";

type Props = {
  doctor: Doctor;
  mode: AppointmentMode;
  selectedSlot: BookingSelectedSlot | null;
  bookedAppointments: Appointment[];
  onViewProfile: (doctor: Doctor) => void;
  onSelectSlot: (doctor: Doctor, slot: BookingSelectedSlot) => void;
  onBook: (doctor: Doctor, slot: BookingSelectedSlot | null) => void;
  onSeeAll: (doctor: Doctor) => void;
};

const DotSeparator = () => (
  <span className="size-[3px] shrink-0 rounded-full bg-neutral-400" aria-hidden />
);

export function DoctorCard({
  doctor,
  mode,
  selectedSlot,
  bookedAppointments,
  onViewProfile,
  onSelectSlot,
  onBook,
  onSeeAll,
}: Props) {
  const cost = mode === "online" ? doctor.schedule.onlineCost : doctor.schedule.offlineCost;
  const duration =
    mode === "online" ? doctor.schedule.onlineSlotDuration : doctor.schedule.offlineSlotDuration;
  const slots = computeSlots(doctor.schedule, mode, 3);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const costLabel = `${formatVnd(cost)} / visit`;

  return (
    <div className="flex min-w-0 flex-col gap-4 overflow-hidden rounded-2xl border border-brand-11 bg-white p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <button
            type="button"
            className="size-11 shrink-0 cursor-pointer overflow-hidden rounded-lg"
            onClick={() => onViewProfile(doctor)}
          >
            {doctor.avatar ? (
              <img src={doctor.avatar} alt={doctor.fullname} className="size-full object-cover" />
            ) : (
              <div className="flex size-full items-center justify-center bg-brand-05 text-sm font-semibold text-brand-7">
                {doctor.fullname.charAt(0)}
              </div>
            )}
          </button>
          <button
            type="button"
            className="min-w-0 flex-1 cursor-pointer text-left"
            onClick={() => onViewProfile(doctor)}
          >
            <p className="text-sm font-semibold text-dark-main">{doctor.fullname}</p>
            <div className="mt-0.5 flex flex-wrap items-center gap-1">
              {doctor.publicId ? (
                <>
                  <span className="text-xs font-medium text-neutral-400">{doctor.publicId}</span>
                  {doctor.specialty ? <DotSeparator /> : null}
                </>
              ) : null}
              {doctor.specialty ? (
                <span className="text-xs font-medium text-neutral-400">{doctor.specialty}</span>
              ) : null}
            </div>
            {(doctor.clinicName || doctor.province) && (
              <div className="mt-0.5 flex flex-wrap items-center gap-1">
                {doctor.clinicName ? (
                  <span className="text-xs font-medium text-neutral-400">{doctor.clinicName}</span>
                ) : null}
                {doctor.clinicName && doctor.province ? <DotSeparator /> : null}
                {doctor.province ? (
                  <span className="text-xs font-medium text-neutral-400">{doctor.province}</span>
                ) : null}
              </div>
            )}
          </button>
        </div>
        <div className="flex w-full shrink-0 items-center gap-2 sm:w-auto">
          <Button
            onClick={() => onBook(doctor, selectedSlot)}
            className="h-11 w-full px-[18px] text-sm sm:w-auto"
          >
            Book Appointment
          </Button>
        </div>
      </div>

      <div className="h-px w-full bg-brand-11" />

      <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex shrink-0 items-center">
          <span className="text-sm font-semibold text-dark-main">{costLabel}</span>
          <InfoIcon className="ml-1 size-6 text-neutral-400" />
        </div>

        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-start gap-2 sm:max-w-[600px] sm:justify-end">
          {slots.length > 0 ? (
            slots.map((s, i) => {
              const disabled = isSlotBooked(today, s, duration, bookedAppointments);
              const isSelected = selectedSlot?.slot === s;

              return (
                <button
                  key={i}
                  type="button"
                  disabled={disabled}
                  onClick={
                    disabled
                      ? undefined
                      : () =>
                          onSelectSlot(doctor, {
                            day: DAY_NAMES[new Date().getDay()],
                            slot: s,
                            date: today.toISOString(),
                          })
                  }
                  title={disabled ? "This slot is already booked" : undefined}
                  className={`h-8 shrink-0 rounded-full border-[1.5px] px-5 text-sm font-medium leading-normal transition-colors cursor-pointer ${
                    disabled
                      ? "cursor-not-allowed border-neutral-75 bg-neutral-50 text-neutral-100"
                      : isSelected
                        ? "border-brand-7 bg-brand-05 text-brand-7"
                        : "border-neutral-75 bg-white text-dark-main hover:border-brand-1"
                  }`}
                >
                  {s}
                </button>
              );
            })
          ) : (
            <span className="text-xs text-neutral-400">No slots today</span>
          )}
          <button
            type="button"
            onClick={() => onSeeAll(doctor)}
            className="flex shrink-0 cursor-pointer items-center gap-1 whitespace-nowrap pl-1 text-sm font-semibold capitalize text-dark-main hover:text-brand-7"
          >
            See All
            <ChevronRightIcon className="size-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
