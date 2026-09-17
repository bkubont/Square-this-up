import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/api/client";
import { Wrench } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { money, shortDate } from "@/lib/format";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUSES = ["All", "Estimate", "Scheduled", "In Progress", "Waiting on Materials", "Completed", "Paid"];

export default function AllJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    api.entities.Job.list("-created_date", 300).then((d) => {
      setJobs(d);
      setLoading(false);
    });
  }, []);

  const shown = filter === "All" ? jobs : jobs.filter((j) => j.status === filter);

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">All Jobs</h1>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-slate-400">Loading…</p>
      ) : shown.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Wrench className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>No jobs here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {shown.map((j) => {
            const balance = Math.max(0, (j.invoice_amount || 0) - (j.deposit_amount || 0));
            return (
              <Link
                key={j.id}
                to={`/jobs/${j.id}`}
                className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 p-4 hover:border-amber-400 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-900 truncate">{j.title}</div>
                  <div className="text-sm text-slate-500 truncate">{j.client_name || "—"}</div>
                </div>
                <div className="text-right hidden sm:block">
                  {balance > 0 && <div className="text-xs font-semibold text-amber-600">{money(balance)} due</div>}
                  {j.start_date && <div className="text-xs text-slate-400">{shortDate(j.start_date)}</div>}
                </div>
                <StatusBadge status={j.status} />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}