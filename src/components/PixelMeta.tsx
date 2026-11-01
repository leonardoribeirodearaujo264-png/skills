"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

type Fbq = (comando: "track", evento: "PageView") => void;

// O pixel.js conta a primeira visita; aqui contamos as trocas de página feitas pelo app sem recarregar.
export function PixelMeta() {
  const caminho = usePathname();
  const anterior = useRef<string | null>(null);

  useEffect(() => {
    if (anterior.current !== null && anterior.current !== caminho) {
      (window as Window & { fbq?: Fbq }).fbq?.("track", "PageView");
    }
    anterior.current = caminho;
  }, [caminho]);

  return <Script src="/assets/pixel.js" strategy="afterInteractive" data-pixel="" />;
}
