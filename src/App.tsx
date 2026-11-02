import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { StoreProvider } from "./store";
import { ClinicListPage } from "./pages/ClinicListPage";
import { BookingListPage } from "./pages/BookingListPage";
import { CalendarPage } from "./pages/CalendarPage";
import { ConfirmAppointmentPage } from "./pages/ConfirmAppointmentPage";
import { DoctorDetailPage } from "./pages/DoctorDetailPage";
import { SetAppointmentPage } from "./pages/SetAppointmentPage";

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<CalendarPage />} />
            <Route path="/booking" element={<ClinicListPage />} />
            <Route path="/booking/clinics" element={<ClinicListPage />} />
            <Route path="/booking/doctors" element={<BookingListPage />} />
            <Route path="/booking/doctor/:doctorId" element={<DoctorDetailPage />} />
            <Route path="/booking/new-appointment/:doctorId" element={<SetAppointmentPage />} />
            <Route path="/booking/confirm-appointment" element={<ConfirmAppointmentPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}
