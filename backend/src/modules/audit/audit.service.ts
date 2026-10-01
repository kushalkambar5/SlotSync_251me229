import type { Database } from "../../db/client.js";
import { createAudit, getAuditById, listAudits } from "./audit.repository.js";
import { Errors } from "../../utils/errors.js";

export const AuditService = {
  log: createAudit,
  list: listAudits,
  async getOrThrow(id: string) {
    const row = await getAuditById(id);
    if (!row) throw Errors.notFound("Audit log");
    return row;
  },
};

export type { Database };
