import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import { setIO } from "./src/lib/realtime";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const port = parseInt(process.env.PORT || "3000", 10);

app.prepare().then(() => {
  const httpServer = createServer((req, res) => handle(req, res));
  const io = new Server(httpServer, { path: "/api/socket", cors: { origin: "*" } });
  setIO(io);
  // make io globally accessible for server actions
  (globalThis as unknown as { __io: Server }).__io = io;
  io.on("connection", (socket) => {
    console.log("socket connected", socket.id);
    socket.on("disconnect", () => console.log("socket disconnected", socket.id));
  });
  httpServer.listen(port, () => console.log(`> Ready on http://localhost:${port} (ws: /api/socket)`));
});
