import express from "express";
import { verifyToken } from "../User/tokenManager/tokenVerify.js";
import GameHost from "../User/Mongodb/Schema/gamehost.js";

const app = express.Router();

const HOST_STALE_MS = 45000;

function isFresh(host) {
  return (
    host.status === "online" &&
    host.lastHeartbeat &&
    Date.now() - new Date(host.lastHeartbeat).getTime() < HOST_STALE_MS
  );
}

app.post("/hostapi/register", verifyToken, async (req, res) => {
  try {
    const { address, port, playlistName, maxPlayers } = req.body || {};
    if (typeof address !== "string" || !address.trim()) {
      return res
        .status(400)
        .json({ error: "address requis (ex: drake-xxx.tun.ply.gg)" });
    }
    const portNum = Number(port);
    if (!Number.isFinite(portNum) || portNum <= 0 || portNum > 65535) {
      return res.status(400).json({ error: "port invalide" });
    }

    const host = await GameHost.findOneAndUpdate(
      { hostAccountId: req.user.accountId },
      {
        $set: {
          address: address.trim(),
          port: portNum,
          playlistName:
            typeof playlistName === "string" && playlistName.trim()
              ? playlistName.trim()
              : "Playlist_DefaultSolo",
          maxPlayers: Number.isFinite(Number(maxPlayers))
            ? Number(maxPlayers)
            : 30,
          status: "online",
          lastHeartbeat: new Date(),
        },
        $setOnInsert: {
          hostUsername: req.user.username || "",
          createdAt: new Date(),
          currentPlayers: 0,
        },
      },
      { upsert: true, new: true }
    );

    res.json({
      status: "registered",
      hostId: host.hostAccountId,
      address: host.address,
      port: host.port,
      heartbeatIntervalSec: 25,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/hostapi/heartbeat", verifyToken, async (req, res) => {
  try {
    const currentPlayers = Number(req.body?.currentPlayers);
    const update = { lastHeartbeat: new Date(), status: "online" };
    if (Number.isFinite(currentPlayers)) update.currentPlayers = currentPlayers;

    const host = await GameHost.findOneAndUpdate(
      { hostAccountId: req.user.accountId },
      { $set: update },
      { new: true }
    );

    if (!host) return res.status(404).json({ error: "hote non enregistre" });
    res.json({ status: "ok", serverTime: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/hostapi/unregister", verifyToken, async (req, res) => {
  try {
    await GameHost.findOneAndUpdate(
      { hostAccountId: req.user.accountId },
      { $set: { status: "offline" } }
    );
    res.json({ status: "unregistered" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/hostapi/list", async (req, res) => {
  try {
    const hosts = await GameHost.find({}).lean();
    res.json(
      hosts.map((h) => ({
        username: h.hostUsername,
        online: isFresh(h),
        address: h.address,
        port: h.port,
        players: h.currentPlayers,
        maxPlayers: h.maxPlayers,
        playlist: h.playlistName,
        lastSeen: h.lastHeartbeat,
      }))
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default app;
