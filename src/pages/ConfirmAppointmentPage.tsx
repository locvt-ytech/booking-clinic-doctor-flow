import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CalendarDaysIcon,
  FirstAidIcon,
  HospitalIcon,
  MapPinIcon,
  NotesIcon,
  PillIcon,
  SmileySadIcon,
} from "../components/Icons";
import { CURRENT_USER, FAMILY } from "../dummyData";
import { getDoctor, useStore } from "../store";
import type { AppointmentFormData, AppointmentMode, BookingSelectedSlot } from "../types";
import { formatDateDisplay, formatSlotTime, formatVnd, slotToRange } from "../utils";

type NavState = {
  doctorId: string;
  mode: AppointmentMode;
  selectedSlot: BookingSelectedSlot;
  formData: AppointmentFormData;
};

const iconVizClass =
  "flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-05 text-brand-5";

function DetailRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 items-start">
      <div className={iconVizClass}>{icon}</div>
      <div className="min-w-0 flex flex-1 flex-col gap-0.5">
        <p className="text-sm font-semibold leading-none text-dark-main">{label}</p>
        <div className="break-words text-sm font-medium text-notes mt-1">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmAppointmentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addAppointment, setBookingDraft, setToast, bookingDraft } = useStore();
  const state = (location.state as NavState | null) ?? (bookingDraft as NavState | null);
  const [payment, setPayment] = useState<"momo" | "vnpay">("vnpay");
  const [privacy, setPrivacy] = useState(false);
  const [auth, setAuth] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!state?.doctorId || !state.selectedSlot) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl bg-white p-8 text-sm text-neutral-400">
        No booking data found.
      </div>
    );
  }

  const doctor = getDoctor(state.doctorId);
  if (!doctor) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl bg-white p-8 text-sm text-neutral-400">
        Doctor not found.
      </div>
    );
  }

  const form = state.formData;
  const isSelf = form.whoNeedsVisit === "self";
  const dependent = !isSelf ? FAMILY.find((m) => m.id === form.whoNeedsVisit) : null;
  const fee = state.mode === "online" ? doctor.schedule.onlineCost : doctor.schedule.offlineCost;
  const duration =
    state.mode === "online" ? doctor.schedule.onlineSlotDuration : doctor.schedule.offlineSlotDuration;
  const date = new Date(state.selectedSlot.date);
  const canConfirm = privacy && auth && !loading;

  const modeLabel = state.mode === "online" ? "Online Appointment" : "At Clinic / Hospital Appointment";
  const dateTimeLabel = `${formatDateDisplay(date)}, ${formatSlotTime(state.selectedSlot.slot)}`;

  const confirm = () => {
    if (!canConfirm) {
      setError("Please accept Privacy Policy and data authorization.");
      return;
    }
    setLoading(true);
    const { start, end } = slotToRange(date, state.selectedSlot.slot, duration);
    addAppointment({
      id: `apt-${Date.now()}`,
      title: `Appointment with ${doctor.fullname}`,
      start: start.toISOString(),
      end: end.toISOString(),
      status: "pending",
      type: state.mode === "online" ? "online" : "clinic",
      reason: form.reason,
      details: form.details,
      symptomsOnset: form.symptomsOnset,
      symptomsSeverity: form.symptomsSeverity,
      medication: form.medication,
      doctorId: doctor.id,
      patientName: dependent ? dependent.fullname : CURRENT_USER.fullname,
      patientId: dependent ? dependent.publicId : CURRENT_USER.publicId,
      totalFee: fee,
    });
    setBookingDraft(null);
    setToast(`Payment completed successfully. Appointment added to Calendar.`);
    navigate("/", { replace: true });
  };

  return (
    <div className="h-full min-h-0 overflow-y-auto xl:overflow-hidden">
      <div className="grid min-h-0 grid-cols-1 items-start gap-4 pb-4 xl:h-full xl:grid-cols-[minmax(0,1fr)_338px] xl:overflow-hidden xl:pb-0">
        {/* Left main summary section */}
        <section className="flex min-h-0 min-w-0 flex-col rounded-2xl bg-white p-4 no-scrollbar sm:p-6 xl:overflow-y-auto">
          {/* Appointment banner */}
          <div className="mb-4 flex flex-col gap-3 rounded-[14px] border border-brand-11 bg-brand-05 p-4 sm:mb-6 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-[#2ad9ff] bg-brand-5">
                  <CalendarDaysIcon className="size-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium leading-normal text-dark-main">You're booking an</p>
                  <p className="text-sm font-semibold leading-snug text-dark-main">{modeLabel}</p>
                </div>
              </div>
              <div className="min-w-0 pl-14 sm:pl-0 sm:text-right">
                <p className="text-xs font-bold leading-normal text-dark-main">{duration} min</p>
                <p className="break-words text-sm font-semibold leading-snug text-red-secondary-600">
                  {dateTimeLabel}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {/* Patient */}
            <div>
              <p className="mb-2 px-2.5 text-sm font-semibold text-dark-main">Patient</p>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
                <div className="flex items-center gap-2.5">
                  <img
                    src={CURRENT_USER.avatar}
                    alt={CURRENT_USER.fullname}
                    className="size-9 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-medium text-dark-main">{CURRENT_USER.fullname}</p>
                    <p className="text-xs text-neutral-400">{CURRENT_USER.publicId} · Account holder</p>
                  </div>
                </div>

                {dependent && (
                  <div className="flex items-center gap-2.5 border-l border-neutral-100 pl-4">
                    <div className="flex size-9 items-center justify-center rounded-full bg-brand-05 text-sm font-bold text-brand-7">
                      {dependent.fullname.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-dark-main">{dependent.fullname}</p>
                        <span className="rounded-full bg-amber-50 border border-amber-300 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                          {dependent.relationship}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400">{dependent.publicId} · Dependent</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Doctor */}
            <div>
              <p className="mb-2 px-2.5 text-sm font-semibold text-dark-main">Doctor</p>
              <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <div className="flex min-w-0 flex-1 basis-full items-center gap-2 sm:min-w-[200px] sm:basis-auto">
                  <div className="size-9 shrink-0 overflow-hidden rounded-full">
                    {doctor.avatar ? (
                      <img src={doctor.avatar} alt={doctor.fullname} className="size-full object-cover" />
                    ) : (
                      <div className="flex size-full items-center justify-center bg-brand-05 text-xs font-bold text-brand-7">
                        {doctor.fullname.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium leading-normal text-dark-main">
                      {doctor.fullname}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {doctor.publicId} · {doctor.specialty}
                    </p>
                  </div>
                </div>

                <div className="flex min-w-0 flex-1 items-center gap-2 sm:min-w-[180px]">
                  <div className={iconVizClass}>
                    <HospitalIcon className="size-5 text-brand-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-neutral-400">Clinic / Hospital</p>
                    <p className="break-words text-sm font-medium text-dark-main">{doctor.clinicName}</p>
                  </div>
                </div>

                <div className="flex min-w-0 flex-1 items-center gap-2 sm:min-w-[180px]">
                  <div className={iconVizClass}>
                    <MapPinIcon className="size-5 text-brand-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-neutral-400">Province</p>
                    <p className="break-words text-sm font-medium text-dark-main">{doctor.province}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div>
              <p className="mb-4 px-2.5 text-sm font-semibold text-dark-main">Booking Details</p>
              <div className="flex flex-col gap-4">
                <DetailRow icon={<SmileySadIcon className="size-5 text-brand-5" />} label="Reason">
                  {form.reason || "—"}
                </DetailRow>
                <DetailRow icon={<NotesIcon className="size-5 text-brand-5" />} label="Details">
                  {form.details || "—"}
                </DetailRow>
                <DetailRow
                  icon={<CalendarDaysIcon className="size-5 text-brand-5" />}
                  label="Symptoms onset"
                >
                  {form.symptomsOnset || "—"}
                </DetailRow>
                <DetailRow
                  icon={<FirstAidIcon className="size-5 text-brand-5" />}
                  label="Symptoms severity"
                >
                  <span className="capitalize">{form.symptomsSeverity || "—"}</span>
                </DetailRow>
                {form.medication && (
                  <DetailRow
                    icon={<PillIcon className="size-5 text-brand-5" />}
                    label="Medications being used"
                  >
                    {form.medication}
                  </DetailRow>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Right aside: Payment and fee summary */}
        <aside className="flex w-full min-w-0 shrink-0 flex-col gap-3 xl:max-w-[338px]">
          {/* Summary Card */}
          <div className="rounded-[14px] border border-brand-11 bg-white p-5 shadow-theme-xs">
            <p className="text-xs font-semibold uppercase tracking-wider text-notes mb-3">
              Fee Summary
            </p>
            <div className="flex justify-between text-sm py-1.5">
              <span className="text-notes">Service fee</span>
              <span className="font-semibold text-dark-main">{formatVnd(fee)}</span>
            </div>
            <div className="flex justify-between text-sm py-1.5">
              <span className="text-notes">Discount</span>
              <span className="font-semibold text-dark-main">0 ₫</span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-brand-11 pt-4 text-sm font-semibold">
              <span className="text-dark-main">Total cost</span>
              <span className="text-lg font-bold text-brand-7">{formatVnd(fee)}</span>
            </div>
          </div>

          {/* Payment Method Card */}
          <div className="rounded-[14px] border border-brand-11 bg-white p-5 shadow-theme-xs flex flex-col gap-4">
            <p className="text-sm font-medium text-dark-main">Payment method</p>
            <div className="flex flex-col gap-2">
              {(
                [
                  { id: "vnpay", label: "VNPAY", desc: "Cards / QR Pay" },
                  { id: "momo", label: "MOMO", desc: "MoMo E-Wallet" },
                ] as const
              ).map((m) => (
                <label
                  key={m.id}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-colors ${
                    payment === m.id
                      ? "border-brand-7 bg-brand-05"
                      : "border-gray-200 hover:border-brand-1"
                  }`}
                >
                  <div>
                    <span className="text-sm font-bold text-dark-main uppercase tracking-wide">
                      {m.label}
                    </span>
                    <p className="text-xs text-neutral-400">{m.desc}</p>
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={m.id}
                    checked={payment === m.id}
                    onChange={() => setPayment(m.id)}
                    className="size-4.5 accent-brand-7 cursor-pointer"
                  />
                </label>
              ))}
            </div>

            <div className="flex flex-col gap-2.5 pt-1">
              <label className="flex items-start gap-2.5 text-xs text-dark-main cursor-pointer leading-relaxed">
                <input
                  type="checkbox"
                  checked={privacy}
                  onChange={(e) => setPrivacy(e.target.checked)}
                  className="mt-0.5 size-4 accent-brand-7 rounded shrink-0 cursor-pointer"
                />
                <span>
                  I confirm the{" "}
                  <span className="font-semibold text-brand-7 underline">Privacy Policy</span> and{" "}
                  <span className="font-semibold text-brand-7 underline">Terms of Use</span>
                </span>
              </label>

              <label className="flex items-start gap-2.5 text-xs text-dark-main cursor-pointer leading-relaxed">
                <input
                  type="checkbox"
                  checked={auth}
                  onChange={(e) => setAuth(e.target.checked)}
                  className="mt-0.5 size-4 accent-brand-7 rounded shrink-0 cursor-pointer"
                />
                <span>
                  I authorize YSalus to collect and disclose my personal data to the selected
                  doctor/clinic in accordance with healthcare regulations.
                </span>
              </label>
            </div>

            {error && <p className="text-xs text-red-secondary-600 font-medium">{error}</p>}

            <button
              type="button"
              disabled={!canConfirm}
              onClick={confirm}
              className={`h-11 w-full rounded-full text-sm font-semibold text-white shadow-theme-xs transition-colors cursor-pointer ${
                canConfirm ? "bg-brand-7 hover:bg-brand-6" : "cursor-not-allowed bg-brand-7/40"
              }`}
            >
              {loading ? "Processing..." : "Confirm And Pay"}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
