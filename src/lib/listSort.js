import { phaseForStatus } from "./jobStatus.js";

export function jobPhase(job) {
  return job?.phase || phaseForStatus(job?.status) || "";
}

/**
 * @param {object[]} jobs
 * @param {string} sort
 * @param {Record<string, { name?: string }>} [clientsById]
 */
export function sortJobs(jobs, sort, clientsById = {}) {
  const copy = [...(jobs || [])];
  copy.sort((a, b) => {
    if (sort === "title") return String(a.title || "").localeCompare(String(b.title || ""));
    if (sort === "status") return String(a.status || "").localeCompare(String(b.status || ""));
    if (sort === "customer") {
      const an = clientsById[a.client_id]?.name || a.client_name || "";
      const bn = clientsById[b.client_id]?.name || b.client_name || "";
      return String(an).localeCompare(String(bn));
    }
    return String(b.updated_date || b.created_date || "").localeCompare(String(a.updated_date || a.created_date || ""));
  });
  return copy;
}

/**
 * @param {object[]} rows
 * @param {string} sort
 * @param {{ date?: (row: object) => string, amount?: (row: object) => number, name?: (row: object) => string }} pick
 */
export function sortRows(rows, sort, pick) {
  const copy = [...(rows || [])];
  copy.sort((a, b) => {
    if (sort === "amount") return (pick.amount?.(b) || 0) - (pick.amount?.(a) || 0);
    if (sort === "name") return String(pick.name?.(a) || "").localeCompare(String(pick.name?.(b) || ""));
    return String(pick.date?.(b) || "").localeCompare(String(pick.date?.(a) || ""));
  });
  return copy;
}
