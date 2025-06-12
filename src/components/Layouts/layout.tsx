'use client';

import AppLayout from './AppLayout';

export default function DashboardWrapper({ children }: { children: React.ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}
