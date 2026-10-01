import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";
import { startScheduler } from "./jobs/scheduler.js";

const app = createApp();

app.listen(env.PORT, () => {
  logger.info(`SlotSync API listening on :${env.PORT} (${env.NODE_ENV})`);
  startScheduler();
});
