import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/Button";
import { DoctorInfoView } from "../components/DoctorInfoView";
import { ScheduleTimePicker } from "../components/ScheduleTimePicker";
import { CalendarIcon, ChevronDownIcon, TimeIcon } from "../components/Icons";
import { CURRENT_USER, FAMILY } from "../dummyData";
import { getDoctor, useStore } from "../store";
import type { AppointmentFormData, AppointmentMode, BookingSelectedSlot } from "../types";
import { DAY_NAMES, formatDateDMY } from "../utils";

const bookingFieldLabelClass = "text-sm font-semibold text-dark-main";
const bookingFieldRequiredClass = "text-xs font-bold text-red-secondary-600";

const bookingFieldInputClass = (hasError = false) =>
  `h-11 w-full rounded-[10px] border bg-white px-4 text-sm font-medium text-dark-main placeholder:text-neutral-400 focus:outline-none transition-colors ${
    hasError ? "border-red-secondary-600" : "border-brand-11 focus:border-brand-7"
  }`;

const bookingDropdownTriggerClass = (hasError = false, isOpen = false) =>
  `flex h-11 w-full items-center justify-between gap-2 rounded-[10px] border bg-white pl-4 pr-3 text-left text-sm font-medium focus:outline-none cursor-pointer transition-colors ${
    hasError
      ? "border-red-secondary-600"
      : isOpen
        ? "border-brand-7"
        : "border-brand-11"
  }`;

const bookingDropdownPanelClass =
  "absolute left-0 top-full z-30 mt-1 w-full overflow-hidden rounded-[10px] border border-brand-11 bg-white shadow-theme-sm";

const bookingDropdownOptionClass = (isSelected = false) =>
  `flex w-full items-center justify-between px-4 py-2.5 text-left text-sm font-medium transition-colors hover:bg-brand-05 cursor-pointer ${
    isSelected ? "bg-brand-05 text-brand-7" : "text-dark-main"
  }`;

const SEVERITY_OPTIONS = ["Mild", "Moderate", "Severe"];

