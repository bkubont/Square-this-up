import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUSES = ["Estimate", "Accepted", "Scheduled", "In Progress", "Waiting on Materials", "Completed", "Paid"];

export default function JobFormDialog({ open, onOpenChange, onSave, job = null, clients, defaultClientId = "" }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "Estimate",
    client_id: "",
    start_date: "",
    end_date: "",
    deposit_amount: "",
    notes: "",
  });

  useEffect(() => {
    if (open) {
      setForm({
        title: job?.title || "",
        description: job?.description || "",
        status: job?.status || "Estimate",
        client_id: job?.client_id || defaultClientId || "",
        start_date: job?.start_date || "",
        end_date: job?.end_date || "",
        deposit_amount: job?.deposit_amount ?? "",
        notes: job?.notes || "",
      });
    }
  }, [open, job, defaultClientId]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    if (!form.title?.trim() || !form.client_id) return;
    onSave({
      title: form.title.trim(),
      description: form.description,
      status: form.status,
      client_id: form.client_id,
      start_date: form.start_date || undefined,
      end_date: form.end_date || undefined,
      deposit_amount: form.deposit_amount ? Number(form.deposit_amount) : undefined,
      notes: form.notes,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{job ? "Edit Job" : "New Job"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Title *</Label>
            <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Kitchen faucet replacement" />
          </div>
          <div>
            <Label>Client *</Label>
            <Select value={form.client_id} onValueChange={(v) => set("client_id", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger>
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
            <div>
              <Label>Deposit $</Label>
              <Input type="number" value={form.deposit_amount} onChange={(e) => set("deposit_amount", e.target.value)} placeholder="0" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Start date</Label>
              <Input type="date" value={form.start_date} onChange={(e) => set("start_date", e.target.value)} />
            </div>
            <div>
              <Label>End date</Label>
              <Input type="date" value={form.end_date} onChange={(e) => set("end_date", e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} className="bg-slate-900 hover:bg-slate-800">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}