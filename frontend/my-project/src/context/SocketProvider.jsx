import { createContext, useContext, useMemo } from "react";
import { io } from "socket.io-client";

// Create a context for the socket
const SocketContext = createContext(null);

// Custom hook to use the socket context
export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};

// Socket provider to manage socket connection
export const SocketProvider = ({ children }) => {
  // Use useMemo to create a socket instance
  const socket = useMemo(() => {
    // Ensure the connection URL includes the protocol
    return io(`http://localhost:8000`); // Add protocol here
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
