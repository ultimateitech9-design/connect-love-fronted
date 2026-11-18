"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { BRAND_LOGO_DATA } from './brandLogoData';

export function BrandLogo({ className, priority = false }: { className?: string; priority?: boolean }) {
  const [source, setSource] = useState(BRAND_LOGO_DATA);
  return (
    <span className={cn("relative inline-block shrink-0 overflow-hidden rounded-[22%]", className)}>
      <img
        src={source}
        alt="ConnectLove"
        width={96}
        height={96}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        onError={() => { if (source !== '/connect-love-logo.png') setSource('/connect-love-logo.png'); }}
        className="absolute inset-0 block h-full w-full object-cover"
        style={{ width: '100%', height: '100%' }}
      />
    </span>
  );
}
