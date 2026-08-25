import { WebSocketServer } from "ws";
import crypto from "crypto";

export function createMatchmakerWss() {
  const wss = new WebSocketServer({ noServer: true });

  wss.on("connection", async (ws) => {
    if (
      typeof ws.protocol === "string" &&
      ws.protocol.toLowerCase().includes("xmpp")
    ) {
      return ws.close();
    }

    const ticketId = crypto
      .createHash("md5")
      .update(`1${Date.now()}`)
      .digest("hex");
    const matchId = crypto
      .createHash("md5")
      .update(`2${Date.now()}`)
      .digest("hex");
    const sessionId = crypto
      .createHash("md5")
      .update(`3${Date.now()}`)
      .digest("hex");

    setTimeout(Connecting, 200);
    setTimeout(Waiting, 1000);
    setTimeout(Queued, 2000);
    setTimeout(SessionAssignment, 6000);
    setTimeout(Join, 8000);

    function Connecting() {
      if (ws.readyState !== ws.OPEN) return;
      ws.send(
        JSON.stringify({
          payload: { state: "Connecting" },
          name: "StatusUpdate",
        })
      );
    }

    function Waiting() {
      if (ws.readyState !== ws.OPEN) return;
      ws.send(
        JSON.stringify({
          payload: {
            totalPlayers: 1,
            connectedPlayers: 1,
            state: "Waiting",
          },
          name: "StatusUpdate",
        })
      );
    }

    function Queued() {
      if (ws.readyState !== ws.OPEN) return;
      ws.send(
        JSON.stringify({
          payload: {
            ticketId: ticketId,
            queuedPlayers: 0,
            estimatedWaitSec: 0,
            status: {},
            state: "Queued",
          },
          name: "StatusUpdate",
        })
      );
    }

    function SessionAssignment() {
      if (ws.readyState !== ws.OPEN) return;
      ws.send(
        JSON.stringify({
          payload: { matchId: matchId, state: "SessionAssignment" },
          name: "StatusUpdate",
        })
      );
    }

    function Join() {
      if (ws.readyState !== ws.OPEN) return;
      ws.send(
        JSON.stringify({
          payload: {
            matchId: matchId,
            sessionId: sessionId,
            joinDelaySec: 1,
          },
          name: "Play",
        })
      );
    }
  });

  return wss;
}
