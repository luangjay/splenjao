import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";

export function useSocket() {
  const [socket, setSocket] = useState<Socket>();

  useEffect(() => {
    (async () => {
      await fetch("/api/socket");
      const newSocket = io();
      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    })();
  }, []);

  return socket;
}
