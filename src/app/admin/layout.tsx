import { AdminSidebar } from "@/features/admin/Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
 return (
 <div 
 className="flex min-h-screen flex-col text-slate-900 selection:bg-rose-500/30 lg:flex-row"
 style={{
 background: "linear-gradient(135deg, #fff5f7 0%, #fdf2f8 30%, #fff0f3 60%, #fef9ff 100%)",
 }}
 >
 <AdminSidebar />
 <main className="min-w-0 flex-1 overflow-x-hidden">
 <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
 {children}
 </div>
 </main>
 </div>
 );
}
