import type { Metadata } from "next";
import "./finance.css";

export const metadata: Metadata = {
 title: "Finance Dashboard",
 description: "Finance dashboard",
};

export default function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 return (
 <div className="theme-finance h-full min-h-full flex flex-col antialiased">
 {children}
 </div>
 );
}
