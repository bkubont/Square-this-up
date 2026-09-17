import React from "react";
import { Image as ImageIcon, Receipt, FileText, DollarSign, StickyNote, CheckSquare, RefreshCw } from "lucide-react";
import { Image } from "@/components/ui/image";
import { timeAgo } from "@/lib/format";
import { money } from "@/lib/format";
import { cn } from "@/lib/utils";

const ICONS = {
  note: StickyNote,
  photo: ImageIcon,
  receipt: Receipt,
  document: FileText,
  estimate_sent: FileText,
  deposit_received: DollarSign,
  invoice_sent: FileText,
  payment_received: DollarSign,
  status_change: RefreshCw,
  checklist: CheckSquare,
};

const TINT = {
  note: "bg-slate-100 text-slate-600",
  photo: "bg-blue-100 text-blue-600",
  receipt: "bg-orange-100 text-orange-600",
  document: "bg-purple-100 text-purple-600",
  estimate_sent: "bg-purple-100 text-purple-600",
  deposit_received: "bg-emerald-100 text-emerald-600",
  invoice_sent: "bg-purple-100 text-purple-600",
  payment_received: "bg-emerald-100 text-emerald-600",
  status_change: "bg-amber-100 text-amber-600",
  checklist: "bg-blue-100 text-blue-600",
};

export default function TimelineFeed({ entries }) {
  if (!entries?.length) {
    return (
      <div className="text-center py-12 text-slate-400">
        <StickyNote className="w-10 h-10 mx-auto mb-2 opacity-40" />
        <p className="text-sm">No activity yet. Upload a photo or add a note.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((e) => {
        const Icon = ICONS[e.type] || StickyNote;
        return (
          <div key={e.id} className="flex gap-3">
            <div className={cn("w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0", TINT[e.type])}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0 pb-4 border-b border-slate-100 last:border-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-slate-800 capitalize">
                  {e.type.replace(/_/g, " ")}
                </span>
                <span className="text-xs text-slate-400 whitespace-nowrap">{timeAgo(e.created_date)}</span>
              </div>
              {e.text && <p className="text-sm text-slate-600 mt-0.5 whitespace-pre-wrap">{e.text}</p>}
              {e.amount != null && (
                <p className="text-sm font-semibold text-emerald-600 mt-0.5">{money(e.amount)}</p>
              )}
              {e.photo_url && (
                <div className="mt-2 rounded-lg overflow-hidden border border-slate-200 max-w-xs">
                  <Image src={e.photo_url} fittingType="fill" className="w-full h-40" alt={e.text || "photo"} />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}