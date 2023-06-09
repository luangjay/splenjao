import { Server as HTTPServer } from "http";
import { NextApiRequest, NextApiResponse } from "next";
import { Socket as NetSocket } from "net";
import { Server as IOServer } from "socket.io";
import { SocketEvents } from "../../common/types";

interface SocketServer extends HTTPServer {
  io?: IOServer | undefined;
}

interface SocketWithIO extends NetSocket {
  server: SocketServer;
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponseWithSocket
) {
  if (res.socket.server.io) {
    console.log("Socket is already running.");
    res.end();
    return;
  }

  console.log("Socket is initializing...");
  const io = new IOServer(res.socket.server);
  res.socket.server.io = io;

  io.on("connection", (socket) => {
    socket.on(SocketEvents.UpdateServer, () => {
      console.log("on: UpdateServer");
      io.emit(SocketEvents.UpdateClient, "bruh");
    });
    socket.on(SocketEvents.ToastServer, (bread) => {
      console.log("on: ToastServer");
      io.emit(SocketEvents.ToastClient, bread);
    });
  });
  res.end();
}
