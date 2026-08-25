import mongoose from "mongoose";

const gameHostSchema = new mongoose.Schema({
  hostAccountId: { type: String, required: true, unique: true },
  hostUsername: { type: String, default: "" },
  address: { type: String, required: true },
  port: { type: Number, required: true },
  playlistName: { type: String, default: "Playlist_DefaultSolo" },
  maxPlayers: { type: Number, default: 30 },
  currentPlayers: { type: Number, default: 0 },
  status: { type: String, default: "online", enum: ["online", "offline"] },
  lastHeartbeat: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("GameHost", gameHostSchema);
