import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/error.middleware.js";
import { generalLimiter } from "./middleware/rate-limit.middleware.js";
import { apiRouter } from "./routes/index.js";

export function createApp(): express.Express {
  const app = express();
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(",").map((s) => s.trim()),
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "100kb" }));
  app.use(cookieParser());
  app.use(morgan("dev"));
  app.use(generalLimiter);

  app.use("/api/v1", apiRouter);
  app.get("/", (_req, res) => {
    res.json({ success: true, data: { name: "SlotSync API", version: "v1" } });
  });

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
