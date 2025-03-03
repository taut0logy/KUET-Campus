"use client";

import { createContext, useContext, useEffect } from "react";
import { useSocket as useSocketHook } from "@/hooks/useSocket";
import { useAuth } from "@/components/providers/auth-provider";

const SocketContext = createContext(undefined);

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}

export function SocketProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const socketData = useSocketHook();

  // Only initialize socket when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      // Clean up socket connection when not authenticated
      if (socketData.socket) {
        socketData.socket.disconnect();
      }
    }
  }, [isAuthenticated]);

  return (
    <SocketContext.Provider value={socketData}>
      {children}
    </SocketContext.Provider>
  );
} 