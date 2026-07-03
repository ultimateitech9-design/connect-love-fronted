"use client";

import { User360ReadOnly } from "@/components/management/User360ReadOnly";

export default function AdminUser360Page() {
  return (
    <User360ReadOnly
      title="User 360"
      subtitle="Read-only profile, plan, status, and photo visibility for Admin dashboard."
    />
  );
}
