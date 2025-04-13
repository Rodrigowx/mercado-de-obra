// app/components/AuthContext.tsx
"use client";

import React, {
  createContext,
  useState,
  useEffect,
  useContext, 
  useCallback, 
  useRef, 
} from "react";
import { jwtDecode } from "jwt-decode";
import {
  connectSocket,
  disconnectSocket,
  getSocket,
  joinNotification, 
} from "../services/socketServices";

interface UserData {
  id: number;
  name: string;
  role: "CLIENT" | "PROFESSIONAL";
  rating?: number;
}

interface AuthContextProps {
  user: UserData | null;
  isAuthenticated: boolean;
  socketConnected: boolean;
  login: (token: string) => void;
  logout: () => void;
}

// Valor inicial mais explícito
const initialAuthContext: AuthContextProps = {
  user: null,
  isAuthenticated: false,
  socketConnected: false,
  login: () => {
    console.warn("AuthProvider não está pronto");
  },
  logout: () => {
    console.warn("AuthProvider não está pronto");
  },
};

export const AuthContext = createContext<AuthContextProps>(initialAuthContext);

// Hook customizado
export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  // Ref para evitar múltiplos listeners de conexão/desconexão
  const socketListenersSetup = useRef(false);

  const decodeToken = (token: string): UserData | null => {
    try {
      const decoded = jwtDecode<UserData>(token);
      return decoded && decoded.id
        ? { id: decoded.id, name: decoded.name, role: decoded.role }
        : null;
    } catch {
      return null;
    }
  };

  // Usar useCallback para estabilizar as funções de login/logout
  const login = useCallback((token: string) => {
    localStorage.setItem("accessToken", token);
    const decodedUser = decodeToken(token);
    if (decodedUser) {
      setUser(decodedUser);
      setIsAuthenticated(true);
      // A conexão do socket será tratada pelo useEffect abaixo
    } else {
      // Token inválido durante o login explícito, limpar
      logout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Adicionar logout como dependência se ele usar estado/props

  const logout = useCallback(() => {
    disconnectSocket(); // Desconecta o socket primeiro
    localStorage.removeItem("accessToken");
    setUser(null);
    setIsAuthenticated(false);
    setSocketConnected(false); // Reseta o estado da conexão
    socketListenersSetup.current = false; // Permite re-setup na próxima conexão
  }, []);

  // Efeito para gerenciar conexão/desconexão do socket baseado na autenticação
  useEffect(() => {
    if (isAuthenticated && user?.id && !socketConnected) {
      connectSocket(user.id);
      const socket = getSocket();

      if (socket && !socketListenersSetup.current) {
        const handleConnect = () => {
          setSocketConnected(true);
          // Entra na sala de notificação pessoal LOGO APÓS conectar
          // Não passa conversationIds aqui, apenas o ID do usuário
          joinNotification([], user.id);
        };
        const handleDisconnect = () => {
          setSocketConnected(false);
          socketListenersSetup.current = false; // Permite re-setup se reconectar
        };
        const handleConnectError = () => {
          setSocketConnected(false); // Erro ao conectar
          socketListenersSetup.current = false;
        };

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        socket.on("connect_error", handleConnectError);
        socketListenersSetup.current = true; // Marca que os listeners foram configurados

        // Se já estiver conectado quando o efeito rodar
        if (socket.connected) {
          handleConnect();
        }

        // Função de limpeza para este efeito específico de listeners
        return () => {
          if (socket) {
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
            socket.off("connect_error", handleConnectError);
            socketListenersSetup.current = false; // Permite re-setup na próxima vez
          }
        };
      }
    } else if (!isAuthenticated && socketConnected) {
      // Caso de deslogar enquanto estava conectado
      disconnectSocket();
      setSocketConnected(false);
      socketListenersSetup.current = false;
    }
  }, [isAuthenticated, user?.id, socketConnected]); 

  // Efeito para validar token inicial do localStorage
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      const decodedUser = decodeToken(token);
      if (decodedUser) {
        setUser(decodedUser);
        setIsAuthenticated(true);
        // Não chama connectSocket aqui, o useEffect acima tratará disso
      } else {
        logout(); // Token inválido, limpa tudo
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Roda apenas uma vez na montagem

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, socketConnected, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
