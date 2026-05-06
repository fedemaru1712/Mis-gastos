import mongoose from "mongoose";
import { env } from "./env.js";
import { runMigrations } from "./migrations.js";

let databaseStatus: "connecting" | "connected" | "disconnected" = "disconnected";

mongoose.connection.on("connected", () => {
  databaseStatus = "connected";
});

mongoose.connection.on("disconnected", () => {
  databaseStatus = "disconnected";
});

export function getDatabaseStatus() {
  return databaseStatus;
}

export async function connectDatabase() {
  databaseStatus = "connecting";
  await mongoose.connect(env.MONGODB_URI);
  await runMigrations();
  databaseStatus = "connected";
}
