"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface PageContextType {
  isProfilePage: boolean;
  isChatPage: boolean;
  chatId: string | null;
}

const PageContext = createContext<PageContextType>({
  isProfilePage: false,
  isChatPage: false,
  chatId: null,
});

export const PageProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const [isProfilePage, setIsProfilePage] = useState(false);
  const [isChatPage, setIsChatPage] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);

  useEffect(() => {
    // Verifica se a rota começa com "/dashboard/profile"
    setIsProfilePage(pathname.startsWith("/dashboard/profile"));
  }, [pathname]);

  useEffect(() => {
    // Verifica se a rota começa com "/dashboard/chat"
    if (pathname.startsWith("/dashboard/chat")) {
      setIsChatPage(true);

      // Extrai o ID da conversa (caso exista)
      const segments = pathname.split("/dashboard/chat/");
      if (segments.length > 1 && segments[1]) {
        setChatId(segments[1]);
      } else {
        setChatId(null);
      }
    } else {
      setIsChatPage(false);
      setChatId(null);
    }
  }, [pathname]);

  return (
    <PageContext.Provider value={{ isProfilePage, isChatPage, chatId }}>
      {children}
    </PageContext.Provider>
  );
};

export const usePageContext = () => useContext(PageContext);
