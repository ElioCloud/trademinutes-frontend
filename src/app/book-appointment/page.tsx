'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';

export default function BookAppointmentPage() {
  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-md">
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={[{ title: 'Meeting', start: new Date() }]}
        height="auto"
      />
    </div>
  );
}
