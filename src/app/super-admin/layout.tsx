import type { Metadata } from "next";
import "./super-admin.css";
import { AdminLayout } from "@/components/admin/AdminLayout";

export const metadata: Metadata = {
 title: "ConnectLove Super Admin",
 description: "A Next.js frontend for ConnectLove",
};

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
 return (
 <div className="theme-super-admin light">
 <AdminLayout>{children}</AdminLayout>
 </div>
 );
}
