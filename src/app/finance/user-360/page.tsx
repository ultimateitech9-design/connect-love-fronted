"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { User360ReadOnly } from "@/components/management/User360ReadOnly";

export default function FinanceUser360Page() {
  return (
    <DashboardLayout title="User 360" subtitle="Read-only user profile and subscription context.">
      <User360ReadOnly
        title="User 360"
        subtitle="View user profile, photos, status, and plan without edit access."
      />
    </DashboardLayout>
  );
}
