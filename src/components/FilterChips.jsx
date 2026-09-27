import React from "react";
import { cn } from "@/lib/utils";

/**
 * @param {{ options: { id: string, label: string }[], value: string, onChange: (id: string) => void, label?: string }} props
 */
export default function FilterChips({ options, value, onChange, label }) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={label || "Filter"}>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          aria-pressed={value === option.id}
          onClick={() => onChange(option.id)}
          className={cn(
            "h-11 px-3 rounded-full border text-sm font-medium",
            value === option.id
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-foreground border-border",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/**
 * @param {{ value: string, onChange: (id: string) => void, options: { id: string, label: string }[], label?: string }} props
 */
export function SortSelect({ value, onChange, options, label = "Sort" }) {
  return (
    <label className="text-sm text-foreground inline-flex items-center gap-2">
      {label}
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 rounded-md border border-border bg-card px-2 text-sm"
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

export const JOB_SORTS = [
  { id: "updated", label: "Recently updated" },
  { id: "title", label: "Title" },
  { id: "customer", label: "Customer" },
  { id: "status", label: "Status" },
];
