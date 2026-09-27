import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MoreHorizontal, Plus, Wallet } from "lucide-react";
import { api } from "@/api/client";
import PageHeader from "@/components/PageHeader";
import ExpenseFormDialog from "@/components/ExpenseFormDialog";
import FilterChips from "@/components/FilterChips";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Image } from "@/components/ui/image";
import { money, shortDate } from "@/lib/format";
import { sortRows } from "@/lib/listSort";
import { NAV_ICONS } from "@/lib/navIcons";

const ExpensesIcon = NAV_ICONS.expenses;

/**
 * Expenses — job-linked and unassigned spend with optional receipt photos.
 */
export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [scope, setScope] = useState("all");
  const [sort, setSort] = useState("date");

  const load = useCallback(async () => {
    const [e, j] = await Promise.all([
      api.entities.Expense.list("-created_date", 400),
      api.entities.Job.list("-updated_date", 300),
    ]);
    setExpenses(e);
    setJobs(j);
  }, []);

  useEffect(() => {
    load()
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [load]);

  const jobById = useMemo(() => Object.fromEntries(jobs.map((j) => [j.id, j])), [jobs]);
  const total = useMemo(
    () => expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0),
    [expenses]
  );
  const unassignedRows = useMemo(() => expenses.filter((e) => !e.job_id), [expenses]);
  const linkedRows = useMemo(() => expenses.filter((e) => e.job_id), [expenses]);
  const order = (rows) => sortRows(rows, sort, {
    date: (row) => row.date || row.created_date || "",
    amount: (row) => Number(row.amount) || 0,
    name: (row) => row.vendor || row.category || "",
  });

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (expense) => {
    setEditing(expense);
    setDialogOpen(true);
  };

  const remove = async (expense) => {
    if (!confirm("Delete this expense?")) return;
    await api.entities.Expense.delete(expense.id);
    await load();
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <PageHeader
        title="Expenses"
        description={
          loading
            ? "Track spend by category and job"
            : `${expenses.length} expense${expenses.length === 1 ? "" : "s"} · ${money(total)}${unassignedRows.length ? ` · ${unassignedRows.length} unassigned` : ""}`
        }
        primaryAction={
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={openNew}>
            <Plus className="w-4 h-4 mr-1" /> Add Expense
          </Button>
        }
        secondary={
          <Link to="/receipts" className="text-sm font-medium text-primary hover:underline px-2">
            Receipts
          </Link>
        }
      />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <FilterChips
          label="Expense scope"
          value={scope}
          onChange={setScope}
          options={[
            { id: "all", label: "All" },
            { id: "unassigned", label: "Unassigned" },
            { id: "job", label: "On a job" },
          ]}
        />
        <label className="text-sm text-foreground inline-flex items-center gap-2">
          Sort
          <select
            aria-label="Sort expenses"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-11 rounded-md border border-border bg-card px-2 text-sm"
          >
            <option value="date">Newest</option>
            <option value="amount">Amount</option>
            <option value="name">Vendor</option>
          </select>
        </label>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : expenses.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-xl">
          <ExpensesIcon className="w-12 h-12 mx-auto mb-3 opacity-40" strokeWidth={1.5} />
          <p className="font-medium text-foreground mb-1">No expenses yet</p>
          <p className="text-sm max-w-sm mx-auto mb-4">
            Log materials, fuel, and other job costs. Link to a job when you know it — or leave unassigned.
          </p>
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={openNew}>
            <Plus className="w-4 h-4 mr-1" /> Add Expense
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {scope !== "job" && (
            <section>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">Unassigned queue</h2>
              <p className="text-xs text-muted-foreground mb-2">Not on a job yet. Open one to link it and its receipt.</p>
              {unassignedRows.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">No unassigned expenses.</p>
              ) : (
                <div className="space-y-2">
                  {order(unassignedRows).map((expense) => (
                    <ExpenseRow key={expense.id} expense={expense} job={null} onEdit={openEdit} onDelete={remove} />
                  ))}
                </div>
              )}
            </section>
          )}
          {scope !== "unassigned" && (
            <section>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">On a job</h2>
              {linkedRows.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">No expenses linked to a job.</p>
              ) : (
                <div className="space-y-2">
                  {order(linkedRows).map((expense) => (
                    <ExpenseRow
                      key={expense.id}
                      expense={expense}
                      job={jobById[expense.job_id] || null}
                      onEdit={openEdit}
                      onDelete={remove}
                    />
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      )}

      <ExpenseFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        jobs={jobs}
        expense={editing}
        onSaved={() => load()}
      />
    </div>
  );
}

function ExpenseRow({ expense, job, onEdit, onDelete }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
      {expense.photo_url ? (
        <Image src={expense.photo_url} alt="" className="w-14 h-14 rounded-md object-cover border border-border shrink-0" />
      ) : (
        <div className="w-14 h-14 rounded-md border border-dashed border-border flex items-center justify-center shrink-0 text-muted-foreground">
          <Wallet className="w-5 h-5 opacity-50" />
        </div>
      )}
      <button type="button" className="flex-1 min-w-0 text-left" onClick={() => onEdit(expense)}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="font-semibold text-foreground truncate">
              {expense.category || "Expense"}
              {expense.vendor ? <span className="font-normal text-muted-foreground"> · {expense.vendor}</span> : null}
            </div>
            <div className="text-sm text-muted-foreground mt-0.5">
              {shortDate(expense.date || expense.created_date)}
              {job ? (
                <>
                  {" · "}
                  <Link to={`/jobs/${job.id}`} className="text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                    {job.title}
                  </Link>
                </>
              ) : (
                <span className="text-foreground"> · Unassigned</span>
              )}
              {expense.photo_url ? " · Receipt attached" : ""}
            </div>
            {expense.note ? <div className="text-xs text-muted-foreground mt-1 truncate">{expense.note}</div> : null}
          </div>
          <div className="text-sm font-semibold tabular-nums text-foreground shrink-0">{money(expense.amount)}</div>
        </div>
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="ghost" size="icon" className="h-11 w-11 shrink-0" aria-label={`More actions for ${expense.category || "expense"}`}>
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="text-red-600" onClick={() => onDelete(expense)}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
