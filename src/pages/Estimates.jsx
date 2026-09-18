import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, FileText, Send } from "lucide-react";
import { api } from "@/api/client";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/StatusBadge";
import { money, shortDate } from "@/lib/format";

export default function Estimates() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => api.entities.Job.list("-updated_date", 200).then(setJobs).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const markSent = async (job) => {
    await api.entities.TimelineEntry.create({ job_id: job.id, type: "estimate_sent", text: "Estimate sent to client", category: "financial" });
    await load();
  };

  const accept = async (job) => {
    await api.entities.Job.update(job.id, { status: "Accepted" });
    await api.entities.TimelineEntry.create({ job_id: job.id, type: "status_change", text: "Estimate accepted", category: "financial" });
    await load();
  };

  const estimates = jobs.filter((job) => job.estimate_amount !== undefined && job.estimate_amount !== null);

  return <div className="p-4 lg:p-8 max-w-5xl mx-auto">
    <div className="mb-6"><h1 className="text-2xl font-bold text-slate-900">Estimates</h1><p className="text-sm text-slate-500">Track quotes and turn accepted work into scheduled jobs</p></div>
    <section className="bg-white rounded-xl border border-slate-200 p-4">
      {loading ? <div className="text-sm text-slate-400 py-6">Loading...</div> : estimates.length ? <div className="divide-y divide-slate-100">
        {estimates.map((job) => <div key={job.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
          <div className="min-w-0"><Link to={`/jobs/${job.id}`} className="font-semibold text-slate-800 hover:text-amber-600">{job.title}</Link><div className="text-xs text-slate-400">{job.client_name || "No client"} {job.updated_date && `· Updated ${shortDate(job.updated_date)}`}</div></div>
          <div className="flex items-center gap-3"><span className="font-semibold text-slate-800">{money(job.estimate_amount)}</span><StatusBadge status={job.status} /><Button variant="outline" size="sm" onClick={() => markSent(job)}><Send className="w-3.5 h-3.5 mr-1" />Sent</Button><Button size="sm" className="bg-cyan-600 hover:bg-cyan-500" onClick={() => accept(job)} disabled={job.status === "Accepted" || ["Scheduled", "In Progress", "Waiting on Materials", "Completed", "Paid"].includes(job.status)}><CheckCircle2 className="w-3.5 h-3.5 mr-1" />Accept</Button></div>
        </div>)}
      </div> : <div className="py-8 text-center text-sm text-slate-400"><FileText className="mx-auto mb-2 w-6 h-6" />No estimates yet. Add an estimate when creating a job.</div>}
    </section>
  </div>;
}
