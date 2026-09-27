import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/api/client";
import FilterChips, { SortSelect } from "@/components/FilterChips";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { jobDocumentHref } from "@/lib/documents";
import { money, shortDate } from "@/lib/format";
import { sortRows } from "@/lib/listSort";
import { NAV_ICONS } from "@/lib/navIcons";
import { statusCardClass } from "@/lib/statusColors";
import { cn } from "@/lib/utils";

const EstimatesIcon = NAV_ICONS.estimates;

const STATUS_FILTERS = [
  { id: "all", label: "All" },
  { id: "draft", label: "Draft" },
  { id: "sent", label: "Sent" },
  { id: "accepted", label: "Accepted" },
  { id: "void", label: "Void" },
];

/** Thin Estimates list — wires existing Estimate entities; create stays on the job. */
export default function Estimates() {
  const [estimates, setEstimates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState("date");

  useEffect(() => {
    Promise.all([
      api.entities.Estimate.list("-updated_date", 300),
      api.entities.Job.list("-updated_date", 300),
    ])
      .then(([e, j]) => {
        setEstimates(e);
        setJobs(j);
      })
      .finally(() => setLoading(false));
  }, []);

  const jobById = useMemo(() => Object.fromEntries(jobs.map((j) => [j.id, j])), [jobs]);
  const awaiting = useMemo(() => estimates.filter((e) => e.status === "sent").length, [estimates]);
  const visible = useMemo(() => {
    const filtered = statusFilter === "all" ? estimates : estimates.filter((est) => est.status === statusFilter);
    return sortRows(filtered, sort === "number" ? "name" : sort, {
      date: (est) => est.date || est.updated_date || est.created_date || "",
      amount: (est) => Number(est.total) || 0,
      name: (est) => est.number || "",
    });
  }, [estimates, statusFilter, sort]);

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <PageHeader
        title="Estimates"
        description={
          loading
            ? undefined
            : `${estimates.length} estimate${estimates.length === 1 ? "" : "s"}${awaiting ? ` · ${awaiting} awaiting approval` : ""}`
        }
        secondary={
          <Link to="/jobs/action-items" className="text-sm font-medium text-primary hover:underline px-2">
            Needs Attention
          </Link>
        }
      />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <FilterChips label="Estimate status" options={STATUS_FILTERS} value={statusFilter} onChange={setStatusFilter} />
        <SortSelect
          value={sort}
          onChange={setSort}
          options={[
            { id: "date", label: "Date" },
            { id: "amount", label: "Amount" },
            { id: "number", label: "Number" },
          ]}
        />
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : estimates.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <EstimatesIcon className="w-12 h-12 mx-auto mb-3 opacity-40" strokeWidth={1.5} />
          <p>No estimates yet. Open a job and create an estimate from Documents.</p>
        </div>
      ) : visible.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8">No estimates with this status.</p>
      ) : (
        <div className="space-y-2">
          {visible.map((est) => {
            const job = jobById[est.job_id];
            return (
              <div
                key={est.id}
                className={cn(
                  "rounded-xl border p-4",
                  statusCardClass(est.status)
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <Link
                    to={jobDocumentHref(est.job_id, "Estimate", est.id)}
                    className="min-w-0 flex-1 hover:text-primary"
                  >
                    <div className="font-semibold text-foreground">
                      {est.number || "Estimate"}
                      {job ? <span className="font-normal text-muted-foreground"> · {job.title}</span> : null}
                    </div>
                    <div className="text-sm text-muted-foreground mt-0.5">
                      {shortDate(est.date || est.updated_date || est.created_date)}
                      {est.total != null ? ` · ${money(est.total)}` : null}
                    </div>
                  </Link>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <StatusBadge status={est.status} />
                    {est.job_id ? (
                      <Link to={`/jobs/${est.job_id}`} className="text-xs font-medium text-primary hover:underline min-h-11 inline-flex items-center">
                        Open job
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
