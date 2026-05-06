import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";
import { app } from "./app.js";

async function bootstrap() {
  const server = app.listen(env.PORT, "0.0.0.0", () => {
    console.log(`API listening on http://localhost:${env.PORT}`);
    console.log(`Health endpoint available at http://localhost:${env.PORT}/health`);
  });

  server.on("error", (error) => {
    console.error(`Failed to bind API server on port ${env.PORT}`, error);
    process.exit(1);
  });

  try {
    await connectDatabase();
    console.log("MongoDB connected");
  } catch (error) {
    console.error("Failed to connect database", error);
    console.warn(`API remains available at http://localhost:${env.PORT}/health while the database is unavailable`);
  }
}

bootstrap().catch((error) => {
  console.error("Failed to start API", error);
  process.exit(1);
});
