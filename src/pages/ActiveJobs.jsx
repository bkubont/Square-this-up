import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { api } from "@/api/client";
import PageHeader from "@/components/PageHeader";
import JobFormDialog from "@/components/JobFormDialog";
import StatusBadge from "@/components/StatusBadge";
import { useJobCardData, JobCustomer, JobRunningTotal, JobQuickAdd } from "@/components/JobCardInfo";
import { Button } from "@/components/ui/button";
import { money, shortDate } from "@/lib/format";
import FilterChips, { JOB_SORTS, SortSelect } from "@/components/FilterChips";
import { depositsByJobId, invoicesByJobId, isActiveJob, isWorkingJob, jobBalance, paymentsByJobId } from "@/lib/jobFilters";
import { jobPhase, sortJobs } from "@/lib/listSort";
import { NAV_ICONS } from "@/lib/navIcons";
import { statusCardClass } from "@/lib/statusColors";
import { cn } from "@/lib/utils";

const ActiveIcon = NAV_ICONS.jobs;

export default function ActiveJobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [clients, setClients] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobDialog, setJobDialog] = useState(false);
  const [phase, setPhase] = useState("all");
  const [sort, setSort] = useState("updated");

  const { clientsById, summaries, reload } = useJobCardData();

  const load = useCallback(() => {
    return Promise.all([
      api.entities.Job.listAll("-updated_date"),
      api.entities.Client.list("-created_date", 200),
      api.entities.TimelineEntry.list("-created_date", 1000),
      api.entities.Invoice.list("-updated_date", 500),
    ])
      .then(([j, c, tl, inv]) => {
        setJobs(j.filter((job) => isWorkingJob(job) && isActiveJob(job)));
        setClients(c);
        setTimeline(tl);
        setInvoices(inv);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const paymentsMap = useMemo(() => paymentsByJobId(timeline), [timeline]);
  const depositsMap = useMemo(() => depositsByJobId(timeline), [timeline]);
  const invoiceMap = useMemo(() => invoicesByJobId(invoices), [invoices]);
  const shown = useMemo(() => {
    const filtered = phase === "all" ? jobs : jobs.filter((job) => jobPhase(job) === phase);
    return sortJobs(filtered, sort, clientsById);
  }, [jobs, phase, sort, clientsById]);

  const saveJob = async (form) => {
    const created = await api.entities.Job.create(form);
    setJobDialog(false);
    navigate(`/jobs/${created.id}`);
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <PageHeader
        title="Jobs"
        description={
          loading
            ? "Lead, working, and payment jobs in play"
            : `${jobs.length} jobs still in progress, awaiting approval, or awaiting payment`
        }
        primaryAction={
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setJobDialog(true)}
          >
            <Plus className="w-4 h-4 mr-1" /> New Job
          </Button>
        }
        secondary={
          <>
            <Link to="/jobs" className="text-sm font-medium text-primary hover:underline px-2">
              All Jobs
            </Link>
            <Link to="/jobs/archive" className="text-sm font-medium text-primary hover:underline px-2">
              Archive
            </Link>
            <Link to="/jobs/board" className="text-sm font-medium text-primary hover:underline px-2">
              Board
            </Link>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <FilterChips
          label="Job phase"
          value={phase}
          onChange={setPhase}
          options={[
            { id: "all", label: "All" },
            { id: "lead", label: "Lead" },
            { id: "working", label: "Working" },
            { id: "payment", label: "Payment" },
          ]}
        />
        <SortSelect value={sort} onChange={setSort} options={JOB_SORTS} />
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : shown.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <ActiveIcon className="w-12 h-12 mx-auto mb-3 opacity-40" strokeWidth={1.5} />
          <p>No active jobs.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {shown.map((j) => {
            const balance = jobBalance(j, paymentsMap[j.id] || 0, depositsMap[j.id] || 0, invoiceMap[j.id]);
            return (
              <Link
                key={j.id}
                to={`/jobs/${j.id}`}
                className={cn(
                  "flex items-center gap-3 bg-card rounded-xl border p-4 hover:shadow-sm transition-colors",
                  statusCardClass(j.status)
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-foreground truncate max-[430px]:whitespace-normal max-[430px]:line-clamp-2">{j.title}</div>
                  <div className="max-[430px]:mt-1 max-[430px]:flex max-[430px]:flex-wrap max-[430px]:items-center max-[430px]:gap-x-2">
                    <JobCustomer job={j} client={clientsById[j.client_id]} />
                    <span className="hidden max-[430px]:inline-flex"><StatusBadge status={j.status} /></span>
                    <JobRunningTotal summary={summaries[j.id]} className="hidden max-[430px]:inline text-xs" />
                    {balance > 0 && (
                      <div className="hidden max-[430px]:block text-xs font-semibold text-foreground">{money(balance)} due</div>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0 max-[430px]:hidden">
                  <JobRunningTotal summary={summaries[j.id]} />
                  {balance > 0 && (
                    <div className="text-xs font-semibold text-foreground">{money(balance)} due</div>
                  )}
                  {j.start_date && <div className="text-xs text-muted-foreground hidden sm:block">{shortDate(j.start_date)}</div>}
                </div>
                <span className="max-[430px]:hidden"><StatusBadge status={j.status} /></span>
                <JobQuickAdd job={j} onSaved={() => { load(); reload(); }} />
              </Link>
            );
          })}
        </div>
      )}

      <JobFormDialog open={jobDialog} onOpenChange={setJobDialog} onSave={saveJob} clients={clients} />
    </div>
  );
}
