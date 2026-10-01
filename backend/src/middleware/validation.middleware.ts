import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { Errors } from "../utils/errors.js";

type Source = "body" | "query" | "params";

export function validate(schema: ZodType, source: Source = "body") {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const msg = result.error.issues
        .map((i) => `${i.path.join(".") || source}: ${i.message}`)
        .join("; ");
      next(Errors.validation(msg));
      return;
    }
    // Overwrite with parsed (coerced/defaulted) value. In Express 5
    // `req.query` is a getter-only property, so mutate it in place.
    if (source === "query") {
      const target = req.query as Record<string, unknown>;
      for (const key of Object.keys(target)) delete target[key];
      Object.assign(target, result.data as Record<string, unknown>);
    } else {
      (req as unknown as Record<string, unknown>)[source] = result.data;
    }
    next();
  };
}
