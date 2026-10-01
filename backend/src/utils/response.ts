import type { Response } from "express";

export function ok(res: Response, data: unknown, meta?: Record<string, unknown>): void {
  res.status(200).json({ success: true, data, ...(meta ? { meta } : {}) });
}

export function created(res: Response, data: unknown): void {
  res.status(201).json({ success: true, data });
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

export function paginated(res: Response, data: unknown[], meta: PaginationMeta): void {
  res.status(200).json({ success: true, data, meta });
}

export function parsePagination(query: {
  page?: string | number;
  limit?: string | number;
}): { page: number; limit: number; offset: number } {
  const page = Math.max(1, Number(query.page ?? 1) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit ?? 20) || 20));
  return { page, limit, offset: (page - 1) * limit };
}
