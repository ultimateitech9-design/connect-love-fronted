import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandLogo({ className, priority = false }: { className?: string; priority?: boolean }) {
  return (
    <span className={cn("relative inline-block shrink-0 overflow-hidden rounded-[22%]", className)}>
      <Image
        src="/connect-love-logo.png"
        alt="ConnectLove"
        fill
        sizes="64px"
        priority={priority}
        quality={100}
        unoptimized
        className="object-cover"
      />
    </span>
  );
}
