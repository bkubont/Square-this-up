import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/api/client";
import { Wrench, Clock, AlertCircle, Calendar } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { money, shortDate } from "@/lib/format";

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.entities.Job.list("-created_date", 200).then((data) => {
      setJobs(data);
      setLoading(false);
    });
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const active = jobs.filter((j) => ["In Progress", "Scheduled", "Waiting on Materials"].includes(j.status));
  const todayJobs = jobs.filter((j) => j.start_date === today);
  const owed = jobs.reduce((sum, j) => {
    const paid = (j.deposit_amount || 0);
    return sum + Math.max(0, (j.invoice_amount || 0) - paid);
  }, 0);

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Today</h1>
        <p className="text-slate-500 text-sm">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="Active Jobs" value={active.length} icon={Wrench} tint="bg-amber-50 text-amber-600" />
        <StatCard label="Scheduled Today" value={todayJobs.length} icon={Calendar} tint="bg-blue-50 text-blue-600" />
        <StatCard label="Outstanding" value={money(owed)} icon={AlertCircle} tint="bg-emerald-50 text-emerald-600" />
        <StatCard label="Total Jobs" value={jobs.length} icon={Clock} tint="bg-slate-50 text-slate-600" />
      </div>

      {/* Today's jobs */}
      <Section title="Today's Jobs">
        {loading ? (
          <Loading />
        ) : todayJobs.length ? (
          <div className="space-y-2">
            {todayJobs.map((j) => (
              <JobRow key={j.id} job={j} />
            ))}
          </div>
        ) : (
          <Empty text="No jobs scheduled for today." />
        )}
      </Section>

      {/* Active jobs */}
      <Section title="Active Jobs">
        {loading ? (
          <Loading />
        ) : active.length ? (
          <div className="space-y-2">
            {active.map((j) => (
              <JobRow key={j.id} job={j} />
            ))}
          </div>
        ) : (
          <Empty text="No active jobs. Create one from Clients." />
        )}
      </Section>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, tint }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${tint}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-lg font-bold text-slate-900">{value}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">{title}</h2>
      {children}
    </div>
  );
}

function JobRow({ job }) {
  const balance = Math.max(0, (job.invoice_amount || 0) - (job.deposit_amount || 0));
  return (
    <Link
      to={`/jobs/${job.id}`}
      className="block bg-white rounded-xl border border-slate-200 p-4 hover:border-amber-400 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-slate-900 truncate">{job.title}</div>
          <div className="text-sm text-slate-500 truncate">{job.client_name || "—"}</div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StatusBadge status={job.status} />
          {balance > 0 && <span className="text-xs font-semibold text-amber-600">{money(balance)} due</span>}
        </div>
      </div>
      {(job.start_date || job.end_date) && (
        <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
          <Calendar className="w-3 h-3" />
          {shortDate(job.start_date)} {job.end_date && `→ ${shortDate(job.end_date)}`}
        </div>
      )}
    </Link>
  );
}

function Loading() {
  return <div className="text-slate-400 text-sm py-6">Loading…</div>;
}
function Empty({ text }) {
  return <div className="text-slate-400 text-sm py-6">{text}</div>;
}