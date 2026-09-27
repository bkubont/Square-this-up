import React, { useState } from "react";
import { Link } from "react-router-dom";
import { CircleHelp } from "lucide-react";
import BrokenSquareMark from "@/components/BrokenSquareMark";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { PRODUCT_NAME } from "@/lib/brand";

const SECTIONS = [
  {
    title: "Dashboard",
    body: "Start with Needs Attention, then the money groups, active jobs, and recent activity.",
    to: "/",
    linkLabel: "Open Dashboard",
  },
  {
    title: "A job",
    body: "Overview holds the quote and the documents (estimate, change orders, invoice). Tasks is the work. Costs is what you spent. Photos, Notes, and Timeline are the record of what happened. Record a payment from Overview when money comes in.",
    to: "/jobs/active",
    linkLabel: "Open Jobs",
  },
  {
    title: "Jobs still open",
    body: "Jobs still in progress, awaiting approval, or awaiting payment stay on the working lists. Paid, declined, and cancelled jobs move to the archive.",
    to: "/jobs/active",
    linkLabel: "Open Jobs",
  },
  {
    title: "Customers",
    body: "Customers is the directory. A job’s customer name opens that customer.",
    to: "/clients",
    linkLabel: "Open Customers",
  },
  {
    title: "Schedule",
    body: "Day, week, and agenda views from job start dates.",
    to: "/schedule",
    linkLabel: "Open Schedule",
  },
  {
    title: "Expenses & receipts",
    body: "Log spend under Expenses. Receipt photos that are not on a job yet sit in the Receipts inbox until you attach one.",
    to: "/receipts",
    linkLabel: "Receipts inbox",
  },
  {
    title: "Reports",
    body: "Issued invoices, uninvoiced deposits, and unbilled work are separate. Open a number to see the records in it.",
    to: "/reports",
    linkLabel: "Open Reports",
  },
];

/**
 * In-app field-oriented help from the top-bar help control (no external Zendesk).
 */
export default function HelpPanel() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          aria-label="Help"
          title="Help"
        >
          <CircleHelp className="w-4 h-4" strokeWidth={1.75} />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0 gap-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border text-left space-y-2">
          <div className="flex items-center gap-2">
            <BrokenSquareMark state="open" size={16} tone="brand" />
            <SheetTitle className="text-brand">Help</SheetTitle>
          </div>
          <SheetDescription>
            Short field guide for {PRODUCT_NAME} — where things live and what to do next.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {SECTIONS.map((section) => (
            <section key={section.title} className="space-y-1.5">
              <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{section.body}</p>
              {section.to ? (
                <Link
                  to={section.to}
                  onClick={() => setOpen(false)}
                  className="inline-block text-xs font-semibold text-primary hover:underline pt-0.5"
                >
                  {section.linkLabel} →
                </Link>
              ) : null}
            </section>
          ))}

          <section className="pt-2 border-t border-border space-y-1.5">
            <h3 className="text-sm font-semibold text-foreground">System health</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If something looks offline, check the API health endpoint for a quick ok signal.
            </p>
            <a
              href="/api/health"
              target="_blank"
              rel="noreferrer"
              className="inline-block text-xs font-semibold text-primary hover:underline"
            >
              Open /api/health →
            </a>
          </section>
        </div>

        <div className="px-6 py-3 border-t border-border text-[11px] text-muted-foreground">
          Brand blue <span className="font-mono text-brand">#0504AA</span> · gold for attention only
        </div>
      </SheetContent>
    </Sheet>
  );
}
