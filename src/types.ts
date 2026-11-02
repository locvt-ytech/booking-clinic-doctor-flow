export type AppointmentMode = "online" | "offline";

export type AppointmentStatus =
  | "upcoming"
  | "pending"
  | "awaiting_report"
  | "cancelled"
  | "completed";

export type AppointmentType = "online" | "clinic";

export type ScheduleShift = { startTime: string; endTime: string };
export type DaySchedule = { day: string; enabled: boolean; shifts: ScheduleShift[] };

export type DoctorSchedule = {
  doctorId: string;
  offlineEnabled: boolean;
  offlineSlotDuration: number;
  offlineCost: number;
  offlineDays: DaySchedule[];
  onlineEnabled: boolean;
  onlineSlotDuration: number;
  onlineCost: number;
  onlineDays: DaySchedule[];
};

export type Clinic = {
  id: string;
  name: string;
  shortName?: string;
  logo?: string;
  badgeBg?: string;
  badgeText?: string;
  operatingHours: string;
  city: string;
  distance: string;
  rating: number;
  reviewCount: string;
  cost: number;
  address: string;
};

export type Doctor = {
  id: string;
  publicId: string;
  fullname: string;
  avatar: string;
  specialty: string;
  specialties: string[];
  clinicId?: string;
  clinicName: string;
  province: string;
  conditions: string[];
  languages: string[];
  experiences: { position: string; facility: string; fromYear: number; toYear: number | null }[];
  consultations: number;
  experienceYears: number;
  schedule: DoctorSchedule;
};

export type FamilyMember = {
  id: string;
  fullname: string;
  relationship: "self" | "spouse" | "child";
  publicId: string;
};

export type Appointment = {
  id: string;
  title: string;
  start: string;
  end: string;
  status: AppointmentStatus;
  type: AppointmentType;
  reason: string;
  details: string;
  symptomsOnset: string;
  symptomsSeverity: string;
  medication: string;
  doctorId: string;
  patientName: string;
  patientId: string;
  totalFee: number;
};

export type BookingSelectedSlot = {
  day: string;
  slot: string;
  date: string;
};

export type AppointmentFormData = {
  whoNeedsVisit: "self" | string;
  selectedDate: string | null;
  selectedTime: string;
  reason: string;
  details: string;
  symptomsOnset: string;
  symptomsSeverity: string;
  medication: string;
};

export type BookingDraft = {
  doctorId: string;
  mode: AppointmentMode;
  selectedSlot: BookingSelectedSlot | null;
  formData?: AppointmentFormData;
};
