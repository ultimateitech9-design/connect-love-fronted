"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const ConnectLoveChatbot = dynamic(
  () => import("@/features/chatbot/ConnectLoveChatbot").then((module) => module.ConnectLoveChatbot),
  { ssr: false },
);

export function RouteChatbot() {
  const pathname = usePathname();
  const isUserDashboard = pathname === "/user" || pathname === "/user/discover";

  return isUserDashboard ? <ConnectLoveChatbot /> : null;
}
