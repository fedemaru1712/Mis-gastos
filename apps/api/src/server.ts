import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";
import { app } from "./app.js";

async function bootstrap() {
  const server = app.listen(env.PORT, "0.0.0.0", () => {
    console.log(`API listening on http://0.0.0.0:${env.PORT}`);
  });

  try {
    await connectDatabase();
    console.log("MongoDB connected");
  } catch (error) {
    console.error("Failed to connect database", error);
    server.close(() => {
      process.exit(1);
    });
  }
}

bootstrap().catch((error) => {
  console.error("Failed to start API", error);
  process.exit(1);
});
