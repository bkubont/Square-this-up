import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { money } from "@/lib/format";

export default function FinancialPanel({ job, entries = [], onLogPayment }) {
  const [pay, setPay] = useState("");
  const invoice = job.invoice_amount || 0;
  const paid = (job.deposit_amount || 0) + entries.filter((entry) => entry.type === "payment_received").reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
  const balance = invoice - paid;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-slate-50 p-2">
          <div className="text-xs text-slate-500">Invoiced</div>
          <div className="text-sm font-bold text-slate-800">{money(invoice)}</div>
        </div>
        <div className="rounded-lg bg-emerald-50 p-2">
          <div className="text-xs text-emerald-600">Paid</div>
          <div className="text-sm font-bold text-emerald-700">{money(paid)}</div>
        </div>
        <div className="rounded-lg bg-amber-50 p-2">
          <div className="text-xs text-amber-600">Balance</div>
          <div className="text-sm font-bold text-amber-700">{money(Math.max(0, balance))}</div>
        </div>
      </div>
      <div className="pt-2 border-t border-slate-100">
        <label className="text-xs font-medium text-slate-500 mb-1 block">Log a payment received</label>
        <div className="flex gap-2">
          <Input type="number" value={pay} onChange={(e) => setPay(e.target.value)} placeholder="Amount" className="text-sm" />
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500" onClick={() => { if (pay) onLogPayment(Number(pay)); setPay(""); }}>Log</Button>
        </div>
      </div>
    </div>
  );
}