export function SetAppointmentPage() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { appointments, bookingDraft, setBookingDraft } = useStore();
  const state = location.state as {
    doctorId?: string;
    mode?: AppointmentMode;
    selectedSlot?: BookingSelectedSlot | null;
  } | null;

  const doctor = getDoctor(doctorId ?? state?.doctorId ?? bookingDraft?.doctorId ?? "");
  const [mode, setMode] = useState<AppointmentMode>(
    state?.mode ?? bookingDraft?.mode ?? "offline"
  );
  const initialSlot = state?.selectedSlot ?? bookingDraft?.selectedSlot ?? null;

  const [form, setForm] = useState<AppointmentFormData>({
    whoNeedsVisit: bookingDraft?.formData?.whoNeedsVisit ?? "self",
    selectedDate: initialSlot?.date ?? bookingDraft?.formData?.selectedDate ?? null,
    selectedTime: initialSlot?.slot ?? bookingDraft?.formData?.selectedTime ?? "",
    reason: bookingDraft?.formData?.reason ?? "",
    details: bookingDraft?.formData?.details ?? "",
    symptomsOnset: bookingDraft?.formData?.symptomsOnset ?? "",
    symptomsSeverity: bookingDraft?.formData?.symptomsSeverity ?? "",
    medication: bookingDraft?.formData?.medication ?? "",
  });

  const [whoOpen, setWhoOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [severityOpen, setSeverityOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const pickerRef = useRef<HTMLDivElement>(null);
  const severityRef = useRef<HTMLDivElement>(null);
  const whoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
      if (severityRef.current && !severityRef.current.contains(e.target as Node)) {
        setSeverityOpen(false);
      }
      if (whoRef.current && !whoRef.current.contains(e.target as Node)) {
        setWhoOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  if (!doctor) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl bg-white p-8 text-sm text-neutral-400">
        No booking data found. Please start from specialists list.
      </div>
    );
  }

  const selectedPerson =
    form.whoNeedsVisit === "self"
      ? {
          fullname: CURRENT_USER.fullname,
          publicId: CURRENT_USER.publicId,
          avatar: CURRENT_USER.avatar,
          relationship: "None",
        }
      : FAMILY.find((m) => m.id === form.whoNeedsVisit) ?? {
          fullname: CURRENT_USER.fullname,
          publicId: CURRENT_USER.publicId,
          avatar: CURRENT_USER.avatar,
          relationship: "None",
        };

  const goNext = () => {
    const e: Record<string, string> = {};
    if (!form.selectedDate) e.date = "Please select a date";
    if (!form.selectedTime) e.time = "Please select a time slot";
    if (!form.reason.trim()) e.reason = "Please enter reason for appointment";
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    const date = new Date(form.selectedDate as string);
    const selectedSlot: BookingSelectedSlot = {
      day: DAY_NAMES[date.getDay()],
      date: date.toISOString(),
      slot: form.selectedTime,
    };
    setBookingDraft({ doctorId: doctor.id, mode, selectedSlot, formData: form });
    navigate("/booking/confirm-appointment", {
      state: { doctorId: doctor.id, mode, selectedSlot, formData: form },
    });
  };

  return (
    <div className="h-full min-h-0 overflow-hidden">
      <div className="grid h-full min-h-0 grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_300px]">
        {/* Left Form Section */}
        <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl bg-white p-5">
          {/* Mode Tabs */}
          <div className="mb-4 flex h-10 gap-5 border-b border-brand-11 shrink-0">
            {(
              [
                { value: "online", label: "Online" },
                { value: "offline", label: "At Clinic / Hospital" },
              ] as const
            ).map((tab) => {
              const isActive = mode === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  className={`flex h-10 flex-col items-center justify-between pt-2 text-sm font-semibold cursor-pointer ${
                    isActive ? "text-brand-7" : "text-dark-main hover:text-brand-7"
                  }`}
                  onClick={() => setMode(tab.value)}
                >
                  {tab.label}
                  <span
                    className={`h-0.5 w-full rounded-full transition-all ${
                      isActive ? "bg-brand-7" : "bg-transparent"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Scrollable Form Fields */}
          <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar pr-1">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 pb-4">
              {/* Who needs visit dropdown */}
              <div className="relative lg:col-span-2" ref={whoRef}>
                <label className={`${bookingFieldLabelClass} mb-1.5 block`}>
                  Who needs a visit? <span className={bookingFieldRequiredClass}>*</span>
                </label>
                <button
                  type="button"
                  className={bookingDropdownTriggerClass(false, whoOpen)}
                  onClick={() => setWhoOpen((v) => !v)}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-semibold text-dark-main">{selectedPerson.fullname}</span>
                    <span className="text-xs text-neutral-400">· {selectedPerson.publicId}</span>
                    {selectedPerson.relationship !== "None" && (
                      <span className="rounded-full bg-amber-50 border border-amber-300 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                        {selectedPerson.relationship}
                      </span>
                    )}
                  </div>
                  <ChevronDownIcon
                    className={`size-5 text-dark-main transition-transform ${
                      whoOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {whoOpen && (
                  <div className={bookingDropdownPanelClass}>
                    <button
                      type="button"
                      className={bookingDropdownOptionClass(form.whoNeedsVisit === "self")}
                      onClick={() => {
                        setForm((f) => ({ ...f, whoNeedsVisit: "self" }));
                        setWhoOpen(false);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={CURRENT_USER.avatar}
                          alt=""
                          className="size-7 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-xs font-semibold text-dark-main">
                            {CURRENT_USER.fullname} (Myself)
                          </p>
                          <p className="text-[11px] text-neutral-400">{CURRENT_USER.publicId}</p>
                        </div>
                      </div>
                    </button>
                    {FAMILY.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        className={bookingDropdownOptionClass(form.whoNeedsVisit === m.id)}
                        onClick={() => {
                          setForm((f) => ({ ...f, whoNeedsVisit: m.id }));
                          setWhoOpen(false);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex size-7 items-center justify-center rounded-full bg-brand-05 text-xs font-bold text-brand-7">
                            {m.fullname.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-dark-main">
                              {m.fullname} · <span className="font-normal text-notes">{m.relationship}</span>
                            </p>
                            <p className="text-[11px] text-neutral-400">{m.publicId}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Date & Time Picker */}
              <div className="relative lg:col-span-2" ref={pickerRef}>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className={`${bookingFieldLabelClass} mb-1.5 block`}>
                      Date <span className={bookingFieldRequiredClass}>*</span>
                    </label>
                    <button
                      type="button"
                      className={bookingDropdownTriggerClass(Boolean(errors.date), pickerOpen)}
                      onClick={() => setPickerOpen(true)}
                    >
                      <span className={form.selectedDate ? "text-dark-main" : "text-neutral-400"}>
                        {form.selectedDate
                          ? formatDateDMY(new Date(form.selectedDate))
                          : "DD/MM/YYYY"}
                      </span>
                      <CalendarIcon className="size-5 text-dark-main shrink-0" />
                    </button>
                    {errors.date && (
                      <p className="mt-1 text-xs text-red-secondary-600">{errors.date}</p>
                    )}
                  </div>

                  <div>
                    <label className={`${bookingFieldLabelClass} mb-1.5 block`}>
                      Time <span className={bookingFieldRequiredClass}>*</span>
                    </label>
                    <button
                      type="button"
                      className={bookingDropdownTriggerClass(Boolean(errors.time), pickerOpen)}
                      onClick={() => setPickerOpen(true)}
                    >
                      <span className={form.selectedTime ? "text-dark-main" : "text-neutral-400"}>
                        {form.selectedTime || "00:00"}
                      </span>
                      <TimeIcon className="size-5 text-dark-main shrink-0" />
                    </button>
                    {errors.time && (
                      <p className="mt-1 text-xs text-red-secondary-600">{errors.time}</p>
                    )}
                  </div>
                </div>

                {pickerOpen && (
                  <ScheduleTimePicker
                    value={form.selectedDate ? new Date(form.selectedDate) : null}
                    timeValue={form.selectedTime}
                    schedule={doctor.schedule}
                    mode={mode}
                    bookedAppointments={appointments.filter((a) => a.doctorId === doctor.id)}
                    onChange={(date, time) => {
                      setForm((f) => ({
                        ...f,
                        selectedDate: date.toISOString(),
                        selectedTime: time,
                      }));
                      setErrors((errs) => ({ ...errs, date: "", time: "" }));
                      if (time) setPickerOpen(false);
                    }}
                    onClose={() => setPickerOpen(false)}
                  />
                )}
              </div>

              {/* Reason */}
              <div>
                <label className={`${bookingFieldLabelClass} mb-1.5 block`}>
                  What is the reason for the appointment? <span className={bookingFieldRequiredClass}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Regular heart checkup, chest discomfort"
                  className={bookingFieldInputClass(Boolean(errors.reason))}
                  value={form.reason}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, reason: e.target.value }));
                    if (e.target.value.trim()) setErrors((errs) => ({ ...errs, reason: "" }));
                  }}
                />
                {errors.reason && (
                  <p className="mt-1 text-xs text-red-secondary-600">{errors.reason}</p>
                )}
              </div>

              {/* Details */}
              <div>
                <label className={`${bookingFieldLabelClass} mb-1.5 block`}>
                  Describe details
                </label>
                <input
                  type="text"
                  placeholder="More details on health condition"
                  className={bookingFieldInputClass(false)}
                  value={form.details}
                  onChange={(e) => setForm((f) => ({ ...f, details: e.target.value }))}
                />
              </div>

              {/* Symptoms onset */}
              <div>
                <label className={`${bookingFieldLabelClass} mb-1.5 block`}>
                  When did you start feeling the symptoms?
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2 days ago, about a week"
                  className={bookingFieldInputClass(false)}
                  value={form.symptomsOnset}
                  onChange={(e) => setForm((f) => ({ ...f, symptomsOnset: e.target.value }))}
                />
              </div>

              {/* Severity dropdown */}
              <div className="relative" ref={severityRef}>
                <label className={`${bookingFieldLabelClass} mb-1.5 block`}>
                  How severe are the symptoms?
                </label>
                <button
                  type="button"
                  className={bookingDropdownTriggerClass(false, severityOpen)}
                  onClick={() => setSeverityOpen((v) => !v)}
                >
                  <span className={form.symptomsSeverity ? "text-dark-main capitalize" : "text-neutral-400"}>
                    {form.symptomsSeverity || "Select severity"}
                  </span>
                  <ChevronDownIcon
                    className={`size-5 text-dark-main transition-transform ${
                      severityOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {severityOpen && (
                  <div className={bookingDropdownPanelClass}>
                    {SEVERITY_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        className={bookingDropdownOptionClass(form.symptomsSeverity === opt.toLowerCase())}
                        onClick={() => {
                          setForm((f) => ({ ...f, symptomsSeverity: opt.toLowerCase() }));
                          setSeverityOpen(false);
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Medication */}
              <div className="lg:col-span-2">
                <label className={`${bookingFieldLabelClass} mb-1.5 block`}>
                  Have you taken any medication?
                </label>
                <input
                  type="text"
                  placeholder="List medications if any"
                  className={bookingFieldInputClass(false)}
                  value={form.medication}
                  onChange={(e) => setForm((f) => ({ ...f, medication: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Bottom Next Button */}
          <div className="mt-3 flex justify-center border-t border-brand-11 pt-3 shrink-0">
            <Button className="h-11 min-w-[150px]" onClick={goNext}>
              Next
            </Button>
          </div>
        </section>

        {/* Right Info Sidebar */}
        <DoctorInfoView doctor={doctor} mode={mode} />
      </div>
    </div>
  );
}
