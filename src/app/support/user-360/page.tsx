"use client";

import { User360ReadOnly } from "@/components/management/User360ReadOnly";

export default function SupportUser360Page() {
  return (
    <User360ReadOnly
      title="User 360"
      subtitle="Read-only support identity and account-status view. Private profile media is not available."
    />
  );
}
