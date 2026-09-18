import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, FileText, Send } from "lucide-react";
import { api } from "@/api/client";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/StatusBadge";
import { money } from "@/lib/format";

export default function Invoices() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => api.entities.Job.list("-updated_date", 200).then(setJobs).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const markSent = async (job) => {
    await api.entities.TimelineEntry.create({ job_id: job.id, type: "invoice_sent", text: "Invoice sent to client", category: "financial" });
    await load();
  };

  const markPaid = async (job) => {
    await api.entities.Job.update(job.id, { status: "Paid" });
    await api.entities.TimelineEntry.create({ job_id: job.id, type: "payment_received", text: "Invoice marked paid", category: "financial", amount: Number(job.invoice_amount || 0) });
    await load();
  };

  const invoices = jobs.filter((job) => job.invoice_amount !== undefined && job.invoice_amount !== null);

  return <div className="p-4 lg:p-8 max-w-5xl mx-auto">
    <div className="mb-6"><h1 className="text-2xl font-bold text-slate-900">Invoices</h1><p className="text-sm text-slate-500">Send invoices and keep track of balances</p></div>
    <section className="bg-white rounded-xl border border-slate-200 p-4">
      {loading ? <div className="text-sm text-slate-400 py-6">Loading...</div> : invoices.length ? <div className="divide-y divide-slate-100">
        {invoices.map((job) => { const paid = Number(job.deposit_amount || 0) + Number(job.payments_total || 0); const balance = job.status === "Paid" ? 0 : Math.max(0, Number(job.invoice_amount || 0) - paid); return <div key={job.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
          <div className="min-w-0"><Link to={`/jobs/${job.id}`} className="font-semibold text-slate-800 hover:text-amber-600">{job.title}</Link><div className="text-xs text-slate-400">{job.client_name || "No client"}</div></div>
          <div className="flex items-center gap-3"><div className="text-right"><div className="font-semibold text-slate-800">{money(job.invoice_amount)}</div><div className={`text-xs ${balance ? "text-amber-600" : "text-emerald-600"}`}>{balance ? `${money(balance)} due` : "Paid in full"}</div></div><StatusBadge status={job.status} /><Button variant="outline" size="sm" onClick={() => markSent(job)}><Send className="w-3.5 h-3.5 mr-1" />Sent</Button><Button size="sm" className="bg-emerald-600 hover:bg-emerald-500" onClick={() => markPaid(job)} disabled={!balance}><CheckCircle2 className="w-3.5 h-3.5 mr-1" />Paid</Button></div>
        </div>; })}
      </div> : <div className="py-8 text-center text-sm text-slate-400"><FileText className="mx-auto mb-2 w-6 h-6" />No invoices yet. Add an invoice amount when creating a job.</div>}
    </section>
  </div>;
}
