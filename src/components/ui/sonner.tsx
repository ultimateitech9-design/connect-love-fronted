 "use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { Toaster as SonnerToaster } from "sonner";

type ToasterProps = React.ComponentProps<typeof SonnerToaster>;

const Sonner = dynamic(() => import("sonner").then((mod) => mod.Toaster), {
 ssr: false,
 loading: () => null,
});

const Toaster = ({ position, mobileOffset, ...props }: ToasterProps) => {
 const [isMobile, setIsMobile] = useState(false);

 useEffect(() => {
  const media = window.matchMedia("(max-width: 767px)");
  const sync = () => setIsMobile(media.matches);
  sync();
  media.addEventListener("change", sync);
  return () => media.removeEventListener("change", sync);
 }, []);

 return (
 <Sonner
 className="toaster group"
 position={isMobile ? "top-center" : (position || "bottom-right")}
 mobileOffset={isMobile ? "76px" : mobileOffset}
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
