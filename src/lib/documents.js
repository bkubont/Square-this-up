export const DOCUMENT_TYPES = [
  { id: "estimate", label: "Estimate", heading: "ESTIMATE", tab: "Estimates", totalLabel: "Estimate Total" },
  { id: "work_order", label: "Work order", heading: "WORK ORDER", tab: "Work Orders", totalLabel: "Amount Due (USD)" },
  { id: "change_order", label: "Change order", heading: "CHANGE ORDER", tab: "Change Orders", totalLabel: "Amount Due (USD)" },
  { id: "material_order", label: "Material order", heading: "MATERIAL ORDER", tab: "Material Orders", totalLabel: "Amount Due (USD)" },
  { id: "invoice", label: "Invoice", heading: "INVOICE", tab: "Invoices", totalLabel: "Amount Due (USD)" },
];

export function documentMeta(type) {
  return DOCUMENT_TYPES.find((item) => item.id === type) || DOCUMENT_TYPES[0];
}

export function blankLine() {
  return { id: crypto.randomUUID(), name: "", description: "", quantity: "", price: "" };
}

export function lineAmount(item) {
  return Number(item.quantity || 0) * Number(item.price || 0);
}

export function documentSubtotal(items) {
  return (items || []).reduce((sum, item) => sum + lineAmount(item), 0);
}

export function documentTotal(doc) {
  return Math.max(0, documentSubtotal(doc?.line_items) - Number(doc?.discount_amount || 0));
}

export function nextDocumentNumber(docs) {
  const max = (docs || []).reduce((highest, doc) => Math.max(highest, Number.parseInt(doc.number, 10) || 0), 0);
  return String(max + 1).padStart(6, "0");
}

export function todayIso() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function longDate(value) {
  const date = new Date(`${value || todayIso()}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

export function toDocumentPayload(form) {
  return {
    type: form.type,
    job_id: form.job_id,
    title: form.title.trim(),
    number: form.number.trim(),
    date: form.date,
    due_date: form.due_date || undefined,
    line_items: form.line_items.map((item) => ({
      id: item.id,
      name: item.name || undefined,
      description: item.description || undefined,
      quantity: item.quantity === "" || item.quantity == null ? undefined : Number(item.quantity),
      price: item.price === "" || item.price == null ? undefined : Number(item.price),
    })),
    discount_label: form.discount_label || undefined,
    discount_amount: form.discount_amount === "" || form.discount_amount == null ? undefined : Number(form.discount_amount),
    notes: form.notes || undefined,
  };
}
