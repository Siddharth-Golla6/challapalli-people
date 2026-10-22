import "dotenv/config";
import { createApp } from "./app.js";
import { connectDB } from "./config/prisma.js";

const PORT = process.env.PORT || 4000;

async function main() {
  await connectDB();
  const app = createApp();
  app.listen(PORT, () => console.log(`challapalli.people API listening on port ${PORT}`));
}

main().catch((err) => {
  console.error("Failed to start server:", err.message);
  process.exit(1);
});
