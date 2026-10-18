// Local MongoDB for development: `npm run db` (keep it running in its own terminal).
// Data persists in ./.mongo-data. Not used in production; there you point
// MONGODB_URI at MongoDB Atlas.
import { mkdirSync } from "node:fs";
import { MongoMemoryServer } from "mongodb-memory-server";

mkdirSync(".mongo-data", { recursive: true });
const server = await MongoMemoryServer.create({
  instance: { port: 27017, dbPath: ".mongo-data", storageEngine: "wiredTiger" },
});
console.log(`MongoDB running at ${server.getUri()} (Ctrl+C to stop)`);

const stop = async () => {
  await server.stop({ doCleanup: false });
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
