 "use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { Toaster as SonnerToaster } from "sonner";

type ToasterProps = React.ComponentProps<typeof SonnerToaster>;

const Sonner = dynamic(() => import("sonner").then((mod) => mod.Toaster), {
 ssr: false,
 loading: () => null,
});

const Toaster = ({ ...props }: ToasterProps) => {
 const [ready, setReady] = useState(false);

 useEffect(() => {
 const timer = window.setTimeout(() => setReady(true), 5000);
 return () => window.clearTimeout(timer);
 }, []);

 if (!ready) return null;

 return (
 <Sonner
 className="toaster group"
 toastOptions={{
 classNames: {
 toast:
 "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
 description: "group-[.toast]:text-muted-foreground",
 actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
 cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
 },
 }}
 {...props}
 />
 );
};

export { Toaster };
