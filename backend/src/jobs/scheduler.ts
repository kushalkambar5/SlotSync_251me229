import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";
import { runReminderJob } from "./reminder.job.js";

let timer: NodeJS.Timeout | null = null;

export function startScheduler(): void {
  if (timer) return;
  timer = setInterval(() => {
    runReminderJob().catch((err) => logger.error("reminder job error", err));
  }, env.REMINDER_INTERVAL_MS);
  timer.unref?.();
  logger.info(`reminder scheduler started (every ${env.REMINDER_INTERVAL_MS}ms)`);
}

export function stopScheduler(): void {
  if (timer) clearInterval(timer);
  timer = null;
}
