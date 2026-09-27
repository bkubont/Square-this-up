/** True when estimates and invoices have no company name to print. */
export function companyProfileNeedsSetup(profile) {
  if (!profile) return true;
  return !String(profile.name || "").trim();
}
