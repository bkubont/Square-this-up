/**
 * Client-local dismissals for attention notifications.
 * No server preference store exists yet — keyed by account user id / email.
 * Fingerprint (detail) so changed items reappear after dismiss.
 */

const STORAGE_PREFIX = "stu.notifications.dismissed.";

function storage() {
  try {
    if (typeof globalThis !== "undefined" && globalThis.localStorage) {
      return globalThis.localStorage;
    }
  } catch {
    /* private mode / denied */
  }
  return null;
}

function storageKey(accountKey) {
  return `${STORAGE_PREFIX}${accountKey || "anon"}`;
}

/**
 * @param {string} accountKey
 * @returns {Record<string, string>}
 */
export function loadDismissals(accountKey) {
  const store = storage();
  if (!store) return {};
  try {
    const raw = store.getItem(storageKey(accountKey));
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

/**
 * @param {string} accountKey
 * @param {Record<string, string>} map
 */
export function saveDismissals(accountKey, map) {
  const store = storage();
  if (!store) return;
  try {
    store.setItem(storageKey(accountKey), JSON.stringify(map));
  } catch {
    /* quota / private mode — ignore */
  }
}

/**
 * Older builds stored a fingerprint string. That means resolved.
 * @param {unknown} value
 * @returns {{ mode: "hide" | "resolved", fingerprint: string } | null}
 */
export function readDismissal(value) {
  if (typeof value === "string") return { mode: "resolved", fingerprint: value };
  if (value && typeof value === "object") {
    const record = /** @type {{ mode?: string, fingerprint?: unknown }} */ (value);
    if (record.mode === "hide" || record.mode === "resolved") {
      return { mode: record.mode, fingerprint: String(record.fingerprint ?? "") };
    }
  }
  return null;
}

/**
 * Hide stays out until the user shows it again.
 * Resolved stays out until the detail fingerprint changes.
 * @param {{ id: string, detail?: string }} item
 * @param {Record<string, unknown>} dismissed
 */
export function isDismissed(item, dismissed) {
  if (!item?.id || !dismissed) return false;
  const entry = readDismissal(dismissed[item.id]);
  if (!entry) return false;
  if (entry.mode === "hide") return true;
  return entry.fingerprint === String(item.detail ?? "");
}

/**
 * @param {{ id: string, detail?: string }} item
 * @param {Record<string, unknown>} dismissed
 * @returns {"hide" | "resolved" | ""}
 */
export function dismissalMode(item, dismissed) {
  const entry = item?.id ? readDismissal(dismissed?.[item.id]) : null;
  if (!entry) return "";
  if (entry.mode === "hide") return "hide";
  return entry.fingerprint === String(item.detail ?? "") ? "resolved" : "";
}

/**
 * @template {{ id: string, detail?: string }} T
 * @param {T[]} items
 * @param {Record<string, unknown>} dismissed
 * @returns {T[]}
 */
export function filterDismissed(items, dismissed) {
  return (items || []).filter((item) => !isDismissed(item, dismissed));
}

/**
 * @param {string} accountKey
 * @param {{ id: string, detail?: string }} item
 * @param {"hide" | "resolved"} [mode]
 * @returns {Record<string, unknown>}
 */
export function dismissItem(accountKey, item, mode = "resolved") {
  const next = {
    ...loadDismissals(accountKey),
    [item.id]: {
      mode: mode === "hide" ? "hide" : "resolved",
      fingerprint: String(item.detail ?? ""),
    },
  };
  saveDismissals(accountKey, next);
  return next;
}

/**
 * @param {string} accountKey
 * @param {string} itemId
 */
export function restoreItem(accountKey, itemId) {
  const next = { ...loadDismissals(accountKey) };
  delete next[itemId];
  saveDismissals(accountKey, next);
  return next;
}

/**
 * @param {string} accountKey
 * @returns {Record<string, string>}
 */
export function clearDismissals(accountKey) {
  saveDismissals(accountKey, {});
  return {};
}
