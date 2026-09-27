/**
 * Job spend counted once.
 * An expense is the record. A receipt photo that points at that expense
 * (same photo or expense id) is not added again. Material-order rollups stay out.
 */

function dollars(value) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
}

function isReceipt(entry) {
  return entry?.type === "receipt" || entry?.category === "receipt";
}

/**
 * @param {{ expenses?: object[], timeline?: object[] }} input
 */
export function loggedSpend({ expenses = [], timeline = [] } = {}) {
  const linkedPhotos = new Set();
  const linkedIds = new Set();
  let expenseTotal = 0;
  for (const expense of expenses) {
    expenseTotal += Number(expense?.amount) || 0;
    if (expense?.photo_url) linkedPhotos.add(expense.photo_url);
    if (expense?.id) linkedIds.add(expense.id);
  }
  let receiptOnly = 0;
  for (const entry of timeline) {
    if (!isReceipt(entry)) continue;
    if (entry.expense_id && linkedIds.has(entry.expense_id)) continue;
    if (entry.photo_url && linkedPhotos.has(entry.photo_url)) continue;
    const amount = Number(entry.amount);
    if (Number.isFinite(amount) && amount > 0) receiptOnly += amount;
  }
  return {
    expenses: dollars(expenseTotal),
    receiptOnly: dollars(receiptOnly),
    total: dollars(expenseTotal + receiptOnly),
  };
}
