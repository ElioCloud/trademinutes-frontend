'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import DashboardWrapper from '@/components/Layouts/layout';

export default function BookAppointmentPage() {
  return (
    <DashboardWrapper>
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-md">
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={[{ title: 'Meeting', start: new Date() }]}
        height="auto"
      />
    </div>
    </DashboardWrapper>
  );
}
