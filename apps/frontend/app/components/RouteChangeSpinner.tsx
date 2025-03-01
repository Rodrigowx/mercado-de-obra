// components/RouteChangeSpinner.jsx
"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function RouteChangeSpinner() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Ao detectar mudança de rota, mostra o spinner
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500); // ajuste o tempo conforme necessário

    return () => clearTimeout(timer);
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70">
      <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
