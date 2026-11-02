import { useState } from "react";
import type { AppointmentMode, Doctor } from "../types";
import { formatVnd } from "../utils";
import { BriefCaseIcon, MoneyIcon } from "./Icons";

export function DoctorInfoView({ doctor, mode }: { doctor: Doctor; mode: AppointmentMode }) {
  const [showAllCond, setShowAllCond] = useState(false);
  const [showAllExp, setShowAllExp] = useState(false);

  const fee = mode === "online" ? doctor.schedule.onlineCost : doctor.schedule.offlineCost;

  const stats = [
    {
      icon: <BriefCaseIcon className="size-4 text-white" />,
      label: "Experience",
      value: `${doctor.experienceYears} years`,
    },
    {
      icon: <BriefCaseIcon className="size-4 text-white" />,
      label: "Consultations",
      value: `${doctor.consultations} visits`,
    },
    {
      icon: <MoneyIcon className="size-4 text-white" />,
      label: "Pay service fee",
      value: formatVnd(fee),
    },
  ];

  const visibleConditions = showAllCond ? doctor.conditions : doctor.conditions.slice(0, 3);
  const visibleExperiences = showAllExp ? doctor.experiences : doctor.experiences.slice(0, 2);

  const tagClass =
    "rounded-[20px] border border-neutral-200 bg-white px-3 py-1 text-[10px] font-semibold uppercase text-notes";

  return (
    <div className="flex h-full min-h-0 w-full shrink-0 flex-col gap-4 overflow-y-auto rounded-2xl bg-white p-4 no-scrollbar xl:max-w-[300px]">
      <div className="flex w-full justify-center pt-1">
        {doctor.avatar ? (
          <img src={doctor.avatar} alt={doctor.fullname} className="size-24 rounded-full object-cover" />
        ) : (
          <div className="flex size-24 items-center justify-center rounded-full bg-brand-05 text-2xl font-bold text-brand-7">
            {doctor.fullname.charAt(0)}
          </div>
        )}
      </div>

      <div className="w-full text-center">
        <p className="text-xl font-semibold leading-snug text-dark-main">{doctor.fullname}</p>
        <p className="mt-1 text-xs font-medium text-neutral-400">
          {[doctor.publicId, doctor.specialty].filter(Boolean).join(" · ")}
        </p>
      </div>

      <div className="flex w-full items-start px-1">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-1 flex-col items-center gap-1 text-center">
            <div className="flex size-9 items-center justify-center rounded-full bg-brand-5">
              {stat.icon}
            </div>
            <p className="mt-1 text-xs font-medium text-neutral-400">{stat.label}</p>
            <p className="text-xs font-semibold text-dark-main">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="h-px w-full bg-brand-11" />

      <div className="flex flex-col gap-2.5">
        <p className="text-sm font-semibold text-dark-main">Specialist consultation</p>
        <div className="flex flex-wrap gap-2">
          {doctor.conditions.length === 0 ? (
            <span className="text-xs text-neutral-400">No condition data.</span>
          ) : (
            <>
              {visibleConditions.map((c) => (
                <span key={c} className={tagClass}>
                  {c}
                </span>
              ))}
              {doctor.conditions.length > 3 && (
                <button
                  type="button"
                  onClick={() => setShowAllCond((p) => !p)}
                  className={`${tagClass} cursor-pointer hover:border-brand-1`}
                >
                  {showAllCond ? "SHOW LESS" : "SHOW MORE"}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="h-px w-full bg-brand-11" />

      <div className="flex flex-col gap-2.5">
        <p className="text-sm font-semibold text-dark-main">Experience and certificates</p>
        {doctor.experiences.length === 0 ? (
          <span className="text-xs text-neutral-400">No experience data.</span>
        ) : (
          <div className="flex flex-col gap-3">
            {visibleExperiences.map((exp) => (
              <div key={exp.facility} className="flex flex-col gap-0.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium text-neutral-400">{exp.position}</p>
                  <span className="shrink-0 text-xs font-medium text-neutral-400">
                    {exp.fromYear} - {exp.toYear ?? "now"}
                  </span>
                </div>
                <p className="text-sm font-semibold text-dark-main">{exp.facility}</p>
              </div>
            ))}
            {doctor.experiences.length > 2 && (
              <button
                type="button"
                onClick={() => setShowAllExp((p) => !p)}
                className={`${tagClass} w-fit cursor-pointer hover:border-brand-1`}
              >
                {showAllExp ? "SHOW LESS" : "SHOW MORE"}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="h-px w-full bg-brand-11" />

      <div className="flex flex-col gap-2.5">
        <p className="text-sm font-semibold text-dark-main">Languages</p>
        <div className="flex flex-wrap gap-2">
          {doctor.languages.length === 0 ? (
            <span className="text-xs text-neutral-400">No language data.</span>
          ) : (
            doctor.languages.map((l) => (
              <span key={l} className={tagClass}>
                {l}
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
